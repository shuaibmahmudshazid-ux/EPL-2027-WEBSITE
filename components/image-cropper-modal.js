"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FaCheck,
  FaCrop,
  FaRotateRight,
  FaXmark,
  FaUpload,
  FaArrowsRotate,
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaCircleUser,
  FaIdCard,
} from "react-icons/fa6";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square (Avatar / Passport)", ratio: 1 / 1, width: 320, height: 320 },
  { id: "3:4", label: "3:4 Card (Photocard Standard)", ratio: 3 / 4, width: 285, height: 380 },
  { id: "4:5", label: "4:5 Portrait", ratio: 4 / 5, width: 296, height: 370 },
];

/**
 * ImageCropperModal
 * High-performance interactive HTML5 Canvas photo editor and cropper.
 * Supports pan, zoom, 90° rotation, aspect ratio selection, guides, and live previews.
 */
export default function ImageCropperModal({
  isOpen = true,
  title = "Edit & Crop Player Photo",
  initialImageUrl = null,
  initialFile = null,
  playerName = "Player",
  onSave, // async ({ blob, dataUrl, file }) => void
  onClose,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [aspectId, setAspectId] = useState("1:1"); // Default: 1:1 Square
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [guideMode, setGuideMode] = useState("circle"); // "circle" | "grid" | "none"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const viewportRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const activeAspect = ASPECT_RATIOS.find((a) => a.id === aspectId) || ASPECT_RATIOS[0];
  const { width: boxW, height: boxH } = activeAspect;

  // Load initial image source (URL or File)
  useEffect(() => {
    let active = true;
    let objectUrl = null;

    const loadSource = async () => {
      setLoading(true);
      setError("");

      if (initialFile) {
        objectUrl = URL.createObjectURL(initialFile);
        if (active) setImageSrc(objectUrl);
      } else if (initialImageUrl) {
        // Fetch as blob to prevent canvas tainting from cached non-CORS images
        try {
          const res = await fetch(initialImageUrl, { mode: "cors" });
          if (!res.ok) throw new Error("Could not fetch remote image");
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          if (active) setImageSrc(objectUrl);
        } catch {
          // Fallback to direct URL if fetch blocked
          if (active) setImageSrc(initialImageUrl);
        }
      } else {
        if (active) setLoading(false);
      }
    };

    loadSource();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [initialImageUrl, initialFile]);

  // When imageSrc changes, load natural dimensions and reset transforms
  const handleImageLoaded = (e) => {
    const img = e.target;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setLoading(false);
  };

  const handleImageError = () => {
    setError("Failed to load image. Please select a valid photo file.");
    setLoading(false);
  };

  // Base cover scale so image fills the crop box
  const coverScale = (() => {
    if (!naturalSize.width || !naturalSize.height) return 1;
    // If rotated 90 or 270 deg, dimensions swap
    const isSideways = rotation === 90 || rotation === 270;
    const w = isSideways ? naturalSize.height : naturalSize.width;
    const h = isSideways ? naturalSize.width : naturalSize.height;
    return Math.max(boxW / w, boxH / h);
  })();

  // Handle local file selection to replace / pick photo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setError("");
    setLoading(true);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  // Pan (Mouse / Touch Drag)
  const handlePointerDown = (e) => {
    if (!imageSrc || loading) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(1, prev + delta), 3.5));
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetCrop = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  // Generate cropped result via HTML5 Canvas
  const handleApplyCrop = async () => {
    if (!imageSrc || !naturalSize.width) return;

    try {
      setSaving(true);
      setError("");

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load source image for canvas rendering."));
        img.src = imageSrc;
      });

      // Target canvas resolution (high-definition export)
      const targetWidth = 900;
      const targetHeight = Math.round(targetWidth / activeAspect.ratio);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio of output canvas to on-screen crop box
      const outputScale = targetWidth / boxW;

      // 1. Move to canvas center
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // 2. Apply user pan (scaled to target resolution)
      ctx.translate(pan.x * outputScale, pan.y * outputScale);

      // 3. Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 4. Apply total scale: base coverScale * zoom * outputScale
      const finalScale = coverScale * zoom * outputScale;
      ctx.scale(finalScale, finalScale);

      // 5. Draw centered image
      ctx.drawImage(img, -naturalSize.width / 2, -naturalSize.height / 2);

      // Export as Blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Canvas blob conversion failed."));
          },
          "image/jpeg",
          0.92
        );
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const croppedFile = new File([blob], `player_${Date.now()}.jpg`, { type: "image/jpeg" });

      if (onSave) {
        await onSave({ blob, dataUrl, file: croppedFile });
      }

      if (onClose) onClose();
    } catch (err) {
      console.error("Crop error:", err);
      setError(err.message || "Failed to process cropped photo.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-amber-500/30 bg-[#071220] p-5 text-white shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <FaCrop className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide text-white flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Adjust position, zoom, and frame for <span className="text-amber-300 font-bold">{playerName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-rose-400 hover:text-rose-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* ASPECT RATIO SELECTION BAR */}
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-[#030914] p-1 rounded-xl border border-white/10">
            {ASPECT_RATIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAspectId(item.id);
                  setPan({ x: 0, y: 0 });
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  aspectId === item.id
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>

          {/* Guide Overlay Toggles */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold">Guide:</span>
            <button
              type="button"
              onClick={() => setGuideMode("circle")}
              className={`rounded px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                guideMode === "circle" ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/40" : "hover:text-white"
              }`}
            >
              Circle
            </button>
            <button
              type="button"
              onClick={() => setGuideMode("grid")}
              className={`rounded px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                guideMode === "grid" ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/40" : "hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setGuideMode("none")}
              className={`rounded px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                guideMode === "none" ? "bg-white/20 text-white" : "hover:text-white"
              }`}
            >
              Off
            </button>
          </div>
        </div>

        {/* CROP VIEWPORT CONTAINER */}
        <div className="relative mx-auto flex items-center justify-center rounded-2xl border border-white/15 bg-black/60 p-3 shadow-inner select-none w-full max-w-full overflow-hidden">
          {/* Active Crop Box with exact Aspect Ratio */}
          <div
            ref={viewportRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{
              width: `${boxW}px`,
              height: `${boxH}px`,
              maxWidth: "100%",
            }}
            className="relative overflow-hidden rounded-xl border-2 border-amber-400 bg-slate-950 shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing touch-none"
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Source preview"
                onLoad={handleImageLoaded}
                onError={handleImageError}
                draggable={false}
                style={{
                  width: `${naturalSize.width * coverScale}px`,
                  height: `${naturalSize.height * coverScale}px`,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: isDraggingRef.current ? "none" : "transform 0.08s ease-out",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none select-none"
              />
            ) : (
              <div className="grid size-full place-items-center text-center p-4">
                <div>
                  <FaUpload className="mx-auto text-3xl text-amber-400/60 mb-2" />
                  <p className="text-xs font-bold text-slate-300">No Image Loaded</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Click &quot;Choose File&quot; below to load a photo</p>
                </div>
              </div>
            )}

            {/* Guide Overlays */}
            {guideMode === "circle" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-[88%] rounded-full border-2 border-dashed border-cyan-400/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            )}

            {guideMode === "grid" && (
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-cyan-400/40" />
                <div className="border-r border-b border-cyan-400/40" />
                <div className="border-b border-cyan-400/40" />
                <div className="border-r border-b border-cyan-400/40" />
                <div className="border-r border-b border-cyan-400/40" />
                <div className="border-b border-cyan-400/40" />
                <div className="border-r border-cyan-400/40" />
                <div className="border-r border-cyan-400/40" />
                <div />
              </div>
            )}

            {/* Instruction tooltip */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold text-slate-300 backdrop-blur-sm border border-white/10">
                Drag to reposition • Scroll or slider to zoom
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS TOOLBAR */}
        <div className="mt-4 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3 bg-[#030914] px-3 py-2 rounded-xl border border-white/10">
            <FaMagnifyingGlassMinus className="text-slate-400 text-xs shrink-0" />
            <input
              type="range"
              min="1"
              max="3.5"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-slate-800"
            />
            <FaMagnifyingGlassPlus className="text-slate-400 text-xs shrink-0" />
            <span className="text-[11px] font-mono text-amber-300 w-10 text-right shrink-0">
              {zoom.toFixed(2)}x
            </span>
          </div>

          {/* Action Buttons: Rotate, Reset, Replace File */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateClockwise}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                title="Rotate 90 degrees clockwise"
              >
                <FaRotateRight className="text-xs text-amber-400" />
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={resetCrop}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                title="Reset zoom and position"
              >
                <FaArrowsRotate className="text-xs text-cyan-400" />
                <span>Reset</span>
              </button>
            </div>

            {/* Change File button */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 transition-all cursor-pointer"
              >
                <FaUpload className="text-xs" />
                <span>Choose New File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={saving || !imageSrc || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="size-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Saving Photo...</span>
              </>
            ) : (
              <>
                <FaCheck />
                <span>Save Cropped Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

