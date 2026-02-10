import asyncio
import json
import logging
import time
from typing import Optional

import httpx
from cachetools import TTLCache

from app.config import settings

logger = logging.getLogger(__name__)

# In-memory caches
_company_tickers_cache: Optional[list[dict]] = None
_company_tickers_last_fetch: float = 0
_submissions_cache = TTLCache(maxsize=500, ttl=settings.cache_ttl_seconds)
_last_request_time: float = 0
_lock = asyncio.Lock()


def _headers() -> dict:
    return {
        "User-Agent": settings.edgar_user_agent,
        "Accept-Encoding": "gzip, deflate",
        "Accept": "application/json",
    }


async def _rate_limit():
    """Enforce SEC rate limit of ~10 requests/second."""
    global _last_request_time
    async with _lock:
        now = time.monotonic()
        elapsed = now - _last_request_time
        if elapsed < settings.request_delay_seconds:
            await asyncio.sleep(settings.request_delay_seconds - elapsed)
        _last_request_time = time.monotonic()


async def _get(url: str, params: Optional[dict] = None, accept: str = "application/json") -> httpx.Response:
    """Make a rate-limited GET request to EDGAR."""
    await _rate_limit()
    headers = _headers()
    if accept != "application/json":
        headers["Accept"] = accept
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response


async def get_company_tickers() -> list[dict]:
    """Fetch and cache the company tickers file from SEC."""
    global _company_tickers_cache, _company_tickers_last_fetch

    now = time.time()
    if _company_tickers_cache and (now - _company_tickers_last_fetch) < settings.cache_ttl_seconds:
        return _company_tickers_cache

    url = f"{settings.edgar_base_url}/files/company_tickers.json"
    response = await _get(url)
    data = response.json()

    tickers = []
    for entry in data.values():
        tickers.append({
            "cik": str(entry["cik_str"]),
            "ticker": entry.get("ticker", ""),
            "name": entry.get("title", ""),
        })

    _company_tickers_cache = tickers
    _company_tickers_last_fetch = now
    return tickers


async def search_companies(query: str, limit: int = 20) -> list[dict]:
    """Search companies by name or ticker."""
    tickers = await get_company_tickers()
    query_lower = query.lower().strip()

    # Exact ticker match first
    exact_matches = []
    starts_with = []
    contains = []

    for company in tickers:
        ticker = (company.get("ticker") or "").lower()
        name = (company.get("name") or "").lower()

        if ticker == query_lower:
            exact_matches.append(company)
        elif ticker.startswith(query_lower) or name.startswith(query_lower):
            starts_with.append(company)
        elif query_lower in ticker or query_lower in name:
            contains.append(company)

    results = exact_matches + starts_with + contains
    return results[:limit]


async def get_company_submissions(cik: str) -> dict:
    """Get company details and recent filings from EDGAR."""
    padded_cik = cik.zfill(10)

    if padded_cik in _submissions_cache:
        return _submissions_cache[padded_cik]

    url = f"{settings.edgar_data_url}/submissions/CIK{padded_cik}.json"
    response = await _get(url)
    data = response.json()

    _submissions_cache[padded_cik] = data
    return data


def parse_company_detail(data: dict) -> dict:
    """Parse company detail from submissions data."""
    return {
        "cik": str(data.get("cik", "")),
        "name": data.get("name", ""),
        "tickers": data.get("tickers", []),
        "ticker": data.get("tickers", [None])[0] if data.get("tickers") else None,
        "exchanges": data.get("exchanges", []),
        "sic": data.get("sic", ""),
        "sic_description": data.get("sicDescription", ""),
        "state": data.get("stateOfIncorporation", ""),
        "state_of_incorporation": data.get("stateOfIncorporation", ""),
        "fiscal_year_end": data.get("fiscalYearEnd", ""),
        "entity_type": data.get("entityType", ""),
        "phone": data.get("phone", ""),
        "website": (data.get("website") or ""),
        "addresses": data.get("addresses", {}),
    }


