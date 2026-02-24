import slugify from 'slugify';
import POST_STATUS from '../config/constants.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Blog } from '../model/blog.model.js';
import { Category } from '../model/category.model.js';
import { Comment } from '../model/comment.model.js';
import ApiResponse from '../utils/apiResponse.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import parseMarkdown, { generateExcerpt } from '../utils/markdownParser.js';

/**
 * @desc    Extract images from markdown content
 * @param   {string} markdown - Raw markdown content
 * @returns {Array} Array of image objects
 */

const extractImagesFromMarkdown = (markdown) => {
  if (!markdown) return [];
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const images = [];
  let match;
  let position = 0;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1] || '',
      url: match[2],
      position: position++
    });
  }

  return images;
};

/**
 * @desc    Get all published blog posts (Public)
 * @route   GET /api/blog/posts
 * @access  Public
 */
export const getPublishedPosts = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  // Build query
  const query = { status: POST_STATUS.PUBLISHED };

  // Filtering
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (category) {
      query.categories = category._id;
    }
  }

  if (req.query.tag) {
    query.tags = { $in: [req.query.tag.toLowerCase()] };
  }

  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  if (req.query.author) {
    query.author = req.query.author;
  }

  if (req.query.year) {
    const startDate = new Date(req.query.year, 0, 1);
    const endDate = new Date(req.query.year + 1, 0, 1);
    query.published_at = { $gte: startDate, $lt: endDate };
  }

  // Sorting
  const sortBy = req.query.sort || 'published_at';
  const order = req.query.order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: order };

  // Execute query
  const posts = await Blog.find(query)
    .populate('author', 'name avatar url')
    .populate('categories', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-content_markdown -content_html'); // Don't send content in list

  // Get total count
  const total = await Blog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Calculate next and previous pages
  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };

  res.status(200).json(
    ApiResponse.success({
      posts,
      pagination,
      filters: {
        category: req.query.category || null,
        tag: req.query.tag || null,
        search: req.query.search || null,
        sort: sortBy,
        order: order === 1 ? 'asc' : 'desc'
      }
    })
  );
});

/**
 * @desc    Get single blog post by slug (Public)
 * @route   GET /api/blog/posts/:slug
 * @access  Public
 */
export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await Blog.findOne({ slug, status: POST_STATUS.PUBLISHED })
    .populate('author', 'name email avatar bio')
    .populate('categories', 'name slug')
    .lean(); // Convert to plain object for manipulation

  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Increment view count (fire and forget)
  Blog.findByIdAndUpdate(post._id, { $inc: { view_count: 1 } }).exec();

  // Get related posts (same category)
  const relatedPosts = await Blog.find({
    _id: { $ne: post._id },
    categories: { $in: post.categories },
    status: POST_STATUS.PUBLISHED
  })
    .limit(3)
    .select('title slug excerpt featured_image published_at')
    .populate('categories', 'name slug');

  // Get comments for this post
  const comments = await Comment.find({
    post: post._id,
    status: 'approved',
    parent_comment: null // Only top-level comments
  })
    .populate('user', 'name avatar')
    .sort({ created_at: -1 });

  // Structure comments as nested (replies)
  const structuredComments = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({
        parent_comment: comment._id,
        status: 'approved'
      })
        .populate('user', 'name avatar')
        .sort({ created_at: 1 });

      return {
        ...comment.toObject(),
        replies
      };
    })
  );

  // Get next and previous posts
  const [nextPost, prevPost] = await Promise.all([
    Blog.findOne({
      published_at: { $gt: post.published_at },
      status: POST_STATUS.PUBLISHED
    })
      .sort({ published_at: 1 })
      .select('title slug'),

    Blog.findOne({
      published_at: { $lt: post.published_at },
      status: POST_STATUS.PUBLISHED
    })
      .sort({ published_at: -1 })
      .select('title slug')
  ]);

  res.status(200).json(
    ApiResponse.success({
      ...post,
      related_posts: relatedPosts,
      comments: structuredComments,
      next_post: nextPost,
      prev_post: prevPost,
      reading_time: Math.ceil(post.content_html.split(' ').length / 200) // 200 words per minute
    })
  );
});

/**
 * @desc    Create new blog post (Admin/Editor)
 * @route   POST /api/admin/posts
 * @access  Private (Admin/Editor)
 */
