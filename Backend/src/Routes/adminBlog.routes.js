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
  getBlogStats,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controller/blog.controller.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bridge middleware: map req.admin → req.user for blog controller compatibility
const bridgeAdminUser = (req, res, next) => {
  if (req.admin) {
    req.user = {
      id: req.admin._id.toString(),
      role: req.admin.role === 'main_admin' ? 'admin' : req.admin.role,
    };
  }
  next();
};

// Apply auth + bridge to all admin blog routes
router.use(protectAdmin, bridgeAdminUser);

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

// Category Management
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
