from typing import Optional
from fastapi import APIRouter, Query

from app.services import edgar
from app.schemas import SearchResponse

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
async def search_filings(
    q: str = Query(..., min_length=1, description="Search query"),
    forms: Optional[str] = Query(None, description="Comma-separated form types (e.g., 10-K,10-Q)"),
    date_start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Full-text search across all SEC filings."""
    result = await edgar.search_filings(
        query=q,
        forms=forms,
        date_start=date_start,
        date_end=date_end,
        page=page,
        page_size=page_size,
    )
    return result


@router.get("/recent")
async def get_recent_filings(
    forms: str = Query("10-K,10-Q,8-K,S-1,DEF 14A", description="Form types to include"),
    page_size: int = Query(20, ge=1, le=50),
):
    """Get recent key filings."""
    return await edgar.get_recent_filings(forms=forms, page_size=page_size)
