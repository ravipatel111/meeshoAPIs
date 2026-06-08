import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
// import Seller from "../models/vendorModel.js"; // seller role removed for now

export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let account;

    if (decoded.role === "user") {
      account = await User.findById(decoded.userId);
    }

    // if (decoded.role === "seller") {
    //   account = await Seller.findById(decoded.userId);
    // }

    if (decoded.role === "admin") {
      const adminQuery = decoded.adminId
        ? Admin.findById(decoded.adminId)
        : Admin.findOne({ email: decoded.email });
      account = await adminQuery;
    }

    if (!account) {
      return res.status(401).json({ success: false, message: "Account not found" });
    }

    if (account.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account is blocked by admin" });
    }

    req.user = decoded;
    next();

  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ success: false, message: "User only access" });
  }
  next();
};

// export const isSeller = (req, res, next) => {
//   if (req.user.role !== "seller") {
//     return res.status(403).json({ success: false, message: "Seller only access" });
//   }
//   next();
// };

// export const isSellerApproved = async (req, res, next) => {
//   try {
//     const seller = await Seller.findById(req.user.userId);
//     if (!seller || !seller.isApproved) {
//       return res.status(403).json({ success: false, message: "Seller not approved by admin" });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Seller approval check failed" });
//   }
// };

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only access" });
  }
  next();
};
