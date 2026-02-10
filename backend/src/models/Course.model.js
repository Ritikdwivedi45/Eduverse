import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    thumbnail: String,
    status: {
      type: String,
      enum: ["draft", "published", "pending", "rejected"],
      default: "draft"
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    enrollmentsCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 🔥 ADD THIS
courseSchema.methods.isAccessible = function (user) {
  if (this.status === "published") return true;
  if (!user) return false;
  if (user.role === "instructor" && this.instructorId.equals(user.id)) return true;
  if (user.role === "admin") return true;
  return false;
};

const Course = mongoose.model("Course", courseSchema);
export default Course;
