import { useState } from "react";
import { GitCompare, Loader2, AlertCircle } from "lucide-react";
import { compareFilings } from "../api/client";

export default function Compare() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [diffHtml, setDiffHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url1.trim() || !url2.trim()) return;

    setLoading(true);
    setError(null);
    setDiffHtml(null);

    try {
      const result = await compareFilings(url1.trim(), url2.trim());
      setDiffHtml(result.diff_html);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-sec-600" />
          Compare Documents
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste two SEC filing document URLs to see a redline comparison of
          changes.
        </p>
      </div>

      <form onSubmit={handleCompare} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document 1 (older)
            </label>
            <input
              type="url"
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              placeholder="https://www.sec.gov/Archives/edgar/data/..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document 2 (newer)
            </label>
            <input
              type="url"
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              placeholder="https://www.sec.gov/Archives/edgar/data/..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sec-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !url1.trim() || !url2.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sec-600 text-white rounded-xl text-sm font-medium hover:bg-sec-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GitCompare className="w-4 h-4" />
          )}
          Compare
        </button>
      </form>

      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        <strong>Tip:</strong> You can find document URLs by navigating to a
        filing, then clicking the EDGAR link next to any document. The URL
        format is typically:{" "}
        <code className="bg-gray-200 px-1 rounded">
          https://www.sec.gov/Archives/edgar/data/CIK/ACCESSION/DOCUMENT
        </code>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {diffHtml && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            Comparison Results &mdash;{" "}
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded" />{" "}
              Added
            </span>{" "}
            &nbsp;
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 rounded" />{" "}
              Removed
            </span>
          </div>
          <div
            className="diff-view p-6 text-sm leading-relaxed max-h-[80vh] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        </div>
      )}
    </div>
  );
}
