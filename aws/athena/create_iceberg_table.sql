-- ==============================================================================
-- CivicPulse: Madurai Spatial Lakehouse — Apache Iceberg Table DDL
-- Database: civicpulse_db
-- Table: civic_hazards_iceberg
-- Engine: Amazon Athena (Athena engine version 3)
-- Format: Apache Iceberg v2 on Parquet
-- ==============================================================================

CREATE TABLE IF NOT EXISTS civicpulse_db.civic_hazards_iceberg (
    hazard_id           STRING,
    location_name       STRING,
    hazard_type         STRING,
    severity            STRING,
    status              STRING,
    geometry_json       STRING,
    longitude           DOUBLE,
    latitude            DOUBLE,
    water_depth_cm      DOUBLE,
    observed_at         TIMESTAMP,
    updated_at          TIMESTAMP,
    source_type         STRING,
    source_reference    STRING,
    confidence          DOUBLE,
    simulation_id       STRING,
    created_at          TIMESTAMP
)
PARTITIONED BY (status)
LOCATION 's3://${AWS_S3_BUCKET}/civicpulse/warehouse/civic_hazards_iceberg/'
TBLPROPERTIES (
    'table_type'='ICEBERG',
    'format'='parquet',
    'write_compression'='snappy'
);