def parse_filings(data: dict, form_filter: Optional[str] = None, page: int = 1, page_size: int = 40) -> tuple[list[dict], int]:
    """Parse filings from submissions data with pagination."""
    recent = data.get("filings", {}).get("recent", {})

    accession_numbers = recent.get("accessionNumber", [])
    forms = recent.get("form", [])
    filing_dates = recent.get("filingDate", [])
    report_dates = recent.get("reportDate", [])
    primary_documents = recent.get("primaryDocument", [])
    primary_doc_descriptions = recent.get("primaryDocDescription", [])
    acceptance_datetimes = recent.get("acceptanceDatetime", [])
    file_numbers = recent.get("fileNumber", [])
    items_list = recent.get("items", [])
    sizes = recent.get("size", [])
    is_xbrl_list = recent.get("isXBRL", [])
    is_inline_xbrl_list = recent.get("isInlineXBRL", [])

    filings = []
    for i in range(len(accession_numbers)):
        form_type = forms[i] if i < len(forms) else ""

        if form_filter and form_filter.upper() not in form_type.upper():
            continue

        filings.append({
            "accession_number": accession_numbers[i],
            "form_type": form_type,
            "filing_date": filing_dates[i] if i < len(filing_dates) else "",
            "report_date": report_dates[i] if i < len(report_dates) else None,
            "primary_document": primary_documents[i] if i < len(primary_documents) else None,
            "primary_doc_description": primary_doc_descriptions[i] if i < len(primary_doc_descriptions) else None,
            "acceptance_datetime": acceptance_datetimes[i] if i < len(acceptance_datetimes) else None,
            "file_number": file_numbers[i] if i < len(file_numbers) else None,
            "items": items_list[i] if i < len(items_list) else None,
            "size": sizes[i] if i < len(sizes) else None,
            "is_xbrl": bool(is_xbrl_list[i]) if i < len(is_xbrl_list) else False,
            "is_inline_xbrl": bool(is_inline_xbrl_list[i]) if i < len(is_inline_xbrl_list) else False,
        })

    total = len(filings)
    start = (page - 1) * page_size
    end = start + page_size
    return filings[start:end], total


async def get_filing_documents(cik: str, accession_number: str) -> list[dict]:
    """Get the list of documents for a specific filing."""
    padded_cik = cik.zfill(10)
    accession_no_dashes = accession_number.replace("-", "")

    url = f"{settings.edgar_base_url}/cgi-bin/browse-edgar?action=getcompany&CIK={padded_cik}&type=&dateb=&owner=include&count=1&search_text=&action=getcompany"

    # Use the filing index page
    index_url = f"{settings.edgar_base_url}/Archives/edgar/data/{cik}/{accession_no_dashes}/index.json"
    try:
        response = await _get(index_url)
        data = response.json()
    except Exception:
        # Fallback: try without leading zeros stripped
        index_url = f"{settings.edgar_base_url}/Archives/edgar/data/{padded_cik}/{accession_no_dashes}/index.json"
        response = await _get(index_url)
        data = response.json()

    documents = []
    base_url = f"{settings.edgar_base_url}/Archives/edgar/data/{cik}/{accession_no_dashes}"

    for item in data.get("directory", {}).get("item", []):
        name = item.get("name", "")
        documents.append({
            "filename": name,
            "document_url": f"{base_url}/{name}",
            "description": item.get("description", ""),
            "type": item.get("type", ""),
            "size": item.get("size", ""),
            "sequence": item.get("sequence", ""),
        })

    return documents


async def get_document_content(url: str) -> tuple[str, str]:
    """Fetch a filing document's content. Returns (content, content_type)."""
    response = await _get(url, accept="*/*")
    content_type = response.headers.get("content-type", "text/html")
    return response.text, content_type


async def search_filings(
    query: str,
    forms: Optional[str] = None,
    date_start: Optional[str] = None,
    date_end: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """Full-text search across SEC filings using EDGAR EFTS."""
    params = {
        "q": query,
        "from": (page - 1) * page_size,
        "size": page_size,
    }

    if forms:
        params["forms"] = forms
    if date_start:
        params["dateRange"] = "custom"
        params["startdt"] = date_start
    if date_end:
        params["dateRange"] = "custom"
        params["enddt"] = date_end

    url = f"{settings.edgar_efts_url}/search-index"
    response = await _get(url, params=params)
    data = response.json()

    hits = []
    for hit in data.get("hits", {}).get("hits", []):
        source = hit.get("_source", {})
        # Extract accession number from _id
        file_id = hit.get("_id", "")
        # _id format is typically "accession_number:index"
        accession = file_id.split(":")[0] if ":" in file_id else file_id

        hits.append({
            "entity_name": source.get("entity_name", ""),
            "cik": str(source.get("entity_id", "")),
            "file_date": source.get("file_date", ""),
            "form_type": source.get("file_type", ""),
            "accession_number": accession,
            "file_number": source.get("file_num", ""),
            "period_of_report": source.get("period_of_report", ""),
            "file_description": source.get("file_description", ""),
        })

    total_value = data.get("hits", {}).get("total", {})
    if isinstance(total_value, dict):
        total = total_value.get("value", 0)
    else:
        total = total_value or 0

    return {
        "query": query,
        "total": total,
        "hits": hits,
        "page": page,
        "page_size": page_size,
    }


async def get_recent_filings(forms: str = "10-K,10-Q,8-K,S-1", page_size: int = 20) -> dict:
    """Get recent filings of specific types."""
    return await search_filings(
        query="*",
        forms=forms,
        page=1,
        page_size=page_size,
    )
