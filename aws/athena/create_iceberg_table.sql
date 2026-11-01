-- ==============================================================================
-- CivicPulse: Madurai Spatial Lakehouse — Apache Iceberg Table DDL
-- Database: civicpulse_db
-- Table: civic_hazards_iceberg
-- Engine: Amazon Athena (Athena engine version 3 / Presto / Trino)
-- Format: Apache Iceberg v2 on Parquet
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS civicpulse_db
COMMENT 'CivicPulse Madurai Spatial Lakehouse Catalog'
LOCATION 's3://${AWS_S3_BUCKET}/civicpulse/warehouse/';

CREATE TABLE IF NOT EXISTS civicpulse_db.civic_hazards_iceberg (
    hazard_id           VARCHAR,
    location_name       VARCHAR,
    hazard_type         VARCHAR,
    severity            VARCHAR,
    status              VARCHAR,
    geometry_json       VARCHAR,
    longitude           DOUBLE,
    latitude            DOUBLE,
    water_depth_cm      DOUBLE,
    observed_at         TIMESTAMP,
    updated_at          TIMESTAMP,
    source_type         VARCHAR,
    source_reference    VARCHAR,
    confidence          DOUBLE,
    simulation_id       VARCHAR,
    created_at          TIMESTAMP
)
PARTITIONED BY (status, bucket(10, hazard_id))
LOCATION 's3://${AWS_S3_BUCKET}/civicpulse/warehouse/civic_hazards_iceberg/'
TBLPROPERTIES (
    'table_type'='ICEBERG',
    'format'='parquet',
    'write_compression'='snappy',
    'write.object-storage.enabled'='true',
    'history.expire.max-snapshot-age-ms'='604800000', -- 7 days retention
    'history.expire.min-snapshots-to-keep'='10'
);
