import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Trash2,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { getWatchlist, removeFromWatchlist } from "../api/client";
import type { WatchlistEntry } from "../api/client";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = () => {
    setLoading(true);
    getWatchlist()
      .then(setWatchlist)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleRemove = async (cik: string) => {
    await removeFromWatchlist(cik);
    setWatchlist((prev) => prev.filter((w) => w.cik !== cik));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-green-600" />
          Watchlist
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Companies you&apos;re tracking. Add companies from their profile page.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-sec-600 animate-spin" />
        </div>
      ) : watchlist.length > 0 ? (
        <div className="space-y-2">
          {watchlist.map((entry) => (
            <div
              key={entry.cik}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:border-sec-300 transition"
            >
              <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Link
                to={`/company/${entry.cik}`}
                className="flex-1 min-w-0 group"
              >
                <div className="text-sm font-medium text-gray-900 group-hover:text-sec-700 truncate">
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
                  {entry.added_at && (
                    <>
                      {" · Added "}
                      {new Date(entry.added_at).toLocaleDateString()}
                    </>
                  )}
                </div>
              </Link>
              <Link
                to={`/company/${entry.cik}`}
                className="text-gray-400 hover:text-sec-600 transition"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleRemove(entry.cik)}
                className="text-gray-400 hover:text-red-500 transition p-1"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No companies watched yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Search for a company and click &ldquo;Watch&rdquo; to track their
            filings.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-sec-600 text-white rounded-lg text-sm font-medium hover:bg-sec-700 transition"
          >
            Search Companies
          </Link>
        </div>
      )}
    </div>
  );
}
