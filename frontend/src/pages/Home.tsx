import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  FileText,
  Eye,
  Search as SearchIcon,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import { SearchHitCard } from "../components/FilingCard";
import { getRecentFilings, getWatchlist } from "../api/client";
import type { SearchHit, WatchlistEntry } from "../api/client";

export default function Home() {
  const [recentFilings, setRecentFilings] = useState<SearchHit[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  useEffect(() => {
    getRecentFilings()
      .then((res) => setRecentFilings(res.hits || []))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));

    getWatchlist()
      .then(setWatchlist)
      .catch(() => {})
      .finally(() => setLoadingWatchlist(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Open<span className="text-sec-600">SEC</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Self-hosted SEC filings browser. Search companies, browse filings,
          compare documents &mdash; all from EDGAR, organized for you.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar large placeholder="Search by company name or ticker (e.g., AAPL, Microsoft)..." />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/search"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-sec-300 hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              Full-Text Search
            </div>
            <div className="text-xs text-gray-500">
              Search across all SEC filings
            </div>
          </div>
        </Link>
        <Link
          to="/watchlist"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-sec-300 hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              Watchlist
            </div>
            <div className="text-xs text-gray-500">
              Track your favorite companies
            </div>
          </div>
        </Link>
        <Link
          to="/compare"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-sec-300 hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              Compare Documents
            </div>
            <div className="text-xs text-gray-500">
              Redline between filing versions
            </div>
          </div>
        </Link>
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Filings */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sec-600" />
              Recent Filings
            </h2>
            <Link
              to="/search?q=*"
              className="text-sm text-sec-600 hover:text-sec-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingRecent ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : recentFilings.length > 0 ? (
            <div className="space-y-2">
              {recentFilings.slice(0, 10).map((hit, i) => (
                <SearchHitCard key={`${hit.accession_number}-${i}`} hit={hit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No recent filings loaded yet. Try searching for a company
                above.
              </p>
            </div>
          )}
        </section>

        {/* Watchlist Sidebar */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              Watchlist
            </h2>
            <Link
              to="/watchlist"
              className="text-sm text-sec-600 hover:text-sec-800 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loadingWatchlist ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : watchlist.length > 0 ? (
            <div className="space-y-2">
              {watchlist.map((entry) => (
                <Link
                  key={entry.cik}
                  to={`/company/${entry.cik}`}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-sec-300 hover:shadow-sm transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.ticker && (
                        <span className="font-mono font-semibold text-sec-700">
                          {entry.ticker}
                        </span>
                      )}
                      {entry.ticker && " · "}
                      CIK {entry.cik}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No companies watched yet.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Search and add companies to track their filings.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
