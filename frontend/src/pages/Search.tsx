import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter, Loader2 } from "lucide-react";
import { searchFilings } from "../api/client";
import type { SearchHit } from "../api/client";
import { SearchHitCard } from "../components/FilingCard";
import Pagination from "../components/Pagination";

const FORM_OPTIONS = [
  { value: "", label: "All Forms" },
  { value: "10-K", label: "10-K" },
  { value: "10-Q", label: "10-Q" },
  { value: "8-K", label: "8-K" },
  { value: "DEF 14A", label: "DEF 14A" },
  { value: "S-1", label: "S-1" },
  { value: "S-3", label: "S-3" },
  { value: "SC 13D", label: "SC 13D" },
  { value: "4", label: "Form 4" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const q = searchParams.get("q") || "";
  const forms = searchParams.get("forms") || "";
  const dateStart = searchParams.get("date_start") || "";
  const dateEnd = searchParams.get("date_end") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    searchFilings({
      q,
      forms: forms || undefined,
      date_start: dateStart || undefined,
      date_end: dateEnd || undefined,
      page,
      page_size: pageSize,
    })
      .then((res) => {
        setResults(res.hits || []);
        setTotal(res.total);
      })
      .catch(() => {
        setResults([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [q, forms, dateStart, dateEnd, page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", query.trim());
      params.delete("page");
      setSearchParams(params);
    }
  };

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Search Filings</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all SEC filings (e.g., revenue growth, risk factors)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sec-600 text-white rounded-xl text-sm font-medium hover:bg-sec-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
              showFilters
                ? "bg-sec-50 text-sec-700 border-sec-200"
                : "bg-white text-gray-600 border-gray-300 hover:border-sec-300"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Form Type
              </label>
              <select
                value={forms}
                onChange={(e) => setFilter("forms", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500"
              >
                {FORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setFilter("date_start", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setFilter("date_end", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500"
              />
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {q && (
        <div className="text-sm text-gray-500">
          {loading
            ? "Searching..."
            : `${total.toLocaleString()} result${total !== 1 ? "s" : ""} for "${q}"`}
          {forms && ` in ${forms}`}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-sec-600 animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((hit, i) => (
            <SearchHitCard key={`${hit.accession_number}-${i}`} hit={hit} />
          ))}
        </div>
      ) : q ? (
        <div className="text-center py-16 text-gray-500">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No results found for &ldquo;{q}&rdquo;</p>
          <p className="text-sm mt-1">Try different keywords or broader filters.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Enter a search query to find SEC filings.</p>
          <p className="text-sm text-gray-400 mt-1">
            Search by keywords like &ldquo;revenue growth&rdquo;, &ldquo;risk
            factors&rdquo;, or &ldquo;acquisition&rdquo;.
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
