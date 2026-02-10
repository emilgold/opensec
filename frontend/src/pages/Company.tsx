import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getCompanyFilings } from "../api/client";
import type { CompanyDetail, FilingEntry } from "../api/client";
import { FilingCard } from "../components/FilingCard";
import WatchlistButton from "../components/WatchlistButton";
import Pagination from "../components/Pagination";

const FORM_TYPES = [
  { value: "", label: "All Filings" },
  { value: "10-K", label: "10-K (Annual)" },
  { value: "10-Q", label: "10-Q (Quarterly)" },
  { value: "8-K", label: "8-K (Current)" },
  { value: "DEF 14A", label: "DEF 14A (Proxy)" },
  { value: "S-1", label: "S-1 (Registration)" },
  { value: "4", label: "Form 4 (Insider)" },
  { value: "SC 13", label: "SC 13 (Ownership)" },
];

export default function Company() {
  const { cik } = useParams<{ cik: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [filings, setFilings] = useState<FilingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formType = searchParams.get("form") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 40;

  useEffect(() => {
    if (!cik) return;
    setLoading(true);
    setError(null);
    getCompanyFilings(cik, {
      form_type: formType || undefined,
      page,
      page_size: pageSize,
    })
      .then((res) => {
        setCompany(res.company);
        setFilings(res.filings);
        setTotal(res.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cik, formType, page]);

  const setFormFilter = (form: string) => {
    const params = new URLSearchParams(searchParams);
    if (form) {
      params.set("form", form);
    } else {
      params.delete("form");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  if (loading && !company) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-sec-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Failed to load company</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Company Header */}
      {company && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.name}
                </h1>
                <WatchlistButton
                  cik={company.cik}
                  ticker={company.ticker}
                  name={company.name}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                {company.tickers.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {company.tickers.map((t, i) => (
                      <span key={t}>
                        {i > 0 && ", "}
                        <span className="font-mono font-semibold text-sec-700">
                          {t}
                        </span>
                        {company.exchanges[i] && (
                          <span className="text-gray-400 text-xs ml-0.5">
                            ({company.exchanges[i]})
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                )}
                <span className="text-gray-400">CIK {company.cik}</span>
                {company.sic_description && (
                  <span>
                    {company.sic_description}{" "}
                    <span className="text-gray-400">({company.sic})</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                {company.state_of_incorporation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {company.state_of_incorporation}
                  </span>
                )}
                {company.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {company.phone}
                  </span>
                )}
                {company.website && (
                  <a
                    href={
                      company.website.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sec-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {company.website}
                  </a>
                )}
                {company.fiscal_year_end && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    FY ends {company.fiscal_year_end}
                  </span>
                )}
              </div>
            </div>
            <a
              href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}&type=&dateb=&owner=include&count=40`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-sec-600 flex-shrink-0"
            >
              View on EDGAR
            </a>
          </div>
        </div>
      )}

      {/* Filing Type Filter */}
      <div className="flex flex-wrap gap-2">
        {FORM_TYPES.map((ft) => (
          <button
            key={ft.value}
            onClick={() => setFormFilter(ft.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              formType === ft.value
                ? "bg-sec-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-sec-300"
            }`}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {/* Filing count */}
      <div className="text-sm text-gray-500">
        {total} filing{total !== 1 ? "s" : ""} found
        {formType && ` for ${formType}`}
      </div>

      {/* Filings list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filings.length > 0 ? (
        <div className="space-y-2">
          {filings.map((filing) => (
            <FilingCard
              key={filing.accession_number}
              filing={filing}
              cik={cik!}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No filings found.</p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
