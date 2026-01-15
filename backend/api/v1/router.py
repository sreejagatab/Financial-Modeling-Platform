"""API v1 router aggregation."""

from fastapi import APIRouter

from api.v1.auth.auth import router as auth_router
from api.v1.models.financial_models import router as models_router
from api.v1.valuations.valuations import router as valuations_router
from api.v1.deals.deals import router as deals_router
from api.v1.collaboration.comments import router as collaboration_router
from api.v1.exports.export import router as export_router
from api.v1.excel.excel import router as excel_router
from api.v1.industry.industry import router as industry_router
from api.v1.bespoke.bespoke import router as bespoke_router
from api.v1.due_diligence.due_diligence import router as dd_router

api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth_router)
api_router.include_router(models_router, prefix="/models", tags=["models"])
api_router.include_router(valuations_router, prefix="/valuations", tags=["valuations"])
api_router.include_router(deals_router, prefix="/deals", tags=["deals"])
api_router.include_router(collaboration_router)
api_router.include_router(export_router)
api_router.include_router(excel_router)
api_router.include_router(industry_router)
api_router.include_router(bespoke_router)
api_router.include_router(dd_router)
