import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './utils/errorHandler.js';


const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    return callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Route imports
import galleryRoutes from "./Routes/gallery.routes.js";
import authRoutes from "./Routes/auth.routes.js";
import adminRoutes from "./Routes/admin.routes.js";
import adminAuthRoutes from "./Routes/adminRoutes.js";
import guideRoutes from "./Routes/guide.routes.js";
import bookingRoutes from "./Routes/bookings.routes.js";
import reviewRoutes from "./Routes/review.routes.js";
import faqRoutes from "./Routes/faq.routes.js";
import pakageRoutes from './Routes/package.routes.js';
import travelPlanRoutes from './Routes/travelPlan.routes.js';
import searchPackageRoutes from './Routes/searchPackage.route.js';
import globalSearchRoutes from './Routes/globalSearch.route.js';
import trendingRoutes from './Routes/trending.route.js';
import couponRoutes from './Routes/coupon.routes.js'
import notificationRoutes from "./Routes/notification.routes.js";
import wishlistRoutes from "./Routes/wishlist.routes.js";
import loyaltyRoutes from "./Routes/loyality.routes.js";
import dashboardRoutes from "./Routes/dashboard.routes.js";
import serviceRoutes from "./Routes/service.routes.js";




//Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/blog", adminRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/packages", pakageRoutes);
app.use("/api/travelPlans", travelPlanRoutes);
app.use("/api/search", searchPackageRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/globalsearch", globalSearchRoutes);
app.use("/api/trending", trendingRoutes);
app.use('/api/coupons', couponRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/loyalty", loyaltyRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", serviceRoutes);


app.get('/', (req, res) => {
  res.send('API running...');
});

app.use(errorHandler);

export default app;
