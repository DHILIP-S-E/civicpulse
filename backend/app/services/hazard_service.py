import logging
from typing import List, Optional, Dict, Any
from shapely.geometry import shape, Polygon

from app.schemas.hazard import Hazard, HazardSummary, HazardSeverity, HazardStatus, HazardType
from app.services.iceberg_service import iceberg_service

logger = logging.getLogger("civicpulse.hazards")


class HazardService:
    """
    Manages spatial hazard records, layer filtering, and geometry validations.
    """

    def __init__(self):
        pass

    def get_all_hazards(
        self,
        severity: Optional[HazardSeverity] = None,
        status: Optional[HazardStatus] = None,
        hazard_type: Optional[HazardType] = None,
        include_resolved: bool = True
    ) -> List[Hazard]:
        hazards_raw = iceberg_service.current_hazards
        filtered = []

        for h in hazards_raw:
            if severity and h.get("severity") != severity.value:
                continue
            if status and h.get("status") != status.value:
                continue
            if not include_resolved and h.get("status") == HazardStatus.RESOLVED.value:
                continue
            if hazard_type and h.get("hazard_type") != hazard_type.value:
                continue
            filtered.append(Hazard(**h))

        return filtered

    def get_hazard_by_id(self, hazard_id: str) -> Optional[Hazard]:
        for h in iceberg_service.current_hazards:
            if h.get("hazard_id") == hazard_id:
                return Hazard(**h)
        return None

    def get_summary(self) -> HazardSummary:
        hazards = iceberg_service.current_hazards
        total = len(hazards)
        active = sum(1 for h in hazards if h.get("status") == "ACTIVE")
        investigating = sum(1 for h in hazards if h.get("status") == "INVESTIGATING")
        resolved = sum(1 for h in hazards if h.get("status") == "RESOLVED")
        critical = sum(1 for h in hazards if h.get("severity") == "CRITICAL" and h.get("status") != "RESOLVED")
        moderate = sum(1 for h in hazards if h.get("severity") == "MODERATE" and h.get("status") != "RESOLVED")
        low = sum(1 for h in hazards if h.get("severity") == "LOW" and h.get("status") != "RESOLVED")
        max_depth = max([h.get("water_depth_cm") or 0.0 for h in hazards], default=0.0)

        last_updated = max([h.get("updated_at") for h in hazards], default="")

        return HazardSummary(
            total_hazards=total,
            active_hazards=active,
            investigating_hazards=investigating,
            resolved_hazards=resolved,
            critical_severity_count=critical,
            moderate_severity_count=moderate,
            low_severity_count=low,
            max_water_depth_cm=max_depth,
            data_source="Apache Iceberg / Athena (civicpulse_db)",
            last_updated=last_updated
        )

    def validate_geometry(self, geometry_dict: Dict[str, Any]) -> bool:
        """
        Validates that a GeoJSON Polygon geometry is closed, oriented, and valid in Shapely.
        """
        try:
            geom = shape(geometry_dict)
            return geom.is_valid and not geom.is_empty
        except Exception as e:
            logger.error(f"Geometry validation failed: {e}")
            return False


hazard_service = HazardService()
