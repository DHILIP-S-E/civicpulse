import logging
import math
from typing import List, Dict, Any, Optional
import boto3
from botocore.exceptions import ClientError, BotoCoreError

from app.core.config import settings

logger = logging.getLogger("civicpulse.location")


class LocationService:
    """
    Integrates with Amazon Location Service:
    - Places (SearchPlaceIndexForText, GetPlace)
    - Routes (CalculateRoute)
    - Geofences (BatchEvaluateGeofences, PutGeofence)
    Gracefully falls back to deterministic Madurai topology in demo mode.
    """

    def __init__(self):
        self.region = settings.AWS_REGION
        self.place_index = settings.AWS_LOCATION_PLACE_INDEX
        self.route_calculator = settings.AWS_LOCATION_ROUTE_CALCULATOR
        self.geofence_collection = settings.AWS_LOCATION_GEOFENCE_COLLECTION
        self.is_live = settings.APP_MODE.lower() == "live"
        self._location_client = None

    @property
    def client(self):
        if self._location_client is None and self.is_live:
            try:
                self._location_client = boto3.client("location", region_name=self.region)
            except Exception as e:
                logger.warning(f"Could not initialize Boto3 Location client: {e}. Falling back to demo mode.")
                self.is_live = False
        return self._location_client

    def search_places(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search for places in Madurai using Amazon Location Places or demo catalog.
        """
        if self.is_live and self.client:
            try:
                response = self.client.search_place_index_for_text(
                    IndexName=self.place_index,
                    Text=query,
                    BiasPosition=[78.1198, 9.9252],  # Madurai center
                    MaxResults=max_results
                )
                results = []
                for item in response.get("Results", []):
                    place = item.get("Place", {})
                    coords = place.get("Geometry", {}).get("Point", [78.1198, 9.9252])
                    results.append({
                        "place_id": item.get("PlaceId", f"aws-plc-{coords[0]}-{coords[1]}"),
                        "name": place.get("Label", query),
                        "address": place.get("AddressNumber", "") + " " + place.get("Street", ""),
                        "category": place.get("Categories", ["Urban Location"])[0] if place.get("Categories") else "Urban Location",
                        "longitude": coords[0],
                        "latitude": coords[1],
                        "source": "Amazon Location Places"
                    })
                if results:
                    return results
            except (ClientError, BotoCoreError) as e:
                logger.warning(f"Amazon Location Place search failed ({e}), falling back to local demo catalog.")

        # Local catalog search
        from app.services.iceberg_service import iceberg_service
        all_places = iceberg_service.places
        query_lower = query.lower().strip()
        matched = []
        for p in all_places:
            if query_lower in p["name"].lower() or query_lower in p["address"].lower() or query_lower in p.get("category", "").lower():
                matched.append({**p, "source": "Madurai Demo Place Catalog"})
            elif not query_lower:
                matched.append({**p, "source": "Madurai Demo Place Catalog"})

        return matched[:max_results] if matched else [
            {**p, "source": "Madurai Demo Place Catalog"} for p in all_places[:max_results]
        ]

    def get_place(self, place_id: str) -> Optional[Dict[str, Any]]:
        from app.services.iceberg_service import iceberg_service
        for p in iceberg_service.places:
            if p["place_id"] == place_id:
                return {**p, "source": "Madurai Demo Place Catalog"}
        return None

    def evaluate_geofences_aws(self, device_id: str, position: List[float]) -> Optional[Dict[str, Any]]:
        """
        Sends device position to Amazon Location Geofencing BatchEvaluateGeofences.
        """
        if not self.is_live or not self.client:
            return None

        try:
            response = self.client.batch_evaluate_geofences(
                CollectionName=self.geofence_collection,
                DevicePositionUpdates=[
                    {
                        "DeviceId": device_id,
                        "Position": position,  # [lng, lat]
                        "SampleTime": "2026-11-01T10:00:00Z"
                    }
                ]
            )
            return response
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Amazon Location BatchEvaluateGeofences failed: {e}")
            return None


location_service = LocationService()

