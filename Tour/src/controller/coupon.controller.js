import { Coupon } from "../model/coupon.js";
import { createNotification } from "../utils/createNotification.js";

// CREATE COUPON (ADMIN ONLY) --------------------------------------------

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
    } = req.body;

    //Basic required validations
    if (
      !code ||
      !description ||
      !discount_type ||
      discountValue === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Date validation
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be greater than start date",
      });
    }

    // Discount type validation
    if (!["percentage", "fixed_amount"].includes(discount_type)) {
      return res.status(400).json({
        message: "Invalid discount type",
      });
    }

    // Percentage validation
    if (discount_type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        message: "Percentage discount cannot exceed 100",
      });
    }

    //Check duplicate coupon code
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(409).json({
        message: "Coupon code already exists",
      });
    }

    //Create coupon
    const coupon = await Coupon.create({
      code,
      description,
      discount_type,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
    });

    await createNotification({
      type: "coupon",
      title: "New Coupon Created",
      message: `Coupon ${coupon.code} created`,
      referenceId: coupon._id
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

//UPDATE COUPON (ADMIN ONLY) -------------------------------------------- 
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      description,
      discount_type,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be greater than start date",
      });
    }

    if (discount_type === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100",
      });
    }

    if (description !== undefined) coupon.description = description;
    if (discount_type !== undefined) coupon.discount_type = discount_type;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchaseAmount !== undefined)
      coupon.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = maxDiscountAmount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (startDate !== undefined) coupon.startDate = startDate;
    if (endDate !== undefined) coupon.endDate = endDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    await createNotification({
      type: "coupon",
      title: "Coupon Status Updated",
      message: `Coupon ${coupon.code} status updated`,
      referenceId: coupon._id
    });

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

//DELETE COUPON (ADMIN ONLY) --------------------------------------------
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

//UPDATE COUPON STATUS (ADMIN ONLY) --------------------------------------------
export const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon status updated successfully",
      coupon,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon status",
    });
  }
};

//GET ALL COUPONS (ADMIN ONLY) --------------------------------------------
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};
//verify coupon
//import { Coupon } from "../model/coupon.js";

//VALIDATE COUPON (USER) --------------------------------------------

export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount } = req.body;

    if (!couponCode || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order amount are required"
      });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive coupon"
      });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired or not active"
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached"
      });
    }

    if (orderAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${coupon.minPurchaseAmount}`
      });
    }

    let discountAmount = 0;

    if (coupon.discount_type === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        couponId: coupon._id,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//GET ACTIVE COUPONS (USER) --------------------------------------------
export const getActiveCoupons = async (req, res) => {
  const now = new Date();

  const coupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).select("-userUsage -usedCount");

  res.json({
    success: true,
    count: coupons.length,
    data: coupons
  });
};


//VERIFY COUPON (BOTH USER AND ADMIN) --------------------------------------------

export const verifyCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount } = req.body;

    
    if (!couponCode || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order amount are required"
      });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase()
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }

    // Check Active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Coupon is inactive"
      });
    }

    //Check Date Validity
    const now = new Date();

    if (now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon not started yet"
      });
    }

    if (now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired"
      });
    }

    //Check Usage Limit
    if (
      coupon.usageLimit &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached"
      });
    }

    //Check Minimum Purchase
    if (orderAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase should be ${coupon.minPurchaseAmount}`
      });
    }

    //Calculate Discount
    let discountAmount = 0;

    if (coupon.discount_type === "percentage") {
      discountAmount =
        (orderAmount * coupon.discountValue) / 100;

      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(
          discountAmount,
          coupon.maxDiscountAmount
        );
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = orderAmount - discountAmount;

    //Send Response (Preview Only)
    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: {
        couponCode: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discountValue,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
        validTill: coupon.endDate
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//GET COUPON USAGE (ADMIN ONLY) --------------------------------------------

export const getCouponUsage = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found"
    });
  }

  res.json({
    success: true,
    data: {
      code: coupon.code,
      usedCount: coupon.usedCount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit
    }
  });
};
