import express from "express";
import dotenv from "dotenv";
dotenv.config();

import "./src/config/connectDB.js";
import mainRouter from "./src/routes/auth/mainAuth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoryRoutes from "./src/routes/category1/categoryRoutes.js";
import productRoutes from "./src/routes/products/productsRoutes.js";
import cartRoutes from "./src/routes/cart/cartRoutes.js";
import addressRoutes from "./src/routes/address/userAddressRouter.js";
import orderRoutes from "./src/routes/order/orderRoutes.js";
// import sellerRoutes from "./src/routes/seller/sellerRouter.js"; // seller routes disabled
// import sellerDashboardRoutes from "./src/routes/seller/sellerDashboard.js"; // seller routes disabled
import adminRoutes from "./src/routes/admin/adminRoutes.js";
import paymentRoutes from "./src/routes/payment/paymentRoutes.js";
import refundRoutes from "./src/routes/refund/refundRoutes.js";
import wishlistRoutes from "./src/routes/wishlist/wishlistRoutes.js";
import userProfileRoutes from "./src/routes/user/userProfileRoutes.js";
// import sellerProfileRoutes from "./src/routes/sellerProfile/sellerProfileRoutes.js"; // seller routes disabled
import errorHandler from "./src/middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./src/config/swagger.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9706;

const swaggerCustomCss = `
  body {
    background-color: #0b0f19 !important;
    color: #f3f4f6 !important;
    font-family: 'Outfit', 'Inter', sans-serif !important;
  }
  .swagger-ui {
    background-color: #0b0f19 !important;
  }
  .swagger-ui .info .title, .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3, .swagger-ui .info h4, .swagger-ui .info h5, .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info code {
    color: #f3f4f6 !important;
  }
  .swagger-ui .scheme-container {
    background-color: #111827 !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    border-radius: 8px !important;
    border: 1px solid #1f2937 !important;
  }
  .swagger-ui select {
    background-color: #1f2937 !important;
    color: #f3f4f6 !important;
    border: 1px solid #374151 !important;
  }
  .swagger-ui .opblock {
    border-radius: 8px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
  .swagger-ui .opblock .opblock-summary {
    border-bottom: none !important;
  }
  .swagger-ui .opblock.opblock-post {
    background: rgba(16, 185, 129, 0.15) !important;
    border-color: #10b981 !important;
  }
  .swagger-ui .opblock.opblock-get {
    background: rgba(59, 130, 246, 0.15) !important;
    border-color: #3b82f6 !important;
  }
  .swagger-ui .opblock.opblock-put {
    background: rgba(245, 158, 11, 0.15) !important;
    border-color: #f59e0b !important;
  }
  .swagger-ui .opblock.opblock-delete {
    background: rgba(239, 68, 68, 0.15) !important;
    border-color: #ef4444 !important;
  }
  .swagger-ui .opblock.opblock-patch {
    background: rgba(139, 92, 246, 0.15) !important;
    border-color: #8b5cf6 !important;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 6px !important;
    font-weight: 700 !important;
  }
  .swagger-ui .opblock-section-header {
    background-color: #111827 !important;
    color: #f3f4f6 !important;
    border-bottom: 1px solid #1f2937 !important;
  }
  .swagger-ui .tabli button {
    color: #9ca3af !important;
  }
  .swagger-ui .tabli.active button {
    color: #f3f4f6 !important;
    font-weight: bold !important;
  }
  .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p, .swagger-ui .opblock-title_normal p {
    color: #d1d5db !important;
  }
  .swagger-ui table thead tr td, .swagger-ui table thead tr th {
    color: #f3f4f6 !important;
    border-bottom: 2px solid #1f2937 !important;
  }
  .swagger-ui .dialog-ux .modal-ux {
    background-color: #111827 !important;
    border: 1px solid #1f2937 !important;
  }
  .swagger-ui .dialog-ux .modal-ux-header h3 {
    color: #f3f4f6 !important;
  }
  .swagger-ui .dialog-ux .modal-ux-content h4 {
    color: #d1d5db !important;
  }
  .swagger-ui .auth-container {
    color: #f3f4f6 !important;
  }
  .swagger-ui .auth-btn-wrapper .btn-done {
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: white !important;
  }
  .swagger-ui .btn {
    background-color: #1f2937 !important;
    color: #f3f4f6 !important;
    border-color: #374151 !important;
    border-radius: 6px !important;
  }
  .swagger-ui .btn.authorize {
    background-color: transparent !important;
    color: #10b981 !important;
    border-color: #10b981 !important;
  }
  .swagger-ui .btn.authorize svg {
    fill: #10b981 !important;
  }
  .swagger-ui .topbar {
    background-color: #0b0f19 !important;
    border-bottom: 1px solid #1f2937 !important;
  }
  .swagger-ui .info {
    margin: 30px 0 !important;
  }
`;

// EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: swaggerCustomCss,
  customSiteTitle: "Meesho RBAC API Documentation"
}));

// ── Role-based route groups ────────────────────────────────────────────────
// PUBLIC  → no auth   (product browse, categories)
// USER    → auth + isUser
// ADMIN   → auth + isAdmin
// SELLER  → all seller routes are commented out inside each file below
// ──────────────────────────────────────────────────────────────────────────

app.use("/api", mainRouter);          // /user/auth  + /admin/auth
app.use("/api", categoryRoutes);      // public + admin
app.use("/api", productRoutes);       // public + admin (seller block commented)
app.use("/api", cartRoutes);          // user only
app.use("/api", addressRoutes);       // user only
app.use("/api", orderRoutes);         // user + admin
// app.use("/api", sellerRoutes);        // seller routes disabled
// app.use("/api", sellerDashboardRoutes); // seller routes disabled
app.use("/api", adminRoutes);         // admin only
app.use("/api", paymentRoutes);       // user + admin
app.use("/api", refundRoutes);        // user + admin (seller block commented)
app.use("/api", wishlistRoutes);      // user only
app.use("/api", userProfileRoutes);   // user only
// app.use("/api", sellerProfileRoutes); // seller profile routes disabled

// Global error handler — must be last
app.use(errorHandler);

app.listen(port, () => {
  console.log("server is running...", port);
});
