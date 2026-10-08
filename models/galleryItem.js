import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Match Action",
        "Tournament Moments",
        "Auction Stage",
        "Opening Ceremony",
        "Awards & Trophy",
        "Team Photos",
      ],
      default: "Match Action",
    },
    date: { type: String, default: "" },
    description: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.GalleryItem ??
  mongoose.model("GalleryItem", galleryItemSchema);
