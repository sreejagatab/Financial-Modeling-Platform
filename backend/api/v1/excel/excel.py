"""Excel Add-in API endpoints for syncing with Excel workbooks."""

from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
import json

from fastapi import APIRouter, HTTPException, status, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

router = APIRouter(prefix="/excel", tags=["Excel"])


# ===== Request/Response Models =====

class FetchValueRequest(BaseModel):
    """Request to fetch a value from a model."""
    modelPath: str
    reference: str
    version: str = "latest"


class FetchValueResponse(BaseModel):
    """Response with fetched value."""
    value: Any
    timestamp: str
    version: Optional[int] = None


class CreateLinkRequest(BaseModel):
    """Request to create a bidirectional link."""
    modelPath: str
    reference: str
    clientId: str


class CreateLinkResponse(BaseModel):
    """Response for link creation."""
    value: Any
    linkId: str
    timestamp: str


class ScenarioValueRequest(BaseModel):
    """Request for scenario-specific value."""
    scenario: str
    reference: str


class SyncOperation(BaseModel):
    """A sync operation from Excel."""
    type: str  # 'update', 'delete', 'insert'
    address: str
    value: Optional[Any] = None
    formula: Optional[str] = None
    timestamp: str
    clientId: str
    modelPath: Optional[str] = None


class SyncBatchRequest(BaseModel):
    """Batch of sync operations."""
    operations: List[SyncOperation]


class SensitivityRequest(BaseModel):
    """Request for sensitivity analysis."""
    inputAddress: str
    outputAddress: str
    steps: int = 10
    variationPercent: float = 20.0


class SensitivityResponse(BaseModel):
    """Response with sensitivity matrix."""
    matrix: List[List[Any]]


class AuditRequest(BaseModel):
    """Request for audit information."""
    reference: str
    field: str = "last_modified_by"


class AuditResponse(BaseModel):
    """Response with audit info."""
    value: str


class CommentRequest(BaseModel):
    """Request for cell comments."""
    reference: str


class CommentResponse(BaseModel):
    """Response with comments."""
    latestComment: Optional[str] = None


class UnlinkRequest(BaseModel):
    """Request to unlink a cell."""
    localAddress: str
    clientId: str


# ===== In-Memory Storage (Would be DB in production) =====

# Store for linked cells: {client_id: {address: link_info}}
linked_cells: Dict[str, Dict[str, Dict[str, Any]]] = {}

# Store for cell values: {model_path: {reference: value_info}}
cell_values: Dict[str, Dict[str, Dict[str, Any]]] = {}

# Store for scenarios: {scenario_name: {reference: value}}
scenario_values: Dict[str, Dict[str, Any]] = {}

# WebSocket connections: {client_id: websocket}
websocket_connections: Dict[str, WebSocket] = {}


# ===== Helper Functions =====

def get_mock_value(model_path: str, reference: str) -> Any:
    """Get a mock value for demonstration."""
    # Check if we have a stored value
    if model_path in cell_values and reference in cell_values[model_path]:
        return cell_values[model_path][reference].get("value", 0)

    # Generate mock values based on reference
    if "A" in reference:
        return 1000000 + hash(model_path + reference) % 100000
    elif "B" in reference:
        return round((hash(model_path + reference) % 100) / 10, 2)
    elif "C" in reference:
        return f"Label_{reference}"
    else:
        return hash(model_path + reference) % 10000


def calculate_sensitivity_matrix(
    input_value: float,
    output_value: float,
    steps: int,
    variation_percent: float
) -> List[List[Any]]:
    """Calculate a sensitivity matrix."""
    matrix = []

    # Header row
    header = ["Input \\ Output"]
    step_size = variation_percent / (steps / 2)

    for i in range(steps):
        pct = -variation_percent + i * step_size
        header.append(f"{pct:+.1f}%")
    matrix.append(header)

    # Data rows
    for row_idx in range(steps):
        row_pct = -variation_percent + row_idx * step_size
        row_input = input_value * (1 + row_pct / 100)
        row = [f"{row_pct:+.1f}%"]

        for col_idx in range(steps):
            col_pct = -variation_percent + col_idx * step_size
            # Simple linear interpolation for demo
            sensitivity = output_value * (1 + row_pct / 100) * (1 + col_pct / 200)
            row.append(round(sensitivity, 2))

        matrix.append(row)

    return matrix


