import pytest
from app.services.prioritization_service import prioritization_service


def test_prioritization_calculation():
    priorities = prioritization_service.calculate_priorities()
    assert len(priorities) > 0

    # Ensure ranked in strictly descending order of priority score
    scores = [p.priority_score for p in priorities]
    assert scores == sorted(scores, reverse=True)

    top_hazard = priorities[0]
    assert top_hazard.priority_rank == 1
    assert top_hazard.priority_score >= 0.0
    assert top_hazard.priority_score <= 100.0
    assert len(top_hazard.contributing_factors) == 5

    # Check contributing factor sum
    weight_sum = sum(f.weight for f in top_hazard.contributing_factors)
    assert abs(weight_sum - 1.0) < 0.001