export const createPost = asyncHandler(async (req, res) => {
  const {
    title,
    content_markdown,
    excerpt,
    categories,
    tags,
    status,
    featured_image,
    meta_title,
    meta_description,
    is_featured,
    published_at
  } = req.body;

  // Check if slug already exists
  const existingSlug = await Blog.findOne({ slug: req.body.slug });
  if (existingSlug) {
    return res.status(409).json(
      ApiResponse.conflict('A post with this title/slug already exists')
    );
  }

  // Parse markdown to HTML
  const content_html = parseMarkdown(content_markdown);

  // Generate excerpt if not provided
  const postExcerpt = excerpt || generateExcerpt(content_markdown);

  // Extract images from markdown content
  const images_in_content = extractImagesFromMarkdown(content_markdown);

  // Convert tags to lowercase and remove duplicates
  const processedTags = tags ? [...new Set(tags.map(tag => tag.toLowerCase()))] : [];

  // Validate categories
  if (categories && categories.length > 0) {
    const validCategories = await Category.find({ _id: { $in: categories } });
    if (validCategories.length !== categories.length) {
      return res.status(400).json(
        ApiResponse.badRequest('One or more categories are invalid')
      );
    }
  }

  // Create post
  const post = await Blog.create({
    title,
    content_markdown,
    content_html,
    excerpt: postExcerpt,
    author: req.user.id,
    categories: categories || [],
    tags: processedTags,
    status: status || POST_STATUS.DRAFT,
    featured_image: featured_image || null,
    meta_title: meta_title || title,
    meta_description: meta_description || postExcerpt,
    is_featured: is_featured || false,
    published_at: published_at || (status === POST_STATUS.PUBLISHED ? new Date() : null),
    images_in_content
  });

  // Populate author and categories
  const populatedPost = await Blog.findById(post._id)
    .populate('author', 'name email avatar')
    .populate('categories', 'name slug');

  res.status(201).json(
    ApiResponse.created(populatedPost, 'Blog post created successfully')
  );
});

/**
 * @desc    Update blog post (Admin/Editor)
 * @route   PUT /api/admin/posts/:id
 * @access  Private (Admin/Editor)
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Find post
  const post = await Blog.findById(id);
  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Check if user owns the post or is admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.forbidden('Not authorized to update this post')
    );
  }

  // If title changed, update slug
  if (updateData.title && updateData.title !== post.title) {
    const slug = slugify(updateData.title, { lower: true, strict: true });
    const existingSlug = await Blog.findOne({ slug, _id: { $ne: id } });

    if (existingSlug) {
      return res.status(409).json(
        ApiResponse.conflict('A post with this title already exists')
      );
    }

    updateData.slug = slug;
  }

  // If content changed, regenerate HTML and extract images
  if (updateData.content_markdown) {
    updateData.content_html = parseMarkdown(updateData.content_markdown);
    updateData.images_in_content = extractImagesFromMarkdown(updateData.content_markdown);

    // If excerpt not provided, regenerate it
    if (!updateData.excerpt) {
      updateData.excerpt = generateExcerpt(updateData.content_markdown);
    }
  }

  // Process tags
  if (updateData.tags) {
    updateData.tags = [...new Set(updateData.tags.map(tag => tag.toLowerCase()))];
  }

  // If status changed to published and no published_at date, set it
  if (updateData.status === POST_STATUS.PUBLISHED && !updateData.published_at) {
    updateData.published_at = new Date();
  }

  // Update post
  const updatedPost = await Blog.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('author', 'name email avatar')
    .populate('categories', 'name slug');

  res.status(200).json(
    ApiResponse.success(updatedPost, 'Blog post updated successfully')
  );
});

/**
 * @desc    Delete blog post (Admin)
 * @route   DELETE /api/admin/posts/:id
 * @access  Private (Admin)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findById(id);
  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Delete featured image from Cloudinary
  if (post.featured_image && post.featured_image.public_id) {
    try {
      await deleteFromCloudinary(post.featured_image.public_id);
    } catch (error) {
      console.error('Failed to delete featured image:', error.message);
    }
  }

  // Delete images from content (optional - could keep them for other posts)
  if (post.images_in_content && post.images_in_content.length > 0) {
    const deletePromises = post.images_in_content
      .filter(img => img.public_id)
      .map(img => deleteFromCloudinary(img.public_id)
        .catch(err => console.error('Failed to delete content image:', err.message))
      );

    await Promise.all(deletePromises);
  }

  // Delete associated comments
  await Comment.deleteMany({ post: id });

  // Delete post
  await post.deleteOne();

  res.status(200).json(
    ApiResponse.success(null, 'Blog post deleted successfully')
  );
});

/**
 * @desc    Get all blog posts (Admin - includes drafts)
 * @route   GET /api/admin/posts
 * @access  Private (Admin/Editor)
 */
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by author (for admin, show all; for editor, show only their posts)
  if (req.user.role === 'editor') {
    query.author = req.user.id;
  }

  // Search
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { excerpt: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Sorting
  const sortBy = req.query.sort || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: order };

  // Execute query
  const posts = await Blog.find(query)
    .populate('author', 'name email')
    .populate('categories', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };

  res.status(200).json(
    ApiResponse.success({ posts, pagination })
  );
});

