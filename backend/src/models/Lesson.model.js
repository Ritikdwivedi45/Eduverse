import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    index: true, // faster lookup
  },
  lessonTitle: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Lesson", lessonSchema);