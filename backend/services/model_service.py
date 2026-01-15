"""Financial model service for database operations."""

from typing import Optional
from uuid import uuid4

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models.financial_model import (
    FinancialModel,
    Sheet,
    Cell,
    CellValue,
    Scenario,
    ModelVersion,
    ModelType,
    SheetPurpose,
    CellType,
    DataType,
)


class ModelService:
    """Service for financial model CRUD operations."""

    @staticmethod
    async def create_model(
        db: AsyncSession,
        name: str,
        model_type: ModelType,
        owner_id: str,
        description: str | None = None,
    ) -> FinancialModel:
        """Create a new financial model."""
        model = FinancialModel(
            id=str(uuid4()),
            name=name,
            model_type=model_type.value if isinstance(model_type, ModelType) else model_type,
            owner_id=owner_id,
            description=description,
        )
        db.add(model)
        await db.flush()
        await db.refresh(model)
        return model

    @staticmethod
    async def get_model(
        db: AsyncSession,
        model_id: str,
        include_sheets: bool = False,
    ) -> Optional[FinancialModel]:
        """Get a financial model by ID."""
        query = select(FinancialModel).where(FinancialModel.id == model_id)
        if include_sheets:
            query = query.options(selectinload(FinancialModel.sheets))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_models(
        db: AsyncSession,
        owner_id: str | None = None,
        model_type: ModelType | None = None,
        include_archived: bool = False,
        limit: int = 100,
        offset: int = 0,
    ) -> list[FinancialModel]:
        """List financial models with optional filters."""
        query = select(FinancialModel)

        conditions = []
        if owner_id:
            conditions.append(FinancialModel.owner_id == owner_id)
        if model_type:
            conditions.append(FinancialModel.model_type == model_type.value)
        if not include_archived:
            conditions.append(FinancialModel.is_archived == False)

        if conditions:
            query = query.where(and_(*conditions))

        query = query.offset(offset).limit(limit).order_by(FinancialModel.updated_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_model(
        db: AsyncSession,
        model: FinancialModel,
        name: str | None = None,
        description: str | None = None,
        settings: dict | None = None,
    ) -> FinancialModel:
        """Update a financial model."""
        if name is not None:
            model.name = name
        if description is not None:
            model.description = description
        if settings is not None:
            model.settings = settings

        await db.flush()
        await db.refresh(model)
        return model

    @staticmethod
    async def delete_model(db: AsyncSession, model: FinancialModel) -> bool:
        """Delete a financial model (soft delete by archiving)."""
        model.is_archived = True
        await db.flush()
        return True

    @staticmethod
    async def hard_delete_model(db: AsyncSession, model: FinancialModel) -> bool:
        """Permanently delete a financial model."""
        await db.delete(model)
        await db.flush()
        return True

    @staticmethod
    async def create_sheet(
        db: AsyncSession,
        model_id: str,
        name: str,
        purpose: SheetPurpose,
        index: int = 0,
    ) -> Sheet:
        """Create a new sheet in a model."""
        sheet = Sheet(
            id=str(uuid4()),
            model_id=model_id,
            name=name,
            purpose=purpose.value if isinstance(purpose, SheetPurpose) else purpose,
            index=index,
        )
        db.add(sheet)
        await db.flush()
        await db.refresh(sheet)
        return sheet

    @staticmethod
    async def get_sheets(db: AsyncSession, model_id: str) -> list[Sheet]:
        """Get all sheets for a model."""
        result = await db.execute(
            select(Sheet)
            .where(Sheet.model_id == model_id)
            .order_by(Sheet.index)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_cell(
        db: AsyncSession,
        sheet_id: str,
        address: str,
        row: int,
        column: int,
        cell_type: CellType = CellType.INPUT,
        data_type: DataType = DataType.NUMBER,
        name: str | None = None,
    ) -> Cell:
        """Create a new cell in a sheet."""
        cell = Cell(
            id=str(uuid4()),
            sheet_id=sheet_id,
            address=address,
            row=row,
            column=column,
            cell_type=cell_type.value if isinstance(cell_type, CellType) else cell_type,
            data_type=data_type.value if isinstance(data_type, DataType) else data_type,
            name=name,
        )
        db.add(cell)
        await db.flush()
        await db.refresh(cell)
        return cell

    @staticmethod
    async def update_cell_value(
        db: AsyncSession,
        cell_id: str,
        raw_value: str | None,
        formula: str | None,
        changed_by: str,
        calculated_value: str | None = None,
        dependencies: list[str] | None = None,
    ) -> CellValue:
        """Update or create a cell value."""
        # Get latest version for this cell
        result = await db.execute(
            select(CellValue)
            .where(CellValue.cell_id == cell_id)
            .order_by(CellValue.version.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        new_version = (latest.version + 1) if latest else 1

        cell_value = CellValue(
            id=str(uuid4()),
            cell_id=cell_id,
            version=new_version,
            raw_value=raw_value,
            formula=formula,
            calculated_value=calculated_value,
            dependencies=dependencies or [],
            changed_by=changed_by,
        )
        db.add(cell_value)
        await db.flush()
        await db.refresh(cell_value)
        return cell_value

    @staticmethod
    async def get_cells_with_values(
        db: AsyncSession,
        sheet_id: str,
    ) -> list[tuple[Cell, CellValue | None]]:
        """Get all cells with their latest values for a sheet."""
        # Get all cells
        cells_result = await db.execute(
            select(Cell).where(Cell.sheet_id == sheet_id)
        )
        cells = list(cells_result.scalars().all())

        result = []
        for cell in cells:
            # Get latest value for each cell
            value_result = await db.execute(
                select(CellValue)
                .where(CellValue.cell_id == cell.id)
                .order_by(CellValue.version.desc())
                .limit(1)
            )
            value = value_result.scalar_one_or_none()
            result.append((cell, value))

        return result

    @staticmethod
    async def create_scenario(
        db: AsyncSession,
        model_id: str,
        name: str,
        scenario_type: str = "custom",
        description: str | None = None,
        assumptions_override: dict | None = None,
    ) -> Scenario:
        """Create a new scenario for a model."""
        scenario = Scenario(
            id=str(uuid4()),
            model_id=model_id,
            name=name,
            scenario_type=scenario_type,
            description=description,
            assumptions_override=assumptions_override or {},
        )
        db.add(scenario)
        await db.flush()
        await db.refresh(scenario)
        return scenario

    @staticmethod
    async def get_scenarios(db: AsyncSession, model_id: str) -> list[Scenario]:
        """Get all scenarios for a model."""
        result = await db.execute(
            select(Scenario)
            .where(Scenario.model_id == model_id, Scenario.is_active == True)
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_version(
        db: AsyncSession,
        model_id: str,
        author_id: str,
        message: str,
        snapshot_ref: str,
        parent_version_id: str | None = None,
    ) -> ModelVersion:
        """Create a new version (commit) for a model."""
        # Get next version number
        result = await db.execute(
            select(ModelVersion)
            .where(ModelVersion.model_id == model_id)
            .order_by(ModelVersion.version_number.desc())
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        new_version_number = (latest.version_number + 1) if latest else 1

        version = ModelVersion(
            id=str(uuid4()),
            model_id=model_id,
            version_number=new_version_number,
            parent_version_id=parent_version_id or (latest.id if latest else None),
            message=message,
            author_id=author_id,
            snapshot_ref=snapshot_ref,
        )
        db.add(version)
        await db.flush()
        await db.refresh(version)
        return version

    @staticmethod
    async def get_versions(db: AsyncSession, model_id: str) -> list[ModelVersion]:
        """Get all versions for a model."""
        result = await db.execute(
            select(ModelVersion)
            .where(ModelVersion.model_id == model_id)
            .order_by(ModelVersion.version_number.desc())
        )
        return list(result.scalars().all())
