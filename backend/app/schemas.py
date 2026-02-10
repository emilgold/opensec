from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Company schemas
class CompanySearchResult(BaseModel):
    cik: str
    ticker: Optional[str] = None
    name: str


class CompanyDetail(BaseModel):
    cik: str
    name: str
    ticker: Optional[str] = None
    tickers: list[str] = []
    exchanges: list[str] = []
    sic: Optional[str] = None
    sic_description: Optional[str] = None
    state: Optional[str] = None
    state_of_incorporation: Optional[str] = None
    fiscal_year_end: Optional[str] = None
    entity_type: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    addresses: dict = {}


# Filing schemas
class Filing(BaseModel):
    accession_number: str
    form_type: str
    filing_date: str
    report_date: Optional[str] = None
    acceptance_datetime: Optional[str] = None
    primary_document: Optional[str] = None
    primary_doc_description: Optional[str] = None
    file_number: Optional[str] = None
    film_number: Optional[str] = None
    items: Optional[str] = None
    size: Optional[int] = None
    is_xbrl: bool = False
    is_inline_xbrl: bool = False


class FilingListResponse(BaseModel):
    company: CompanyDetail
    filings: list[Filing]
    total: int
    page: int
    page_size: int


class FilingDocument(BaseModel):
    sequence: Optional[str] = None
    description: Optional[str] = None
    document_url: str
    filename: str
    type: Optional[str] = None
    size: Optional[str] = None


class FilingDetail(BaseModel):
    accession_number: str
    cik: str
    company_name: str
    form_type: str
    filing_date: str
    report_date: Optional[str] = None
    documents: list[FilingDocument] = []
    primary_document: Optional[str] = None


# Search schemas
class SearchHit(BaseModel):
    entity_name: str
    cik: str
    file_date: str
    form_type: str
    accession_number: str
    file_number: Optional[str] = None
    period_of_report: Optional[str] = None
    file_description: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    hits: list[SearchHit]
    page: int
    page_size: int


# Watchlist schemas
class WatchlistEntry(BaseModel):
    id: int
    cik: str
    ticker: Optional[str] = None
    name: str
    added_at: Optional[datetime] = None


class WatchlistAdd(BaseModel):
    cik: str
    ticker: Optional[str] = None
    name: str


# Bookmark schemas
class BookmarkEntry(BaseModel):
    id: int
    accession_number: str
    cik: str
    company_name: Optional[str] = None
    form_type: Optional[str] = None
    filing_date: Optional[str] = None
    description: Optional[str] = None
    note: Optional[str] = None
    created_at: Optional[datetime] = None


class BookmarkAdd(BaseModel):
    accession_number: str
    cik: str
    company_name: Optional[str] = None
    form_type: Optional[str] = None
    filing_date: Optional[str] = None
    description: Optional[str] = None
    note: Optional[str] = None


# Compare schemas
class CompareRequest(BaseModel):
    url1: str
    url2: str
