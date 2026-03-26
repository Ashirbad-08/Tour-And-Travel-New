import mongoose from 'mongoose';
import COMMENT_STATUS from '../config/constants.js';

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },

  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [5, 'Comment must be at least 5 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },

  status: {
    type: String,
    enum: Object.values(COMMENT_STATUS),
    default: COMMENT_STATUS.PENDING
  },

  is_edited: {
    type: Boolean,
    default: false
  },

  edited_at: Date,

  parent_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  like_count: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ post: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ created_at: -1 });
commentSchema.index({ parent_comment: 1 });

// Update like count before saving
commentSchema.pre('save', function (next) {
  this.like_count = this.likes.length;
  next();
});

export const Comment = mongoose.model('Comment', commentSchema);
