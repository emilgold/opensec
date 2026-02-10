import { Link } from "react-router-dom";
import { FileText, Calendar, Building2 } from "lucide-react";
import type { FilingEntry, SearchHit } from "../api/client";

const FORM_COLORS: Record<string, string> = {
  "10-K": "bg-blue-100 text-blue-800",
  "10-Q": "bg-green-100 text-green-800",
  "8-K": "bg-yellow-100 text-yellow-800",
  "S-1": "bg-purple-100 text-purple-800",
  "DEF 14A": "bg-pink-100 text-pink-800",
  "SC 13D": "bg-red-100 text-red-800",
  "4": "bg-orange-100 text-orange-800",
};

function getFormColor(formType: string): string {
  const key = Object.keys(FORM_COLORS).find(
    (k) => formType.toUpperCase().startsWith(k) || formType.toUpperCase() === k
  );
  return key ? FORM_COLORS[key] : "bg-gray-100 text-gray-800";
}

interface FilingCardProps {
  filing: FilingEntry;
  cik: string;
  companyName?: string;
}

export function FilingCard({ filing, cik, companyName }: FilingCardProps) {
  return (
    <Link
      to={`/filing/${cik}/${filing.accession_number}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-sec-300 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getFormColor(filing.form_type)}`}
            >
              {filing.form_type}
            </span>
            {filing.is_xbrl && (
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                XBRL
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-gray-900 group-hover:text-sec-700 truncate">
            {filing.primary_doc_description || filing.form_type}
          </div>
          {companyName && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Building2 className="w-3 h-3" />
              {companyName}
            </div>
          )}
          {filing.items && (
            <div className="text-xs text-gray-500 mt-0.5">
              Items: {filing.items}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {filing.filing_date}
          </div>
          {filing.report_date && filing.report_date !== filing.filing_date && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              Period: {filing.report_date}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

interface SearchHitCardProps {
  hit: SearchHit;
}

export function SearchHitCard({ hit }: SearchHitCardProps) {
  return (
    <Link
      to={`/company/${hit.cik}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-sec-300 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${getFormColor(hit.form_type)}`}
            >
              {hit.form_type}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 group-hover:text-sec-700">
            {hit.entity_name}
          </div>
          {hit.file_description && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {hit.file_description}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-0.5">CIK {hit.cik}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {hit.file_date}
          </div>
          {hit.period_of_report && (
            <div className="text-[10px] text-gray-400 mt-0.5">
              Period: {hit.period_of_report}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
