import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    prompt: String,
    description: String,
    image: String,
    userId: { type: String, required: true },   // 👈 MUST HAVE
    likes: { type: Number, default: 0 },
    comments: [
      {
        text: String,
        author: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
