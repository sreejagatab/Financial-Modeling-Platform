"""Dependency graph for financial model calculations."""

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

import re


@dataclass
class CellReference:
    """Reference to a cell in the model."""

    sheet_name: str
    address: str  # A1 notation
    row: int
    column: int

    @classmethod
    def from_address(cls, address: str, sheet_name: str = "") -> "CellReference":
        """Parse a cell address into a CellReference.

        Args:
            address: Cell address in A1 notation (e.g., "A1", "Sheet1!B2")
            sheet_name: Default sheet name if not specified in address

        Returns:
            CellReference instance
        """
        # Check for sheet prefix
        if "!" in address:
            parts = address.split("!")
            sheet_name = parts[0].strip("'")
            address = parts[1]

        # Parse column and row from A1 notation
        match = re.match(r"^\$?([A-Z]+)\$?(\d+)$", address.upper())
        if not match:
            raise ValueError(f"Invalid cell address: {address}")

        col_str, row_str = match.groups()
        row = int(row_str)

        # Convert column letters to number (A=1, B=2, ..., AA=27, etc.)
        column = 0
        for char in col_str:
            column = column * 26 + (ord(char) - ord("A") + 1)

        return cls(
            sheet_name=sheet_name,
            address=f"{col_str}{row}",
            row=row,
            column=column,
        )

    @property
    def full_address(self) -> str:
        """Get the full address including sheet name."""
        if self.sheet_name:
            return f"'{self.sheet_name}'!{self.address}"
        return self.address


@dataclass
class FormulaNode:
    """A node in the calculation graph representing a formula cell."""

    cell_ref: CellReference
    formula: str
    formula_ast: Optional[dict] = None
    dependencies: list[CellReference] = field(default_factory=list)
    value: Any = None
    is_calculated: bool = False
    error: Optional[str] = None


