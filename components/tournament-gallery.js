"use client";

import { useState, useEffect } from "react";
import {
  FaImages,
  FaCamera,
  FaExpand,
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDays,
  FaArrowRight,
  FaTag,
} from "react-icons/fa6";

const CATEGORIES = [
  "All",
  "Match Action",
  "Auction Stage",
  "Opening Ceremony",
  "Awards & Trophy",
  "Team Photos",
  "Tournament Moments",
];

const categoryBadgeColors = {
  "Match Action": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  "Auction Stage": "border-sky-500/30 bg-sky-500/10 text-sky-400",
  "Opening Ceremony": "border-purple-500/30 bg-purple-500/10 text-purple-300",
  "Awards & Trophy": "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  "Team Photos": "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Tournament Moments": "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

export default function TournamentGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Only show section when gallery photos have been added from the admin panel
  if (loading || items.length === 0) {
    return null;
  }

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    }
  };

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev === filteredItems.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <section id="gallery" className="py-20 border-b border-white/10 bg-[#0A0F1D] relative overflow-hidden">
      {/* Ambient gradient lights */}
      <div className="absolute top-1/4 -right-24 size-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -left-24 size-96 rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 sm:px-4 py-1 mb-3 backdrop-blur-md">
              <FaCamera className="text-xs text-amber-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                Tournament Moments & Highlights
              </span>
            </div>
            <h2 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
              TOURNAMENT <span className="text-amber-400">GALLERY</span>
            </h2>
            <p className="mt-2 text-xs sm:text-base text-slate-400 max-w-2xl font-normal leading-relaxed">
              Relive match action, auction draft highlights, trophy unveilings, and celebratory memories from the ESDM Premier League 2027.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-4 sm:pb-6 border-b border-white/10 mb-6 sm:mb-8">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All"
                ? items.length
                : items.filter((i) => i.category === cat).length;
            if (cat !== "All" && count === 0) return null;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-amber-500 text-[#0A0F1D] shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105"
                    : "border border-white/10 bg-[#111827]/70 text-slate-400 hover:text-white hover:border-white/25 hover:bg-[#111827]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono ${
                    active ? "bg-[#0A0F1D]/30 text-[#0A0F1D]" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-8 text-center text-slate-400 text-xs">
            No photos in {selectedCategory} category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const badgeClass =
                categoryBadgeColors[item.category] ||
                "border-amber-500/30 bg-amber-500/10 text-amber-400";

              return (
                <div
                  key={item._id || index}
                  onClick={() => openLightbox(index)}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/75 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#070A12]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Top Category Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${badgeClass}`}
                      >
                        <FaTag className="text-[8px]" />
                        {item.category}
                      </span>
                    </div>

                    {/* Expand icon on hover */}
                    <div className="absolute top-3.5 right-3.5 size-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md">
                      <FaExpand className="text-xs" />
                    </div>

                    {/* Date Pill at bottom right of image */}
                    {item.date && (
                      <div className="absolute bottom-3 right-3.5 flex items-center gap-1.5 rounded-md bg-black/70 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                        <FaCalendarDays className="text-[9px] text-amber-400" />
                        <span>{item.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-amber-400">
                      <span>View Full Photo</span>
                      <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image preview"
            className="absolute top-5 right-5 z-20 size-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
          >
            <FaXmark className="text-lg" />
          </button>

          {/* Previous image */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevLightbox();
            }}
            aria-label="Previous image"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
          >
            <FaChevronLeft className="text-base" />
          </button>

          {/* Next image */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextLightbox();
            }}
            aria-label="Next image"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
          >
            <FaChevronRight className="text-base" />
          </button>

          {/* Lightbox Content */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
              <img
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Info footer */}
            <div className="w-full mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111827]/90 border border-white/15 rounded-2xl p-4 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      categoryBadgeColors[filteredItems[lightboxIndex].category] ||
                      "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {filteredItems[lightboxIndex].category}
                  </span>
                  {filteredItems[lightboxIndex].date && (
                    <span className="text-xs text-slate-400 font-mono">
                      {filteredItems[lightboxIndex].date}
                    </span>
                  )}
                </div>
                <h4 className="font-sans font-bold text-lg text-white">
                  {filteredItems[lightboxIndex].title}
                </h4>
                {filteredItems[lightboxIndex].description && (
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                    {filteredItems[lightboxIndex].description}
                  </p>
                )}
              </div>

              <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
