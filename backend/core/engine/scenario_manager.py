"""Scenario management for financial models."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, Generic, List, Optional, TypeVar
from uuid import uuid4
import copy


class ScenarioType(Enum):
    """Type of scenario."""
    BASE = "base"
    UPSIDE = "upside"
    DOWNSIDE = "downside"
    MANAGEMENT = "management"
    STRESS = "stress"
    CUSTOM = "custom"


@dataclass
class ScenarioAssumption:
    """An assumption override for a scenario."""

    name: str
    base_value: Any
    scenario_value: Any
    description: str = ""
    category: str = "general"
    unit: str = ""
    percent_change: Optional[float] = None

    def __post_init__(self):
        """Calculate percent change if not provided."""
        if self.percent_change is None and self.base_value and isinstance(self.base_value, (int, float)):
            if self.base_value != 0:
                self.percent_change = (self.scenario_value - self.base_value) / self.base_value


@dataclass
class Scenario:
    """A named set of assumption overrides."""

    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    scenario_type: ScenarioType = ScenarioType.CUSTOM
    description: str = ""
    assumptions: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    created_by: str = ""
    is_active: bool = True
    parent_scenario_id: Optional[str] = None  # For scenario branching
    probability_weight: float = 0.0  # For probability-weighted analysis


@dataclass
class ScenarioComparison:
    """Comparison of results across scenarios."""

    scenarios: List[str] = field(default_factory=list)
    metrics: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    variance_from_base: Dict[str, Dict[str, float]] = field(default_factory=dict)


@dataclass
class SensitivityConfig:
    """Configuration for sensitivity analysis."""

    input_name: str
    min_value: float
    max_value: float
    steps: int = 11
    output_names: List[str] = field(default_factory=list)


T = TypeVar("T")


class ScenarioManager(Generic[T]):
    """Manages scenarios for financial models.

    Handles scenario creation, storage, comparison, and
    probability-weighted analysis.
    """

    def __init__(self, base_inputs: T):
        """Initialize with base case inputs.

        Args:
            base_inputs: The base case input object for the model
        """
        self._base_inputs = copy.deepcopy(base_inputs)
        self._scenarios: Dict[str, Scenario] = {}
        self._results_cache: Dict[str, Any] = {}

        # Create base scenario
        self._base_scenario = Scenario(
            name="Base Case",
            scenario_type=ScenarioType.BASE,
            description="Base case scenario",
            assumptions={},
            probability_weight=1.0,
        )
        self._scenarios[self._base_scenario.id] = self._base_scenario

    @property
    def base_scenario_id(self) -> str:
        """Get the base scenario ID."""
        return self._base_scenario.id

    def create_scenario(
        self,
        name: str,
        scenario_type: ScenarioType,
        assumptions: Dict[str, Any],
        description: str = "",
        probability_weight: float = 0.0,
        parent_scenario_id: Optional[str] = None,
        created_by: str = "",
    ) -> Scenario:
        """Create a new scenario.

        Args:
            name: Scenario name
            scenario_type: Type of scenario
            assumptions: Dictionary of assumption overrides (input_name -> value)
            description: Optional description
            probability_weight: Weight for probability analysis (0-1)
            parent_scenario_id: Optional parent for branching
            created_by: User who created the scenario

        Returns:
            Created Scenario object
        """
        scenario = Scenario(
            name=name,
            scenario_type=scenario_type,
            description=description,
            assumptions=assumptions,
            probability_weight=probability_weight,
            parent_scenario_id=parent_scenario_id,
            created_by=created_by,
        )

        self._scenarios[scenario.id] = scenario
        return scenario

    def get_scenario(self, scenario_id: str) -> Optional[Scenario]:
        """Get a scenario by ID."""
        return self._scenarios.get(scenario_id)

    def list_scenarios(self) -> List[Scenario]:
        """List all scenarios."""
        return list(self._scenarios.values())

    def update_scenario(
        self,
        scenario_id: str,
        name: Optional[str] = None,
        assumptions: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None,
        probability_weight: Optional[float] = None,
    ) -> Optional[Scenario]:
        """Update an existing scenario."""
        scenario = self._scenarios.get(scenario_id)
        if not scenario:
            return None

        if name is not None:
            scenario.name = name
        if assumptions is not None:
            scenario.assumptions = assumptions
        if description is not None:
            scenario.description = description
        if probability_weight is not None:
            scenario.probability_weight = probability_weight

        # Invalidate cached results
        if scenario_id in self._results_cache:
            del self._results_cache[scenario_id]

        return scenario

    def delete_scenario(self, scenario_id: str) -> bool:
        """Delete a scenario. Cannot delete base scenario."""
        if scenario_id == self._base_scenario.id:
            return False

        if scenario_id in self._scenarios:
            del self._scenarios[scenario_id]
            if scenario_id in self._results_cache:
                del self._results_cache[scenario_id]
            return True

        return False

    def get_scenario_inputs(self, scenario_id: str) -> Optional[T]:
        """Get the modified inputs for a scenario.

        Args:
            scenario_id: ID of the scenario

        Returns:
            Modified input object with scenario assumptions applied
        """
        scenario = self._scenarios.get(scenario_id)
        if not scenario:
            return None

        # Start with deep copy of base inputs
        inputs = copy.deepcopy(self._base_inputs)

        # Apply parent scenario first if it exists
        if scenario.parent_scenario_id:
            parent = self._scenarios.get(scenario.parent_scenario_id)
            if parent:
                inputs = self._apply_assumptions(inputs, parent.assumptions)

        # Apply this scenario's assumptions
        inputs = self._apply_assumptions(inputs, scenario.assumptions)

        return inputs

    def _apply_assumptions(self, inputs: T, assumptions: Dict[str, Any]) -> T:
        """Apply assumption overrides to an input object."""
        for key, value in assumptions.items():
            # Handle nested attributes with dot notation
            parts = key.split(".")
            obj = inputs

            for part in parts[:-1]:
                if hasattr(obj, part):
                    obj = getattr(obj, part)
                else:
                    break

            if hasattr(obj, parts[-1]):
                setattr(obj, parts[-1], value)

        return inputs

    def compare_scenarios(
        self,
        scenario_ids: List[str],
        calculate_fn: Callable[[T], Dict[str, Any]],
        output_names: List[str],
    ) -> ScenarioComparison:
        """Compare results across multiple scenarios.

        Args:
            scenario_ids: List of scenario IDs to compare
            calculate_fn: Function that takes inputs and returns outputs dict
            output_names: List of output metric names to compare

        Returns:
            ScenarioComparison with metrics for each scenario
        """
        comparison = ScenarioComparison()

        # Calculate base case first
        base_results = {}
        if self._base_scenario.id in scenario_ids:
            base_results = calculate_fn(self._base_inputs)
            self._results_cache[self._base_scenario.id] = base_results

        for scenario_id in scenario_ids:
            scenario = self._scenarios.get(scenario_id)
            if not scenario:
                continue

            comparison.scenarios.append(scenario.name)

            # Get or calculate results
            if scenario_id in self._results_cache:
                results = self._results_cache[scenario_id]
            else:
                inputs = self.get_scenario_inputs(scenario_id)
                if inputs:
                    results = calculate_fn(inputs)
                    self._results_cache[scenario_id] = results
                else:
                    results = {}

            # Extract metrics
            for output_name in output_names:
                if output_name not in comparison.metrics:
                    comparison.metrics[output_name] = {}
                    comparison.variance_from_base[output_name] = {}

                value = self._get_nested_value(results, output_name)
                comparison.metrics[output_name][scenario.name] = value

                # Calculate variance from base
                if base_results and scenario_id != self._base_scenario.id:
                    base_value = self._get_nested_value(base_results, output_name)
                    if isinstance(value, (int, float)) and isinstance(base_value, (int, float)):
                        if base_value != 0:
                            variance = (value - base_value) / base_value
                        else:
                            variance = 0.0
                        comparison.variance_from_base[output_name][scenario.name] = variance

        return comparison

    def _get_nested_value(self, data: Dict, key: str) -> Any:
        """Get a nested value using dot notation."""
        parts = key.split(".")
        value = data

        for part in parts:
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None

        return value

    def probability_weighted_output(
        self,
        calculate_fn: Callable[[T], Dict[str, Any]],
        output_names: List[str],
    ) -> Dict[str, float]:
        """Calculate probability-weighted outputs across all scenarios.

        Args:
            calculate_fn: Function that takes inputs and returns outputs dict
            output_names: List of output metric names to weight

        Returns:
            Dictionary of probability-weighted values
        """
        weighted_results = {name: 0.0 for name in output_names}
        total_weight = 0.0

        for scenario in self._scenarios.values():
            if not scenario.is_active or scenario.probability_weight <= 0:
                continue

            inputs = self.get_scenario_inputs(scenario.id)
            if not inputs:
                continue

            results = calculate_fn(inputs)

            for output_name in output_names:
                value = self._get_nested_value(results, output_name)
                if isinstance(value, (int, float)):
                    weighted_results[output_name] += value * scenario.probability_weight

            total_weight += scenario.probability_weight

        # Normalize by total weight
        if total_weight > 0:
            for name in weighted_results:
                weighted_results[name] /= total_weight

        return weighted_results

    def run_sensitivity(
        self,
        config: SensitivityConfig,
        calculate_fn: Callable[[T], Dict[str, Any]],
    ) -> Dict[str, List[tuple]]:
        """Run sensitivity analysis on a single input.

        Args:
            config: Sensitivity configuration
            calculate_fn: Function that takes inputs and returns outputs dict

        Returns:
            Dictionary mapping output names to list of (input_value, output_value) tuples
        """
        import numpy as np

        results = {name: [] for name in config.output_names}
        input_values = np.linspace(config.min_value, config.max_value, config.steps)

        for input_val in input_values:
            # Create temporary inputs with modified value
            inputs = copy.deepcopy(self._base_inputs)
            inputs = self._apply_assumptions(inputs, {config.input_name: input_val})

            outputs = calculate_fn(inputs)

            for output_name in config.output_names:
                output_val = self._get_nested_value(outputs, output_name)
                results[output_name].append((float(input_val), output_val))

        return results

    def run_monte_carlo(
        self,
        variable_distributions: Dict[str, tuple],  # name -> (distribution_type, params)
        calculate_fn: Callable[[T], Dict[str, Any]],
        output_names: List[str],
        iterations: int = 1000,
    ) -> Dict[str, Dict[str, float]]:
        """Run Monte Carlo simulation.

        Args:
            variable_distributions: Dict of input name to (distribution, params)
                Supported distributions: "normal" (mean, std), "uniform" (low, high),
                "triangular" (low, mode, high)
            calculate_fn: Function that takes inputs and returns outputs dict
            output_names: Output metrics to track
            iterations: Number of simulation runs

        Returns:
            Dictionary of output name to statistics (mean, std, p5, p50, p95)
        """
        import numpy as np

        results = {name: [] for name in output_names}

        for _ in range(iterations):
            # Generate random values
            random_assumptions = {}

            for var_name, (dist_type, params) in variable_distributions.items():
                if dist_type == "normal":
                    mean, std = params
                    random_assumptions[var_name] = np.random.normal(mean, std)
                elif dist_type == "uniform":
                    low, high = params
                    random_assumptions[var_name] = np.random.uniform(low, high)
                elif dist_type == "triangular":
                    low, mode, high = params
                    random_assumptions[var_name] = np.random.triangular(low, mode, high)

            # Calculate with random inputs
            inputs = copy.deepcopy(self._base_inputs)
            inputs = self._apply_assumptions(inputs, random_assumptions)

            try:
                outputs = calculate_fn(inputs)

                for output_name in output_names:
                    value = self._get_nested_value(outputs, output_name)
                    if isinstance(value, (int, float)):
                        results[output_name].append(value)
            except Exception:
                continue

        # Calculate statistics
        statistics = {}
        for name, values in results.items():
            if values:
                arr = np.array(values)
                statistics[name] = {
                    "mean": float(np.mean(arr)),
                    "std": float(np.std(arr)),
                    "p5": float(np.percentile(arr, 5)),
                    "p25": float(np.percentile(arr, 25)),
                    "p50": float(np.percentile(arr, 50)),
                    "p75": float(np.percentile(arr, 75)),
                    "p95": float(np.percentile(arr, 95)),
                    "min": float(np.min(arr)),
                    "max": float(np.max(arr)),
                }
            else:
                statistics[name] = {}

        return statistics

    def create_standard_scenarios(
        self,
        upside_pct: float = 0.15,
        downside_pct: float = -0.15,
        key_drivers: List[str] = None,
    ) -> List[Scenario]:
        """Create standard upside/downside scenarios.

        Args:
            upside_pct: Percentage improvement for upside case
            downside_pct: Percentage decline for downside case
            key_drivers: List of input names to vary

        Returns:
            List of created scenarios
        """
        if key_drivers is None:
            key_drivers = []

        scenarios = []

        # Upside scenario
        upside_assumptions = {}
        for driver in key_drivers:
            base_val = getattr(self._base_inputs, driver, None)
            if isinstance(base_val, (int, float)):
                upside_assumptions[driver] = base_val * (1 + upside_pct)
            elif isinstance(base_val, list):
                upside_assumptions[driver] = [v * (1 + upside_pct) if isinstance(v, (int, float)) else v for v in base_val]

        upside = self.create_scenario(
            name="Upside Case",
            scenario_type=ScenarioType.UPSIDE,
            assumptions=upside_assumptions,
            description=f"+{upside_pct:.0%} on key drivers",
            probability_weight=0.25,
        )
        scenarios.append(upside)

        # Downside scenario
        downside_assumptions = {}
        for driver in key_drivers:
            base_val = getattr(self._base_inputs, driver, None)
            if isinstance(base_val, (int, float)):
                downside_assumptions[driver] = base_val * (1 + downside_pct)
            elif isinstance(base_val, list):
                downside_assumptions[driver] = [v * (1 + downside_pct) if isinstance(v, (int, float)) else v for v in base_val]

        downside = self.create_scenario(
            name="Downside Case",
            scenario_type=ScenarioType.DOWNSIDE,
            assumptions=downside_assumptions,
            description=f"{downside_pct:.0%} on key drivers",
            probability_weight=0.25,
        )
        scenarios.append(downside)

        # Update base case weight
        self._base_scenario.probability_weight = 0.50

        return scenarios

    def export_scenarios(self) -> List[Dict[str, Any]]:
        """Export all scenarios to a serializable format."""
        return [
            {
                "id": s.id,
                "name": s.name,
                "type": s.scenario_type.value,
                "description": s.description,
                "assumptions": s.assumptions,
                "probability_weight": s.probability_weight,
                "parent_scenario_id": s.parent_scenario_id,
                "created_at": s.created_at.isoformat(),
                "created_by": s.created_by,
                "is_active": s.is_active,
            }
            for s in self._scenarios.values()
        ]

    def import_scenarios(self, data: List[Dict[str, Any]]) -> int:
        """Import scenarios from serialized format.

        Returns:
            Number of scenarios imported
        """
        count = 0
        for item in data:
            if item.get("type") == ScenarioType.BASE.value:
                continue  # Don't import base case

            scenario = Scenario(
                id=item.get("id", str(uuid4())),
                name=item["name"],
                scenario_type=ScenarioType(item["type"]),
                description=item.get("description", ""),
                assumptions=item.get("assumptions", {}),
                probability_weight=item.get("probability_weight", 0.0),
                parent_scenario_id=item.get("parent_scenario_id"),
                created_by=item.get("created_by", ""),
                is_active=item.get("is_active", True),
            )

            if "created_at" in item:
                scenario.created_at = datetime.fromisoformat(item["created_at"])

            self._scenarios[scenario.id] = scenario
            count += 1

        return count
