import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import companies, filings, search, watchlist

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()
    logger.info("OpenSEC is ready.")
    yield
    logger.info("Shutting down OpenSEC.")


app = FastAPI(
    title="OpenSEC",
    description="Self-hosted SEC filings browser — a local clone of BamSEC",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(filings.router)
app.include_router(search.router)
app.include_router(watchlist.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "OpenSEC"}
