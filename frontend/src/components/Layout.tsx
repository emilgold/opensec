import { Link, useNavigate } from "react-router-dom";
import { Search, Eye, BarChart3, GitCompare } from "lucide-react";
import { useState, type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-sec-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <BarChart3 className="w-7 h-7 text-sec-300" />
              <span className="text-xl font-bold tracking-tight">
                Open<span className="text-sec-300">SEC</span>
              </span>
            </Link>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-xl mx-8 hidden sm:block"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search companies or filings..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-sec-800 border border-sec-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sec-400 focus:border-transparent text-sm"
                />
              </div>
            </form>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <Link
                to="/search"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-sec-800 transition"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </Link>
              <Link
                to="/watchlist"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-sec-800 transition"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Watchlist</span>
              </Link>
              <Link
                to="/compare"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-sec-800 transition"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden md:inline">Compare</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          OpenSEC &mdash; Self-hosted SEC filings browser. Data sourced from{" "}
          <a
            href="https://www.sec.gov/edgar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sec-600 hover:underline"
          >
            SEC EDGAR
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
