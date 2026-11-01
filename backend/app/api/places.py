from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional

from app.services.location_service import location_service

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("/search")
def search_places(
    q: str = Query(default="", description="Search query string"),
    limit: int = Query(default=5, ge=1, le=20)
):
    results = location_service.search_places(query=q, max_results=limit)
    return {
        "query": q,
        "count": len(results),
        "results": results
    }


@router.get("/{place_id}")
def get_place(place_id: str):
    place = location_service.get_place(place_id)
    if not place:
        raise HTTPException(status_code=404, detail=f"Place {place_id} not found.")
    return place