class CalculationGraph:
    """Directed acyclic graph for cell dependencies and calculation order.

    Manages the dependency relationships between cells and determines
    the correct order for recalculation when inputs change.
    """

    def __init__(self):
        # cell_id -> FormulaNode
        self._nodes: dict[str, FormulaNode] = {}

        # cell_id -> set of cell_ids that depend on this cell
        self._dependents: dict[str, set[str]] = defaultdict(set)

        # cell_id -> set of cell_ids this cell depends on
        self._dependencies: dict[str, set[str]] = defaultdict(set)

        # Cached topological order
        self._topo_order: Optional[list[str]] = None
        self._order_valid: bool = False

    def _cell_id(self, ref: CellReference) -> str:
        """Generate a unique cell ID from a reference."""
        return f"{ref.sheet_name}!{ref.address}"

    def add_cell(
        self,
        cell_ref: CellReference,
        formula: str,
        dependencies: list[CellReference],
        formula_ast: Optional[dict] = None,
    ) -> None:
        """Add or update a cell in the calculation graph.

        Args:
            cell_ref: Reference to the cell
            formula: Formula string
            dependencies: List of cells this formula depends on
            formula_ast: Optional parsed AST of the formula
        """
        cell_id = self._cell_id(cell_ref)

        # Remove old dependencies if cell already exists
        if cell_id in self._nodes:
            for dep_ref in self._nodes[cell_id].dependencies:
                dep_id = self._cell_id(dep_ref)
                self._dependents[dep_id].discard(cell_id)
            self._dependencies[cell_id].clear()

        # Create/update node
        node = FormulaNode(
            cell_ref=cell_ref,
            formula=formula,
            formula_ast=formula_ast,
            dependencies=dependencies,
        )
        self._nodes[cell_id] = node

        # Update dependency tracking
        for dep_ref in dependencies:
            dep_id = self._cell_id(dep_ref)
            self._dependents[dep_id].add(cell_id)
            self._dependencies[cell_id].add(dep_id)

        # Invalidate cached order
        self._order_valid = False

    def remove_cell(self, cell_ref: CellReference) -> None:
        """Remove a cell from the calculation graph.

        Args:
            cell_ref: Reference to the cell to remove
        """
        cell_id = self._cell_id(cell_ref)

        if cell_id not in self._nodes:
            return

        # Remove from dependents of dependencies
        for dep_id in self._dependencies[cell_id]:
            self._dependents[dep_id].discard(cell_id)

        # Remove from dependencies of dependents
        for dependent_id in self._dependents[cell_id]:
            self._dependencies[dependent_id].discard(cell_id)

        # Remove node and tracking
        del self._nodes[cell_id]
        del self._dependencies[cell_id]
        del self._dependents[cell_id]

        self._order_valid = False

    def get_affected_cells(self, changed_cell: CellReference) -> set[str]:
        """Get all cells that need recalculation when a cell changes.

        Args:
            changed_cell: The cell that was modified

        Returns:
            Set of cell IDs that need recalculation
        """
        cell_id = self._cell_id(changed_cell)
        affected = set()

        # BFS to find all dependent cells
        queue = [cell_id]
        while queue:
            current = queue.pop(0)
            for dependent in self._dependents[current]:
                if dependent not in affected:
                    affected.add(dependent)
                    queue.append(dependent)

        return affected

    def topological_sort(self) -> list[str]:
        """Get cells in topological order for calculation.

        Returns:
            List of cell IDs in dependency order

        Raises:
            ValueError: If a circular dependency is detected
        """
        if self._order_valid and self._topo_order is not None:
            return self._topo_order

        # Kahn's algorithm for topological sort
        in_degree: dict[str, int] = {
            cell_id: len(deps) for cell_id, deps in self._dependencies.items()
        }

        # Add nodes with no dependencies
        for cell_id in self._nodes:
            if cell_id not in in_degree:
                in_degree[cell_id] = 0

        # Queue of cells with no remaining dependencies
        queue = [cell_id for cell_id, degree in in_degree.items() if degree == 0]
        result = []

        while queue:
            current = queue.pop(0)
            result.append(current)

            for dependent in self._dependents[current]:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)

        # Check for circular dependencies
        if len(result) != len(self._nodes):
            remaining = set(self._nodes.keys()) - set(result)
            raise ValueError(
                f"Circular dependency detected involving cells: {remaining}"
            )

        self._topo_order = result
        self._order_valid = True
        return result

    def get_calculation_order(
        self, changed_cells: list[CellReference]
    ) -> list[str]:
        """Get the calculation order for a set of changed cells.

        Args:
            changed_cells: List of cells that were modified

        Returns:
            List of cell IDs to recalculate in order
        """
        # Get all affected cells
        affected = set()
        for cell in changed_cells:
            affected.update(self.get_affected_cells(cell))

        # Filter topological order to only affected cells
        full_order = self.topological_sort()
        return [cell_id for cell_id in full_order if cell_id in affected]

    def detect_circular_dependencies(self) -> list[list[str]]:
        """Detect all circular dependencies in the graph.

        Returns:
            List of cycles, where each cycle is a list of cell IDs
        """
        cycles = []
        visited = set()
        rec_stack = set()
        path = []

        def dfs(cell_id: str) -> bool:
            visited.add(cell_id)
            rec_stack.add(cell_id)
            path.append(cell_id)

            for dependent in self._dependents[cell_id]:
                if dependent not in visited:
                    if dfs(dependent):
                        return True
                elif dependent in rec_stack:
                    # Found cycle
                    cycle_start = path.index(dependent)
                    cycles.append(path[cycle_start:] + [dependent])
                    return False

            path.pop()
            rec_stack.remove(cell_id)
            return False

        for cell_id in self._nodes:
            if cell_id not in visited:
                dfs(cell_id)

        return cycles

    def get_node(self, cell_ref: CellReference) -> Optional[FormulaNode]:
        """Get the node for a cell reference.

        Args:
            cell_ref: Reference to the cell

        Returns:
            FormulaNode or None if not found
        """
        return self._nodes.get(self._cell_id(cell_ref))

    def set_value(self, cell_ref: CellReference, value: Any) -> None:
        """Set the calculated value for a cell.

        Args:
            cell_ref: Reference to the cell
            value: Calculated value
        """
        cell_id = self._cell_id(cell_ref)
        if cell_id in self._nodes:
            self._nodes[cell_id].value = value
            self._nodes[cell_id].is_calculated = True

    def get_value(self, cell_ref: CellReference) -> Any:
        """Get the current value of a cell.

        Args:
            cell_ref: Reference to the cell

        Returns:
            Current value or None
        """
        node = self.get_node(cell_ref)
        return node.value if node else None

    def reset_calculations(self) -> None:
        """Reset all calculated values."""
        for node in self._nodes.values():
            node.is_calculated = False
            node.value = None
            node.error = None


def parse_formula_dependencies(formula: str) -> list[str]:
    """Extract cell references from a formula string.

    Args:
        formula: Formula string (e.g., "=A1+B2*SUM(C1:C10)")

    Returns:
        List of cell addresses referenced in the formula
    """
    if not formula.startswith("="):
        return []

    # Pattern to match cell references (including sheet prefixes)
    # Matches: A1, $A$1, Sheet1!A1, 'Sheet Name'!A1, A1:B10
    pattern = r"(?:'[^']+'\!|\w+\!)?\$?[A-Z]+\$?\d+"

    matches = re.findall(pattern, formula.upper())

    # Expand ranges (A1:B10 -> A1, A2, ..., B10)
    expanded = []
    for match in matches:
        if ":" in match:
            # Handle ranges
            start, end = match.split(":")
            # For simplicity, just include both endpoints
            expanded.extend([start, end])
        else:
            expanded.append(match)

    return list(set(expanded))  # Remove duplicates
