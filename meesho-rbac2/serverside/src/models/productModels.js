import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory"
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    images: [
      {
        url: String,
        public_id: String,
      }
    ],

    stock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    variants: [
      {
        size: { type: String, required: true },
        color: { type: String },
        stock: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;