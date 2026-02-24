import cron from "node-cron";
import { Coupon } from "../model/coupon.js";

cron.schedule("0 0 * * *", async () => {
  await Coupon.updateMany(
    { endDate: { $lt: new Date() } },
    { isActive: false }
  );
});