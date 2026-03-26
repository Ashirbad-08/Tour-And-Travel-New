import express from 'express';
import blogRoutes from './blog.routes.js';
import adminRoutes from '../admin.routes.js';

const router = express.Router();

// Public blog routes
router.use('/blog', blogRoutes);

// Admin routes
router.use('/admin/blog', adminRoutes);

export default router;
