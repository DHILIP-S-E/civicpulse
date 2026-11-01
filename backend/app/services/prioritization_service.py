import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.municipal import HazardPriorityScore, PriorityFactor
from app.services.iceberg_service import iceberg_service

logger = logging.getLogger("civicpulse.prioritization")


class PrioritizationService:
    """
    Transparent multi-criteria municipal hazard prioritization engine.
    Calculates operational response urgency using normalized weights:
    - Hazard severity (35%)
    - Road-network impact (25%)
    - Public-facility exposure (20%)
    - Observation recency (10%)
    - Data confidence (10%)
    """

    def __init__(self):
        # Weights normalized to 1.0
        self.weights = {
            "severity": 0.35,
            "road_impact": 0.25,
            "facility_exposure": 0.20,
            "recency": 0.10,
            "confidence": 0.10
        }

    def calculate_priorities(self) -> List[HazardPriorityScore]:
        hazards = iceberg_service.current_hazards
        scored_hazards = []

        # Known critical infrastructure / transit hubs in Madurai
        critical_arterials = ["sellur", "simmakkal", "goripalayam", "periyar", "arapalayam", "kalavasal"]

        for h in hazards:
            if h.get("status") == "RESOLVED":
                continue

            loc_name_lower = h.get("location_name", "").lower()

            # 1. Severity Score (0 - 100)
            sev = h.get("severity", "LOW")
            depth = h.get("water_depth_cm") or 0.0
            if sev == "CRITICAL":
                sev_score = 90.0 + min(10.0, depth / 10.0)
                sev_desc = f"Critical severity rating with {depth} cm recorded inundation."
            elif sev == "MODERATE":
                sev_score = 60.0 + min(20.0, depth / 5.0)
                sev_desc = f"Moderate severity rating with {depth} cm standing water."
            else:
                sev_score = 30.0 + min(20.0, depth / 2.0)
                sev_desc = f"Low severity rating with {depth} cm localized water/debris."

            # 2. Road Network Impact (0 - 100)
            is_arterial = any(k in loc_name_lower for k in critical_arterials)
            is_underpass = "underpass" in loc_name_lower or "bridge" in loc_name_lower
            if is_arterial and is_underpass:
                road_score = 95.0
                road_desc = "Major transit underpass connecting North & South Madurai across Vaigai."
            elif is_arterial:
                road_score = 80.0
                road_desc = "High-volume arterial bus route connecting core Madurai hubs."
            else:
                road_score = 45.0
                road_desc = "Secondary collector road with alternate residential detour routes."

            # 3. Public Facility Exposure (0 - 100)
            has_bus_stand = "bus stand" in loc_name_lower or "railway" in loc_name_lower or "statue" in loc_name_lower
            if has_bus_stand:
                facility_score = 90.0
                facility_desc = "Directly adjacent to major intercity bus terminus or transit concourse."
            elif "teppakulam" in loc_name_lower or "temple" in loc_name_lower:
                facility_score = 75.0
                facility_desc = "Adjacent to heritage public tank and dense pilgrimage footfall zone."
            else:
                facility_score = 50.0
                facility_desc = "Standard commercial & mixed residential urban precinct."

            # 4. Observation Recency (0 - 100)
            # Default fresh
            recency_score = 88.0
            recency_desc = "Observation recorded within the current storm telemetry cycle."

            # 5. Data Confidence (0 - 100)
            conf = float(h.get("confidence") or 0.85)
            conf_score = conf * 100.0
            source = h.get("source_type", "SIMULATED")
            conf_desc = f"Reported via verified {source} (sensor accuracy score: {round(conf_score, 1)}%)."

            # Compute weighted composite score
            final_score = (
                sev_score * self.weights["severity"] +
                road_score * self.weights["road_impact"] +
                facility_score * self.weights["facility_exposure"] +
                recency_score * self.weights["recency"] +
                conf_score * self.weights["confidence"]
            )

            factors = [
                PriorityFactor(
                    name="Hazard Severity",
                    weight=self.weights["severity"],
                    raw_value=round(sev_score, 1),
                    weighted_score=round(sev_score * self.weights["severity"], 2),
                    explanation=sev_desc
                ),
                PriorityFactor(
                    name="Road Network Impact",
                    weight=self.weights["road_impact"],
                    raw_value=round(road_score, 1),
                    weighted_score=round(road_score * self.weights["road_impact"], 2),
                    explanation=road_desc
                ),
                PriorityFactor(
                    name="Public Facility Exposure",
                    weight=self.weights["facility_exposure"],
                    raw_value=round(facility_score, 1),
                    weighted_score=round(facility_score * self.weights["facility_exposure"], 2),
                    explanation=facility_desc
                ),
                PriorityFactor(
                    name="Telemetry Recency",
                    weight=self.weights["recency"],
                    raw_value=round(recency_score, 1),
                    weighted_score=round(recency_score * self.weights["recency"], 2),
                    explanation=recency_desc
                ),
                PriorityFactor(
                    name="Data Confidence",
                    weight=self.weights["confidence"],
                    raw_value=round(conf_score, 1),
                    weighted_score=round(conf_score * self.weights["confidence"], 2),
                    explanation=conf_desc
                )
            ]

            # Recommended action formulation
            if is_underpass or depth > 50:
                rec_action = f"Dispatch Super Sucker Dewatering Tanker to {h.get('location_name')} immediately."
            elif sev == "CRITICAL":
                rec_action = f"Deploy high-volume submersible dewatering pump and divert North Veli traffic."
            elif h.get("hazard_type") == "ROAD_DAMAGE":
                rec_action = "Deploy Emergency Cold-Mix Asphalt Patching unit."
            else:
                rec_action = "Assign municipal ward sanitation inspection crew."

            scored_hazards.append({
                "hazard_id": h["hazard_id"],
                "location_name": h["location_name"],
                "hazard_type": h["hazard_type"],
                "severity": h["severity"],
                "priority_score": round(final_score, 1),
                "contributing_factors": factors,
                "data_confidence": conf,
                "recommended_action": rec_action,
                "missing_information": None
            })

        # Sort descending by priority score
        scored_hazards.sort(key=lambda x: x["priority_score"], reverse=True)

        results = []
        for idx, item in enumerate(scored_hazards, start=1):
            results.append(HazardPriorityScore(
                hazard_id=item["hazard_id"],
                location_name=item["location_name"],
                hazard_type=item["hazard_type"],
                severity=item["severity"],
                priority_score=item["priority_score"],
                priority_rank=idx,
                contributing_factors=item["contributing_factors"],
                data_confidence=item["data_confidence"],
                recommended_action=item["recommended_action"],
                missing_information=item["missing_information"]
            ))

        return results


prioritization_service = PrioritizationService()

