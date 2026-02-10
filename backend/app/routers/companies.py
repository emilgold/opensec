from fastapi import APIRouter, Query, HTTPException

from app.services import edgar
from app.schemas import CompanySearchResult, CompanyDetail

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("/search", response_model=list[CompanySearchResult])
async def search_companies(
    q: str = Query(..., min_length=1, description="Search query (name or ticker)"),
    limit: int = Query(20, ge=1, le=100),
):
    """Search for companies by name or ticker symbol."""
    results = await edgar.search_companies(q, limit=limit)
    return results


@router.get("/{cik}", response_model=CompanyDetail)
async def get_company(cik: str):
    """Get detailed company information."""
    try:
        data = await edgar.get_company_submissions(cik)
        return edgar.parse_company_detail(data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Company not found: {e}")
