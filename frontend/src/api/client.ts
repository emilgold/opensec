const BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

// Company endpoints
export async function searchCompanies(
  q: string,
  limit = 20
): Promise<CompanySearchResult[]> {
  return request(`/companies/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}

export async function getCompany(cik: string): Promise<CompanyDetail> {
  return request(`/companies/${cik}`);
}

// Filing endpoints
export async function getCompanyFilings(
  cik: string,
  params: { form_type?: string; page?: number; page_size?: number } = {}
): Promise<FilingListResponse> {
  const searchParams = new URLSearchParams();
  if (params.form_type) searchParams.set("form_type", params.form_type);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.page_size) searchParams.set("page_size", String(params.page_size));
  const qs = searchParams.toString();
  return request(`/filings/company/${cik}${qs ? `?${qs}` : ""}`);
}

export async function getFilingDetail(
  cik: string,
  accession: string
): Promise<FilingDetail> {
  return request(`/filings/detail/${cik}/${accession}`);
}

export async function getFilingDocument(url: string): Promise<string> {
  const res = await fetch(
    `${BASE}/filings/document?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);
  return res.text();
}

export async function compareFilings(
  url1: string,
  url2: string
): Promise<{ diff_html: string }> {
  return request("/filings/compare", {
    method: "POST",
    body: JSON.stringify({ url1, url2 }),
  });
}

// Search endpoints
export async function searchFilings(params: {
  q: string;
  forms?: string;
  date_start?: string;
  date_end?: string;
  page?: number;
  page_size?: number;
}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.q);
  if (params.forms) searchParams.set("forms", params.forms);
  if (params.date_start) searchParams.set("date_start", params.date_start);
  if (params.date_end) searchParams.set("date_end", params.date_end);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.page_size)
    searchParams.set("page_size", String(params.page_size));
  return request(`/search?${searchParams.toString()}`);
}

export async function getRecentFilings(
  forms?: string
): Promise<SearchResponse> {
  const params = forms ? `?forms=${encodeURIComponent(forms)}` : "";
  return request(`/search/recent${params}`);
}

// Watchlist endpoints
export async function getWatchlist(): Promise<WatchlistEntry[]> {
  return request("/watchlist");
}

export async function addToWatchlist(entry: {
  cik: string;
  ticker?: string;
  name: string;
}): Promise<WatchlistEntry> {
  return request("/watchlist", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function removeFromWatchlist(cik: string): Promise<void> {
  await fetch(`${BASE}/watchlist/${cik}`, { method: "DELETE" });
}

export async function checkWatchlist(
  cik: string
): Promise<{ watched: boolean }> {
  return request(`/watchlist/check/${cik}`);
}

// Types
export interface CompanySearchResult {
  cik: string;
  ticker: string | null;
  name: string;
}

export interface CompanyDetail {
  cik: string;
  name: string;
  ticker: string | null;
  tickers: string[];
  exchanges: string[];
  sic: string | null;
  sic_description: string | null;
  state: string | null;
  state_of_incorporation: string | null;
  fiscal_year_end: string | null;
  entity_type: string | null;
  phone: string | null;
  website: string | null;
  addresses: Record<string, unknown>;
}

export interface FilingEntry {
  accession_number: string;
  form_type: string;
  filing_date: string;
  report_date: string | null;
  acceptance_datetime: string | null;
  primary_document: string | null;
  primary_doc_description: string | null;
  file_number: string | null;
  items: string | null;
  size: number | null;
  is_xbrl: boolean;
  is_inline_xbrl: boolean;
}

export interface FilingListResponse {
  company: CompanyDetail;
  filings: FilingEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface FilingDocument {
  sequence: string | null;
  description: string | null;
  document_url: string;
  filename: string;
  type: string | null;
  size: string | null;
}

export interface FilingDetail {
  accession_number: string;
  cik: string;
  company_name: string;
  form_type: string;
  filing_date: string;
  report_date: string | null;
  documents: FilingDocument[];
  primary_document: string | null;
}

export interface SearchHit {
  entity_name: string;
  cik: string;
  file_date: string;
  form_type: string;
  accession_number: string;
  file_number: string | null;
  period_of_report: string | null;
  file_description: string | null;
}

export interface SearchResponse {
  query: string;
  total: number;
  hits: SearchHit[];
  page: number;
  page_size: number;
}

export interface WatchlistEntry {
  id: number;
  cik: string;
  ticker: string | null;
  name: string;
  added_at: string | null;
}
