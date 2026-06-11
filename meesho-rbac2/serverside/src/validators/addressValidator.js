import Joi from "joi";

export const addAddressSchema = Joi.object({
  fullName: Joi.string().min(2).max(60).required().messages({
    "string.min": "Full name must be at least 2 characters",
    "any.required": "Full name is required",
  }),

  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile must be a valid 10-digit Indian number",
      "any.required": "Mobile is required",
    }),

  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Pincode must be exactly 6 digits",
      "any.required": "Pincode is required",
    }),

  state: Joi.string().min(2).required().messages({
    "string.min": "State must be at least 2 characters",
    "any.required": "State is required",
  }),

  city: Joi.string().min(2).required().messages({
    "string.min": "City must be at least 2 characters",
    "any.required": "City is required",
  }),

  addressLine: Joi.string().min(5).max(200).required().messages({
    "string.min": "Address must be at least 5 characters",
    "string.max": "Address must not exceed 200 characters",
    "any.required": "Address line is required",
  }),

  landmark: Joi.string().max(100).optional().allow("").messages({
    "string.max": "Landmark must not exceed 100 characters",
  }),

  addressType: Joi.string().valid("Home", "Work").default("Home").messages({
    "any.only": "Address type must be home or work",
  }),

  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  fullName: Joi.string().min(2).max(60).optional(),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Mobile must be a valid 10-digit Indian number",
    }),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional()
    .messages({ "string.pattern.base": "Pincode must be exactly 6 digits" }),
  state: Joi.string().min(2).optional(),
  city: Joi.string().min(2).optional(),
  addressLine: Joi.string().min(5).max(200).optional(),
  landmark: Joi.string().max(100).optional().allow(""),
  addressType: Joi.string().valid("Home", "Work").optional(),
  isDefault: Joi.boolean().optional(),
});
