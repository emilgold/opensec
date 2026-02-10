from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import HTMLResponse, Response

from app.services import edgar
from app.services.diff import compute_diff, strip_html_tags
from app.schemas import FilingListResponse, FilingDetail, CompareRequest

router = APIRouter(prefix="/api/filings", tags=["filings"])


@router.get("/company/{cik}", response_model=FilingListResponse)
async def get_company_filings(
    cik: str,
    form_type: Optional[str] = Query(None, description="Filter by form type (e.g., 10-K, 10-Q, 8-K)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(40, ge=1, le=100),
):
    """Get filings for a specific company."""
    try:
        data = await edgar.get_company_submissions(cik)
        company = edgar.parse_company_detail(data)
        filings, total = edgar.parse_filings(data, form_filter=form_type, page=page, page_size=page_size)
        return FilingListResponse(
            company=company,
            filings=filings,
            total=total,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/detail/{cik}/{accession_number}", response_model=FilingDetail)
async def get_filing_detail(cik: str, accession_number: str):
    """Get details and document list for a specific filing."""
    try:
        data = await edgar.get_company_submissions(cik)
        company = edgar.parse_company_detail(data)
        documents = await edgar.get_filing_documents(cik, accession_number)

        # Find the filing info
        recent = data.get("filings", {}).get("recent", {})
        accessions = recent.get("accessionNumber", [])
        forms = recent.get("form", [])
        dates = recent.get("filingDate", [])
        report_dates = recent.get("reportDate", [])
        primary_docs = recent.get("primaryDocument", [])

        form_type = ""
        filing_date = ""
        report_date = None
        primary_doc = None

        for i, acc in enumerate(accessions):
            if acc == accession_number:
                form_type = forms[i] if i < len(forms) else ""
                filing_date = dates[i] if i < len(dates) else ""
                report_date = report_dates[i] if i < len(report_dates) else None
                primary_doc = primary_docs[i] if i < len(primary_docs) else None
                break

        return FilingDetail(
            accession_number=accession_number,
            cik=cik,
            company_name=company["name"],
            form_type=form_type,
            filing_date=filing_date,
            report_date=report_date,
            documents=documents,
            primary_document=primary_doc,
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/document")
async def get_filing_document(url: str = Query(..., description="Full URL to the EDGAR document")):
    """Proxy a filing document from EDGAR."""
    if not url.startswith("https://www.sec.gov/") and not url.startswith("https://data.sec.gov/"):
        raise HTTPException(status_code=400, detail="Only SEC.gov URLs are allowed")

    try:
        content, content_type = await edgar.get_document_content(url)

        if "html" in content_type.lower() or url.endswith(".htm") or url.endswith(".html"):
            return HTMLResponse(content=content)
        else:
            return Response(content=content, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch document: {e}")


@router.post("/compare")
async def compare_filings(req: CompareRequest):
    """Compare two filing documents and return a diff."""
    for u in [req.url1, req.url2]:
        if not u.startswith("https://www.sec.gov/") and not u.startswith("https://data.sec.gov/"):
            raise HTTPException(status_code=400, detail="Only SEC.gov URLs are allowed")

    try:
        content1, _ = await edgar.get_document_content(req.url1)
        content2, _ = await edgar.get_document_content(req.url2)

        text1 = strip_html_tags(content1)
        text2 = strip_html_tags(content2)

        diff_html = compute_diff(text1, text2)

        return {
            "diff_html": diff_html,
            "url1": req.url1,
            "url2": req.url2,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Comparison failed: {e}")