async def broadcast_to_clients(message: Dict[str, Any], exclude_client: Optional[str] = None):
    """Broadcast a message to all connected WebSocket clients."""
    disconnected = []

    for client_id, ws in websocket_connections.items():
        if client_id != exclude_client:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(client_id)

    # Clean up disconnected clients
    for client_id in disconnected:
        websocket_connections.pop(client_id, None)


# ===== API Endpoints =====

@router.post("/get-value", response_model=FetchValueResponse)
async def get_value(request: FetchValueRequest):
    """Fetch a value from a model."""
    try:
        value = get_mock_value(request.modelPath, request.reference)

        return FetchValueResponse(
            value=value,
            timestamp=datetime.utcnow().isoformat(),
            version=1
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get value: {str(e)}"
        )


@router.post("/create-link", response_model=CreateLinkResponse)
async def create_link(request: CreateLinkRequest):
    """Create a bidirectional link between Excel and a model cell."""
    try:
        # Initialize client storage if needed
        if request.clientId not in linked_cells:
            linked_cells[request.clientId] = {}

        # Create link
        link_id = f"{request.clientId}:{request.modelPath}:{request.reference}"
        linked_cells[request.clientId][request.reference] = {
            "modelPath": request.modelPath,
            "linkId": link_id,
            "createdAt": datetime.utcnow().isoformat(),
        }

        # Get current value
        value = get_mock_value(request.modelPath, request.reference)

        return CreateLinkResponse(
            value=value,
            linkId=link_id,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create link: {str(e)}"
        )


@router.post("/scenario-value")
async def get_scenario_value(request: ScenarioValueRequest):
    """Get a value from a specific scenario."""
    try:
        # Check for stored scenario value
        if request.scenario in scenario_values:
            if request.reference in scenario_values[request.scenario]:
                return {"value": scenario_values[request.scenario][request.reference]}

        # Generate mock scenario-adjusted value
        base_value = get_mock_value("default", request.reference)

        # Adjust based on scenario type
        multiplier = 1.0
        if "bull" in request.scenario.lower() or "upside" in request.scenario.lower():
            multiplier = 1.2
        elif "bear" in request.scenario.lower() or "downside" in request.scenario.lower():
            multiplier = 0.8
        elif "stress" in request.scenario.lower():
            multiplier = 0.6

        if isinstance(base_value, (int, float)):
            adjusted_value = base_value * multiplier
        else:
            adjusted_value = base_value

        return {"value": adjusted_value}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scenario value: {str(e)}"
        )


@router.post("/sync")
async def sync_cell(operation: SyncOperation):
    """Sync a cell change from Excel."""
    try:
        # Store the value
        model_path = operation.modelPath or "default"
        if model_path not in cell_values:
            cell_values[model_path] = {}

        if operation.type == "delete":
            cell_values[model_path].pop(operation.address, None)
        else:
            cell_values[model_path][operation.address] = {
                "value": operation.value,
                "formula": operation.formula,
                "updatedAt": operation.timestamp,
                "updatedBy": operation.clientId,
            }

        # Broadcast to other clients
        await broadcast_to_clients(
            {
                "type": "cell_sync",
                "payload": operation.dict()
            },
            exclude_client=operation.clientId
        )

        return {"success": True, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )


@router.post("/sync-batch")
async def sync_batch(request: SyncBatchRequest):
    """Sync a batch of cell changes."""
    results = []

    for operation in request.operations:
        try:
            model_path = operation.modelPath or "default"
            if model_path not in cell_values:
                cell_values[model_path] = {}

            if operation.type == "delete":
                cell_values[model_path].pop(operation.address, None)
            else:
                cell_values[model_path][operation.address] = {
                    "value": operation.value,
                    "formula": operation.formula,
                    "updatedAt": operation.timestamp,
                    "updatedBy": operation.clientId,
                }

            results.append({"address": operation.address, "success": True})
        except Exception as e:
            results.append({"address": operation.address, "success": False, "error": str(e)})

    # Broadcast updates
    if request.operations:
        await broadcast_to_clients(
            {
                "type": "batch_sync",
                "payload": {"operations": [op.dict() for op in request.operations]}
            },
            exclude_client=request.operations[0].clientId
        )

    return {"results": results, "timestamp": datetime.utcnow().isoformat()}


