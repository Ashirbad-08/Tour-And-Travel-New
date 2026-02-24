import express from 'express';
import {
  getArchive,
  getFeaturedPosts,
  getPopularPosts,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  getPublishedPosts,
  getRecentPosts,
  incrementViewCount,
  searchPosts
} from '../controller/blog.controller.js';

const router = express.Router();

// Public routes
router.get('/posts', getPublishedPosts);
router.get('/posts/:slug', getPostBySlug);
router.get('/featured', getFeaturedPosts);
router.get('/recent', getRecentPosts);
router.get('/popular', getPopularPosts);
router.get('/search', searchPosts);
router.get('/categories/:slug/posts', getPostsByCategory);
router.get('/tags/:tag/posts', getPostsByTag);
router.get('/archive', getArchive);

// Interactions
router.post('/posts/:id/view', incrementViewCount);

export default router;
