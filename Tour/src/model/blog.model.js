import mongoose from 'mongoose';
import slugify from 'slugify';
import POST_STATUS from '../config/constants.js';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  content_markdown: {
    type: String,
    required: [true, 'Content is required'],
    validate: {
      validator: function (v) {
        return v.length <= 100000 // Max 100KB
      },
      message: 'Content too large',
    },
  },
  content_html: {
    type: String,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters'],
  },
  featured_image: {
    public_id: String,
    url: String,
    alt: {
      type: String,
      maxlength: [125, 'Alt text cannot exceed 125 characters'],
    },
    caption: String,
    width: Number,
    height: Number,
    format: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],

  status: {
    type: String,
    enum: Object.values(POST_STATUS),
    default: POST_STATUS.DRAFT
  },

  published_at: {
    type: Date
  },

  meta_title: {
    type: String,
    trim: true,
    maxlength: [70, 'Meta title cannot exceed 70 characters']
  },

  meta_description: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  view_count: {
    type: Number,
    default: 0,
    min: 0
  },

  is_featured: {
    type: Boolean,
    default: false
  },

  images_in_content: [{
    public_id: String,
    url: String,
    alt: String,
    position: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ published_at: -1 });
blogSchema.index({ is_featured: 1 });
blogSchema.index({ view_count: -1 });
blogSchema.index({ 'tags': 1 });

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true
    });
  }
  if (this.isModified('status') && this.status === POST_STATUS.PUBLISHED && !this.published_at) {
    this.published_at = new Date();
  }

  next();
});

blogSchema.virtual('url').get(function () {
  return `/blog/${this.slug}`;
});

blogSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  match: { status: 'approved' }
});

blogSchema.methods.incrementViewCount = async function () {
  this.view_count += 1;
  await this.save({ validateBeforeSave: false });
};
export const Blog = mongoose.model('Blog', blogSchema)
