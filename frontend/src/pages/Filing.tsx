import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  Loader2,
  AlertCircle,
  List,
  X,
} from "lucide-react";
import { getFilingDetail, getFilingDocument } from "../api/client";
import type { FilingDetail as FilingDetailType, FilingDocument } from "../api/client";

export default function Filing() {
  const { cik, accession } = useParams<{ cik: string; accession: string }>();
  const [filing, setFiling] = useState<FilingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<FilingDocument | null>(null);
  const [docContent, setDocContent] = useState<string>("");
  const [docLoading, setDocLoading] = useState(false);
  const [showDocList, setShowDocList] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!cik || !accession) return;
    setLoading(true);
    getFilingDetail(cik, accession)
      .then((data) => {
        setFiling(data);
        // Auto-load primary document
        const primary = data.documents.find(
          (d) =>
            d.filename === data.primary_document ||
            d.filename.endsWith(".htm") ||
            d.filename.endsWith(".html")
        );
        if (primary) {
          loadDocument(primary);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cik, accession]);

  const loadDocument = async (doc: FilingDocument) => {
    setActiveDoc(doc);
    setDocLoading(true);
    setShowDocList(false);
    try {
      const content = await getFilingDocument(doc.document_url);
      setDocContent(content);
    } catch (err: any) {
      setDocContent(
        `<div style="padding:2rem;color:#666;">Failed to load document: ${err.message}</div>`
      );
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    if (iframeRef.current && docContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 1rem; line-height: 1.6; color: #333; }
                table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
                td, th { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
                th { background: #f5f5f5; }
                img { max-width: 100%; }
                a { color: #4263eb; }
              </style>
            </head>
            <body>${docContent}</body>
          </html>
        `);
        doc.close();
      }
    }
  }, [docContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-sec-600 animate-spin" />
      </div>
    );
  }

  if (error || !filing) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">Failed to load filing</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filing header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link
            to={`/company/${cik}`}
            className="text-sm text-sec-600 hover:text-sec-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {filing.company_name}
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="inline-flex px-2.5 py-0.5 rounded text-sm font-semibold bg-blue-100 text-blue-800">
                {filing.form_type}
              </span>
              {filing.form_type} Filing
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              Filed {filing.filing_date}
              {filing.report_date && ` · Period: ${filing.report_date}`}
              {" · "}
              Accession: {filing.accession_number}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDocList(!showDocList)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              <List className="w-4 h-4" />
              Documents ({filing.documents.length})
            </button>
          </div>
        </div>
      </div>

      {/* Document list panel */}
      {showDocList && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              Filing Documents
            </h3>
            <button
              onClick={() => setShowDocList(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filing.documents.map((doc, i) => (
              <button
                key={`${doc.filename}-${i}`}
                onClick={() => loadDocument(doc)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition ${
                  activeDoc?.filename === doc.filename
                    ? "bg-sec-50 text-sec-800 border border-sec-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{doc.filename}</div>
                  {doc.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {doc.description}
                    </div>
                  )}
                </div>
                {doc.size && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {doc.size}
                  </span>
                )}
                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-sec-600"
                  title="Open original on EDGAR"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document viewer */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {activeDoc && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-sm text-gray-600 truncate">
              {activeDoc.filename}
              {activeDoc.description && ` — ${activeDoc.description}`}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={activeDoc.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-sec-600 hover:text-sec-800"
              >
                <ExternalLink className="w-3 h-3" />
                EDGAR
              </a>
            </div>
          </div>
        )}
        {docLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-sec-600 animate-spin" />
          </div>
        ) : docContent ? (
          <iframe
            ref={iframeRef}
            title="Filing Document"
            className="w-full border-0"
            style={{ minHeight: "80vh" }}
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="text-center py-20 text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Select a document to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
