import express from 'express';
import {
  getAllPosts,
  createPost,
  getPostForEdit,
  updatePost,
  deletePost,
  publishPost,
  archivePost,
  duplicatePost,
  toggleFeatured,
  getBlogStats
} from '../controller/blog.controller.js';

const router = express.Router();

// Admin routes (Note: Authentication middleware should be added here later)
router.get('/posts', getAllPosts);
router.post('/posts', createPost);
router.get('/posts/:id', getPostForEdit);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);
router.put('/posts/:id/publish', publishPost);
router.put('/posts/:id/archive', archivePost);
router.post('/posts/:id/duplicate', duplicatePost);
router.put('/posts/:id/toggle-featured', toggleFeatured);
router.get('/stats', getBlogStats);

export default router;
