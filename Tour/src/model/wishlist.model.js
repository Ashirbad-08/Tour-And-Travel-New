// import mongoose from "mongoose";

// const wishlistSchema = new mongoose.Schema(
//   {
//     package: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Package",
//       required: true
//     }
//   },
//   { timestamps: true }
// );

// // Prevent duplicate package in wishlist
// wishlistSchema.index({ package: 1 }, { unique: true });

// const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// export default Wishlist;




import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Wishlist", wishlistSchema);
