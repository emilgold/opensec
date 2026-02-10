import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  checkWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../api/client";

interface WatchlistButtonProps {
  cik: string;
  ticker?: string | null;
  name: string;
}

export default function WatchlistButton({
  cik,
  ticker,
  name,
}: WatchlistButtonProps) {
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWatchlist(cik)
      .then((res) => setWatched(res.watched))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cik]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (watched) {
        await removeFromWatchlist(cik);
        setWatched(false);
      } else {
        await addToWatchlist({ cik, ticker: ticker || undefined, name });
        setWatched(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-400"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        watched
          ? "bg-sec-100 text-sec-800 hover:bg-sec-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {watched ? (
        <>
          <EyeOff className="w-4 h-4" />
          Watching
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          Watch
        </>
      )}
    </button>
  );
}
