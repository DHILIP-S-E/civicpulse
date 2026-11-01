import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api import (
    health,
    places,
    hazards,
    routes,
    geofences,
    iceberg,
    municipal,
    events
)

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("civicpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Initializing {settings.APP_NAME} in mode: {settings.APP_MODE}")
    logger.info(f"Connected AWS Region: {settings.AWS_REGION}")
    logger.info(f"Data lake database: {settings.AWS_ATHENA_DATABASE}.{settings.AWS_ATHENA_TABLE}")
    yield
    logger.info("CivicPulse backend shutting down cleanly.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Geospatial Civic Decision-Support Platform with Apache Iceberg Lakehouse & Amazon Location Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error occurred.",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred. Please consult backend logs.",
            "path": request.url.path
        }
    )


# Register API routers
app.include_router(health.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(hazards.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(geofences.router, prefix="/api")
app.include_router(iceberg.router, prefix="/api")
app.include_router(municipal.router, prefix="/api")
app.include_router(events.router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_prefix": "/api",
        "mode": settings.APP_MODE,
        "region": settings.AWS_REGION
    }

