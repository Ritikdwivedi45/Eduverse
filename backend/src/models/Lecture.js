import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  duration: {
    type: Number, // in seconds
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 second']
  },
  order: {
    type: Number,
    required: [true, 'Lecture order is required'],
    min: 1
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index for order per course
lectureSchema.index({ courseId: 1, order: 1 }, { unique: true });

// Index for performance
lectureSchema.index({ courseId: 1, isDeleted: 1 });

// Pre-save to ensure order is maintained
lectureSchema.pre('save', async function(next) {
  if (this.isNew) {
    const maxOrder = await this.constructor.findOne(
      { courseId: this.courseId },
      { order: 1 },
      { sort: { order: -1 } }
    );
    if (!maxOrder) {
      this.order = 1;
    } else if (!this.order) {
      this.order = maxOrder.order + 1;
    }
  }
  next();
});

// Soft delete method
lectureSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;