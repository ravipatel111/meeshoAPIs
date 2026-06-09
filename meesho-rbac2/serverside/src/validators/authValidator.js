import Joi from "joi";

// USER REGISTER
export const userRegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 30 characters",
    "any.required": "Username is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  mobile: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be 10 digits",
      "any.required": "Mobile is required",
    }),

  password: Joi.string().min(6).max(32).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 32 characters",
    "any.required": "Password is required",
  }),

  confirmpassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),

  profileImage: Joi.any().optional(),
});

// USER LOGIN
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// VERIFY OTP (USER)
export const verifyUserOtpSchema = Joi.object({
  userId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "any.required": "OTP is required",
  }),
}).or("userId", "email");

// VERIFY OTP (SELLER)
export const verifySellerOtpSchema = Joi.object({
  sellerId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "OTP must be exactly 6 digits",
    "string.pattern.base": "OTP must contain only numbers",
    "any.required": "OTP is required",
  }),
}).or("sellerId", "email");

// VERIFY EMAIL (forgot password)
export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
});

// RESET PASSWORD
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),

  password: Joi.string().min(6).max(32).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 32 characters",
    "any.required": "New password is required",
  }),
});

// CHANGE PASSWORD
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
  }),

  newPassword: Joi.string().min(6).max(32).required().messages({
    "string.min": "New password must be at least 6 characters",
    "string.max": "New password must not exceed 32 characters",
    "any.required": "New password is required",
  }),
});

// SELLER REGISTER
export const sellerRegisterSchema = Joi.object({
  storeName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Store name must be at least 2 characters",
    "string.max": "Store name must not exceed 50 characters",
    "any.required": "Store name is required",
  }),

  ownerName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Owner name must be at least 2 characters",
    "string.max": "Owner name must not exceed 50 characters",
    "any.required": "Owner name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile must be a valid 10-digit Indian number",
      "any.required": "Mobile is required",
    }),

  password: Joi.string().min(6).max(32).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 32 characters",
    "any.required": "Password is required",
  }),

  confirmpassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});
