"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa6";

export default function ExportButtonGroup({
  onExportPdf,
  onExportExcel,
  label = "Download",
  count = null,
  variant = "gold", // "gold" | "dark" | "outline" | "compact"
  disabled = false,
  pdfLabel = "Download as PDF",
  excelLabel = "Download as Excel (.xlsx)",
  align = "right",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePdf = async (e) => {
    e.stopPropagation();
    if (!onExportPdf || downloadingType) return;
    try {
      setDownloadingType("pdf");
      await Promise.resolve(onExportPdf());
    } finally {
      setDownloadingType(null);
      setIsOpen(false);
    }
  };

  const handleExcel = async (e) => {
    e.stopPropagation();
    if (!onExportExcel || downloadingType) return;
    try {
      setDownloadingType("excel");
      await Promise.resolve(onExportExcel());
    } finally {
      setDownloadingType(null);
      setIsOpen(false);
    }
  };

  // Styles based on variant
  const getButtonStyles = () => {
    if (variant === "gold") {
      return "bg-gradient-to-r from-[#d4a84f] to-[#b8872f] text-black hover:brightness-110 shadow-md font-bold";
    }
    if (variant === "outline") {
      return "border border-[#aeac78]/40 bg-[#25201e] text-[#fcf0da] hover:bg-[#342b29] hover:border-[#f2c46a]";
    }
    if (variant === "compact") {
      return "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 px-2.5 py-1 text-[11px]";
    }
    // dark
    return "bg-[#0b1728] hover:bg-[#13233c] text-white border border-blue-500/30 shadow-md";
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || Boolean(downloadingType)}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()}`}
        title="Download report in PDF or Excel"
      >
        {downloadingType ? (
          <FaSpinner className="animate-spin text-sm" />
        ) : (
          <FaDownload className="text-xs" />
        )}
        <span>{label}</span>
        {count !== null && count !== undefined && (
          <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] font-black">
            {count}
          </span>
        )}
        <FaChevronDown
          className={`text-[10px] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-64 rounded-xl border border-white/15 bg-[#071322] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
            <p className="text-[10px] font-black tracking-wider uppercase text-[#d4a84f]">
              Export Format
            </p>
            <p className="text-[11px] text-slate-400">
              Select desired document format
            </p>
          </div>

          {/* PDF Option */}
          <button
            type="button"
            disabled={Boolean(downloadingType)}
            onClick={handlePdf}
            className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-rose-950/40 hover:text-white transition-all cursor-pointer"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              {downloadingType === "pdf" ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaFilePdf className="text-sm" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate flex items-center justify-between">
                <span>PDF Document</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                  .PDF
                </span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">{pdfLabel}</p>
            </div>
          </button>

          {/* Excel Option */}
          <button
            type="button"
            disabled={Boolean(downloadingType)}
            onClick={handleExcel}
            className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-emerald-950/40 hover:text-white transition-all cursor-pointer mt-0.5"
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              {downloadingType === "excel" ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaFileExcel className="text-sm" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate flex items-center justify-between">
                <span>Excel Spreadsheet</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  .XLSX
                </span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">{excelLabel}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
