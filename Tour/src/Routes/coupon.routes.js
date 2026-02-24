import express from 'express';
//import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon, updateCouponStatus } from '../controller/coupon.controller.js';
import { 
  createCoupon,
  deleteCoupon, 
  getAllCoupons, 
  getActiveCoupons,
  updateCoupon, 
  updateCouponStatus, 
  verifyCoupon,
  validateCoupon,
  getCouponUsage
} 
from '../controller/coupon.controller.js';


import { userAuth } from "../middleware/userAuthMiddleware.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/',protectAdmin ,createCoupon);
router.put('/:id',protectAdmin, updateCoupon);
router.patch('/status/:id',protectAdmin, updateCouponStatus);
router.delete('/:id',protectAdmin , deleteCoupon);
router.get('/', protectAdmin , getAllCoupons);
router.get('/active-coupon' , userAuth , getActiveCoupons)
router.post('/verify', verifyCoupon);
router.post("/validate", userAuth, validateCoupon);//user can validate 
router.get("/:id/usage", protectAdmin, getCouponUsage);


export default router;