@router.post("/sensitivity", response_model=SensitivityResponse)
async def calculate_sensitivity(request: SensitivityRequest):
    """Calculate a sensitivity analysis matrix."""
    try:
        # Get base values
        input_value = get_mock_value("default", request.inputAddress)
        output_value = get_mock_value("default", request.outputAddress)

        # Ensure we have numeric values
        if not isinstance(input_value, (int, float)):
            input_value = 100
        if not isinstance(output_value, (int, float)):
            output_value = 1000

        matrix = calculate_sensitivity_matrix(
            float(input_value),
            float(output_value),
            request.steps,
            request.variationPercent
        )

        return SensitivityResponse(matrix=matrix)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity calculation failed: {str(e)}"
        )


@router.post("/audit", response_model=AuditResponse)
async def get_audit_info(request: AuditRequest):
    """Get audit information for a cell."""
    try:
        # Look up cell info
        for model_path in cell_values.values():
            if request.reference in model_path:
                cell_info = model_path[request.reference]

                if request.field == "last_modified_by":
                    return AuditResponse(value=cell_info.get("updatedBy", "Unknown"))
                elif request.field == "last_modified_at":
                    return AuditResponse(value=cell_info.get("updatedAt", "Unknown"))
                elif request.field == "version":
                    return AuditResponse(value="1")

        # Default response
        if request.field == "last_modified_by":
            return AuditResponse(value="System")
        elif request.field == "last_modified_at":
            return AuditResponse(value=datetime.utcnow().isoformat())
        else:
            return AuditResponse(value="N/A")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audit info: {str(e)}"
        )


@router.post("/comments", response_model=CommentResponse)
async def get_comments(request: CommentRequest):
    """Get comments for a cell."""
    try:
        # In production, this would query a comments database
        # For now, return mock data
        mock_comments = {
            "A1": "Revenue assumption - verify with management",
            "B2": "EBITDA margin seems aggressive",
            "C3": "Updated per Q3 actuals",
        }

        return CommentResponse(latestComment=mock_comments.get(request.reference))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get comments: {str(e)}"
        )


@router.post("/unlink")
async def unlink_cell(request: UnlinkRequest):
    """Remove a cell link."""
    try:
        if request.clientId in linked_cells:
            linked_cells[request.clientId].pop(request.localAddress, None)

        return {"success": True, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlink: {str(e)}"
        )


@router.get("/links/{client_id}")
async def get_client_links(client_id: str):
    """Get all links for a client."""
    return {
        "links": linked_cells.get(client_id, {}),
        "timestamp": datetime.utcnow().isoformat()
    }


# ===== WebSocket Endpoint =====

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time sync."""
    await websocket.accept()
    client_id = None

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "authenticate":
                client_id = message["payload"].get("clientId")
                if client_id:
                    websocket_connections[client_id] = websocket
                    await websocket.send_json({
                        "type": "authenticated",
                        "payload": {"clientId": client_id}
                    })

            elif message["type"] == "subscribe":
                # Handle live data subscription
                payload = message["payload"]
                # In production, this would set up a subscription to the data source
                await websocket.send_json({
                    "type": "subscribed",
                    "payload": payload
                })

            elif message["type"] == "unsubscribe":
                # Handle unsubscription
                await websocket.send_json({
                    "type": "unsubscribed",
                    "payload": message["payload"]
                })

            elif message["type"] == "cell_update":
                # Handle cell update from client
                operation = message["payload"]

                # Store and broadcast
                model_path = operation.get("modelPath", "default")
                if model_path not in cell_values:
                    cell_values[model_path] = {}

                cell_values[model_path][operation["address"]] = {
                    "value": operation.get("value"),
                    "formula": operation.get("formula"),
                    "updatedAt": datetime.utcnow().isoformat(),
                    "updatedBy": client_id,
                }

                # Broadcast to other clients
                await broadcast_to_clients(
                    {"type": "cell_sync", "payload": operation},
                    exclude_client=client_id
                )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if client_id:
            websocket_connections.pop(client_id, None)