/**
 * @desc    Get single post for editing (Admin/Editor)
 * @route   GET /api/admin/posts/:id
 * @access  Private (Admin/Editor)
 */
export const getPostForEdit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findById(id)
    .populate('author', 'name email')
    .populate('categories', 'name _id');

  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Check permissions
  if (post.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.forbidden('Not authorized to access this post')
    );
  }

  res.status(200).json(
    ApiResponse.success(post)
  );
});

/**
 * @desc    Publish a draft post (Admin/Editor)
 * @route   PUT /api/admin/posts/:id/publish
 * @access  Private (Admin/Editor)
 */
export const publishPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findById(id);
  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Check permissions
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.forbidden('Not authorized to publish this post')
    );
  }

  post.status = POST_STATUS.PUBLISHED;
  post.published_at = new Date();
  await post.save();

  res.status(200).json(
    ApiResponse.success(post, 'Blog post published successfully')
  );
});

/**
 * @desc    Archive a post (Admin/Editor)
 * @route   PUT /api/admin/posts/:id/archive
 * @access  Private (Admin/Editor)
 */
export const archivePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findById(id);
  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  post.status = POST_STATUS.ARCHIVED;
  await post.save();

  res.status(200).json(
    ApiResponse.success(post, 'Blog post archived successfully')
  );
});

/**
 * @desc    Duplicate a post (Admin/Editor)
 * @route   POST /api/admin/posts/:id/duplicate
 * @access  Private (Admin/Editor)
 */
export const duplicatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const originalPost = await Blog.findById(id);
  if (!originalPost) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  // Create duplicate
  const duplicateData = {
    ...originalPost.toObject(),
    _id: undefined,
    title: `${originalPost.title} (Copy)`,
    slug: `${originalPost.slug}-copy-${Date.now()}`,
    status: POST_STATUS.DRAFT,
    published_at: null,
    view_count: 0,
    is_featured: false,
    created_at: new Date(),
    updated_at: new Date()
  };

  const duplicatePost = await Blog.create(duplicateData);

  res.status(201).json(
    ApiResponse.created(duplicatePost, 'Blog post duplicated successfully')
  );
});

/**
 * @desc    Toggle featured status (Admin)
 * @route   PUT /api/admin/posts/:id/toggle-featured
 * @access  Private (Admin)
 */
export const toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findById(id);
  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  post.is_featured = !post.is_featured;
  await post.save();

  const message = post.is_featured
    ? 'Post marked as featured'
    : 'Post removed from featured';

  res.status(200).json(
    ApiResponse.success(post, message)
  );
});

/**
 * @desc    Get featured posts (Public)
 * @route   GET /api/blog/featured
 * @access  Public
 */
export const getFeaturedPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const featuredPosts = await Blog.find({
    is_featured: true,
    status: POST_STATUS.PUBLISHED
  })
    .sort({ published_at: -1 })
    .limit(limit)
    .select('title slug excerpt featured_image published_at view_count')
    .populate('author', 'name avatar')
    .populate('categories', 'name slug');

  res.status(200).json(
    ApiResponse.success(featuredPosts)
  );
});

/**
 * @desc    Get recent posts (Public)
 * @route   GET /api/blog/recent
 * @access  Public
 */
export const getRecentPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const recentPosts = await Blog.find({
    status: POST_STATUS.PUBLISHED
  })
    .sort({ published_at: -1 })
    .limit(limit)
    .select('title slug excerpt featured_image published_at')
    .populate('author', 'name avatar')
    .populate('categories', 'name slug');

  res.status(200).json(
    ApiResponse.success(recentPosts)
  );
});

/**
 * @desc    Get popular posts (Public)
 * @route   GET /api/blog/popular
 * @access  Public
 */
export const getPopularPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const popularPosts = await Blog.find({
    status: POST_STATUS.PUBLISHED
  })
    .sort({ view_count: -1 })
    .limit(limit)
    .select('title slug excerpt featured_image published_at view_count')
    .populate('author', 'name avatar')
    .populate('categories', 'name slug');

  res.status(200).json(
    ApiResponse.success(popularPosts)
  );
});

/**
 * @desc    Search blog posts (Public)
 * @route   GET /api/blog/search
 * @access  Public
 */
export const searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json(
      ApiResponse.badRequest('Search query must be at least 3 characters long')
    );
  }

  const posts = await Blog.find({
    $text: { $search: q },
    status: POST_STATUS.PUBLISHED
  })
    .select('title slug excerpt featured_image published_at')
    .populate('author', 'name avatar')
    .populate('categories', 'name slug')
    .limit(10);

  res.status(200).json(
    ApiResponse.success({
      query: q,
      results: posts,
      count: posts.length
    })
  );
});

