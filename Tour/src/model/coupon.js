import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    required: true,
  },
  discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          // If percentage, value cannot be > 100
          if (this.discountType === 'percentage' && value > 100) {
            return false;
          }
          return true;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
  },
    userUsage: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// couponSchema.index({ code: 1 }); // Removed to prevent duplicate index warning (unique: true handles it)
couponSchema.index({ endDate: 1 });
couponSchema.index({ isActive: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
