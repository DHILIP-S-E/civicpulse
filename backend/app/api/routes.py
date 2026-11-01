from fastapi import APIRouter, HTTPException

from app.schemas.route import RouteCompareRequest, RouteCompareResponse
from app.services.routing_service import routing_service
from app.services.iceberg_service import iceberg_service

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("/compare", response_model=RouteCompareResponse)
def compare_routes(request: RouteCompareRequest):
    """
    Computes both the direct standard route and a hazard-avoiding alternative corridor.
    Performs verified spatial intersections with all active Apache Iceberg hazard polygons.
    """
    try:
        response = routing_service.compare_routes(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate route comparison: {str(e)}")