/**
 * @desc    Get posts by category (Public)
 * @route   GET /api/blog/categories/:slug/posts
 * @access  Public
 */
export const getPostsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const category = await Category.findOne({ slug });
  if (!category) {
    return res.status(404).json(
      ApiResponse.notFound('Category not found')
    );
  }

  const posts = await Blog.find({
    categories: category._id,
    status: POST_STATUS.PUBLISHED
  })
    .populate('author', 'name avatar')
    .populate('categories', 'name slug')
    .sort({ published_at: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content_markdown -content_html');

  const total = await Blog.countDocuments({
    categories: category._id,
    status: POST_STATUS.PUBLISHED
  });

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };

  res.status(200).json(
    ApiResponse.success({
      category,
      posts,
      pagination
    })
  );
});

/**
 * @desc    Get posts by tag (Public)
 * @route   GET /api/blog/tags/:tag/posts
 * @access  Public
 */
export const getPostsByTag = asyncHandler(async (req, res) => {
  const { tag } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Blog.find({
    tags: tag.toLowerCase(),
    status: POST_STATUS.PUBLISHED
  })
    .populate('author', 'name avatar')
    .populate('categories', 'name slug')
    .sort({ published_at: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content_markdown -content_html');

  const total = await Blog.countDocuments({
    tags: tag.toLowerCase(),
    status: POST_STATUS.PUBLISHED
  });

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };

  res.status(200).json(
    ApiResponse.success({
      tag,
      posts,
      pagination
    })
  );
});

/**
 * @desc    Get blog archive (group by year/month)
 * @route   GET /api/blog/archive
 * @access  Public
 */
export const getArchive = asyncHandler(async (req, res) => {
  const archive = await Blog.aggregate([
    {
      $match: {
        status: POST_STATUS.PUBLISHED,
        published_at: { $ne: null }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$published_at" },
          month: { $month: "$published_at" }
        },
        count: { $sum: 1 },
        posts: {
          $push: {
            title: "$title",
            slug: "$slug",
            published_at: "$published_at"
          }
        }
      }
    },
    {
      $sort: {
        "_id.year": -1,
        "_id.month": -1
      }
    }
  ]);

  // Format archive data
  const formattedArchive = archive.map(item => ({
    year: item._id.year,
    month: item._id.month,
    monthName: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' }),
    count: item.count,
    posts: item.posts
  }));

  res.status(200).json(
    ApiResponse.success(formattedArchive)
  );
});

/**
 * @desc    Increment post view count
 * @route   POST /api/blog/posts/:id/view
 * @access  Public
 */
export const incrementViewCount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Blog.findByIdAndUpdate(
    id,
    { $inc: { view_count: 1 } },
    { new: true }
  ).select('view_count');

  if (!post) {
    return res.status(404).json(
      ApiResponse.notFound('Blog post not found')
    );
  }

  res.status(200).json(
    ApiResponse.success({ view_count: post.view_count })
  );
});

/**
 * @desc    Get blog statistics (Admin)
 * @route   GET /api/admin/blog/stats
 * @access  Private (Admin)
 */
export const getBlogStats = asyncHandler(async (req, res) => {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalViews,
    totalComments,
    postsByMonth,
    popularPosts
  ] = await Promise.all([
    // Total posts
    Blog.countDocuments(),

    // Published posts
    Blog.countDocuments({ status: POST_STATUS.PUBLISHED }),

    // Draft posts
    Blog.countDocuments({ status: POST_STATUS.DRAFT }),

    // Archived posts
    Blog.countDocuments({ status: POST_STATUS.ARCHIVED }),

    // Total views
    Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$view_count" } } }
    ]),

    // Total comments
    Comment.countDocuments({ status: 'approved' }),

    // Posts by month (last 6 months)
    Blog.aggregate([
      {
        $match: {
          published_at: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$published_at" },
            month: { $month: "$published_at" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]),

    // Most popular posts
    Blog.find({ status: POST_STATUS.PUBLISHED })
      .sort({ view_count: -1 })
      .limit(5)
      .select('title slug view_count published_at')
  ]);

  const stats = {
    total_posts: totalPosts,
    published_posts: publishedPosts,
    draft_posts: draftPosts,
    archived_posts: archivedPosts,
    total_views: totalViews[0]?.total || 0,
    total_comments: totalComments,
    posts_by_month: postsByMonth,
    popular_posts: popularPosts,
    average_views_per_post: totalViews[0]?.total / publishedPosts || 0
  };

  res.status(200).json(
    ApiResponse.success(stats)
  );
});
