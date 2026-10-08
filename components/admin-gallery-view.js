"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaCamera,
  FaImages,
  FaPlus,
  FaTrash,
  FaUpload,
  FaLink,
  FaCalendarDays,
  FaTag,
  FaSpinner,
  FaCheck,
  FaTriangleExclamation,
  FaEye,
  FaXmark,
} from "react-icons/fa6";

const CATEGORIES = [
  "Match Action",
  "Tournament Moments",
  "Auction Stage",
  "Opening Ceremony",
  "Awards & Trophy",
  "Team Photos",
];

export default function AdminGalleryView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form state
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Match Action");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (err) {
      console.error("Failed to load gallery items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "Please enter an image title." });
      return;
    }

    if (uploadMode === "file" && !file) {
      setStatusMessage({ type: "error", text: "Please select an image file to upload." });
      return;
    }

    if (uploadMode === "url" && !imageUrl.trim()) {
      setStatusMessage({ type: "error", text: "Please enter an image URL." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      let res;
      if (uploadMode === "file") {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("category", category);
        formData.append("date", date.trim() || new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }));
        formData.append("description", description.trim());
        formData.append("featured", featured ? "true" : "false");
        formData.append("image", file);

        res = await fetch("/api/gallery", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            category,
            imageUrl: imageUrl.trim(),
            date: date.trim() || new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
            description: description.trim(),
            featured,
          }),
        });
      }

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to add image to gallery.");
      }

      setStatusMessage({ type: "success", text: "Tournament image successfully published to gallery!" });
      // Reset form
      setTitle("");
      setImageUrl("");
      setFile(null);
      setFilePreview(null);
      setDate("");
      setDescription("");
      setFeatured(false);

      // Refresh list
      await fetchItems();
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this image from the gallery?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        setStatusMessage({ type: "success", text: "Image removed from gallery." });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete item.");
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Could not delete image." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Tournament Gallery Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload match action photos, auction stage moments, trophy ceremonies, and squad portraits to the public tournament gallery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-amber-400">
            {items.length} Images Published
          </span>
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-bold transition-all ${
            statusMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <FaCheck className="text-sm shrink-0" />
            ) : (
              <FaTriangleExclamation className="text-sm shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <FaXmark />
          </button>
        </div>
      )}

      {/* Main Grid: Upload Form on Left, Gallery Grid on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload Form (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-[#171413] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-5">
            <FaCamera className="text-amber-400 text-sm" />
            <h3 className="font-sans font-black text-base text-white uppercase tracking-wider">
              Add New Tournament Photo
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Photo Title / Match Event *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Strikers vs Thunderbolts - Opening Wicket"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Tournament Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#0e0b0a] px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Method Switch */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Image Source
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    uploadMode === "file"
                      ? "bg-amber-500 text-[#0A0F1D] shadow-sm"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <FaUpload className="text-[10px]" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    uploadMode === "url"
                      ? "bg-amber-500 text-[#0A0F1D] shadow-sm"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <FaLink className="text-[10px]" />
                  <span>Paste URL</span>
                </button>
              </div>

              {uploadMode === "file" ? (
                <div>
                  <div className="relative rounded-2xl border-2 border-dashed border-white/20 bg-black/30 p-5 text-center hover:border-amber-400/50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 size-full opacity-0 cursor-pointer"
                    />
                    {filePreview ? (
                      <div className="space-y-2">
                        <img
                          src={filePreview}
                          alt="Upload preview"
                          className="mx-auto max-h-36 rounded-lg object-contain"
                        />
                        <p className="text-[11px] text-amber-400 font-bold truncate">
                          {file?.name}
                        </p>
                        <span className="text-[10px] text-slate-400 underline block">
                          Click to choose a different photo
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <FaUpload className="mx-auto text-2xl text-slate-400" />
                        <p className="text-xs font-bold text-white">
                          Click or drag photo here
                        </p>
                        <p className="text-[10px] text-slate-400">
                          PNG, JPG, WEBP up to 10MB (Cloudinary optimized)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/tournament-photo.jpg"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                      <img
                        src={imageUrl}
                        alt="URL Preview"
                        className="mx-auto max-h-32 rounded object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Match / Event Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 12 Oct 2026 (leave blank for today)"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Caption / Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief caption describing the moment..."
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Uploading to Gallery...</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-xs" />
                  <span>Publish Image to Gallery</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Gallery Items (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-[#171413] p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <FaImages className="text-amber-400 text-sm" />
              <h3 className="font-sans font-black text-base text-white uppercase tracking-wider">
                Current Gallery Photos
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {items.length} items
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <FaSpinner className="animate-spin text-2xl text-amber-400" />
              <span>Loading tournament gallery...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <FaImages className="mx-auto text-3xl text-slate-600 mb-2" />
              <p className="font-bold text-white">No images in gallery yet</p>
              <p className="mt-1 text-slate-400">Use the form on the left to add match photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group relative rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex flex-col justify-between transition hover:border-amber-500/40 hover:bg-black/60 shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Category tag */}
                    <span className="absolute top-2 left-2 rounded-full bg-black/70 border border-white/20 px-2 py-0.5 text-[9px] font-black uppercase text-amber-400 backdrop-blur-md">
                      {item.category}
                    </span>

                    {/* Preview overlay button */}
                    <button
                      type="button"
                      onClick={() => setPreviewModalItem(item)}
                      title="Preview full image"
                      className="absolute top-2 right-2 size-7 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md hover:bg-black"
                    >
                      <FaEye className="text-[10px]" />
                    </button>
                  </div>

                  {/* Info and delete action */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-white line-clamp-1">
                        {item.title}
                      </h4>
                      {item.date && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.date}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-mono truncate max-w-[120px]">
                        ID: {item._id?.slice(-6) || "seed"}
                      </span>
                      <button
                        type="button"
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === item._id ? (
                          <FaSpinner className="animate-spin text-[9px]" />
                        ) : (
                          <FaTrash className="text-[9px]" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Preview Modal */}
      {previewModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setPreviewModalItem(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-3xl border border-white/20 bg-[#171413] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-black uppercase text-amber-400">
                {previewModalItem.category}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <FaXmark />
              </button>
            </div>
            <img
              src={previewModalItem.imageUrl}
              alt={previewModalItem.title}
              className="w-full max-h-[60vh] object-contain rounded-xl bg-black"
            />
            <div className="mt-3">
              <h4 className="font-bold text-base text-white">
                {previewModalItem.title}
              </h4>
              {previewModalItem.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {previewModalItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
