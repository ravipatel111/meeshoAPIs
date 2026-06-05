import Joi from "joi";

export const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 150 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().max(2000).optional().allow("").messages({
    "string.max": "Description must not exceed 2000 characters",
  }),

  price: Joi.number().min(1).required().messages({
    "number.min": "Price must be at least 1",
    "any.required": "Price is required",
  }),

  discountPrice: Joi.number().min(0).optional().messages({
    "number.min": "Discount price cannot be negative",
  }),

  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),

  subCategory: Joi.string().optional().allow(""),

  seller: Joi.string().optional().messages({
    "string.base": "Seller ID must be a valid string",
  }),

  stock: Joi.number().integer().min(0).default(0).messages({
    "number.min": "Stock cannot be negative",
    "number.integer": "Stock must be a whole number",
  }),
});

export const updateProductSchema = Joi.object({
  title:         Joi.string().min(3).max(150).optional(),
  description:   Joi.string().max(2000).optional().allow(""),
  price:         Joi.number().min(1).optional().messages({ "number.min": "Price must be at least 1" }),
  discountPrice: Joi.number().min(0).optional().messages({ "number.min": "Discount price cannot be negative" }),
  category:      Joi.string().optional(),
  subCategory:   Joi.string().optional().allow(""),
  seller:        Joi.string().optional(),
  stock:         Joi.number().integer().min(0).optional().messages({ "number.min": "Stock cannot be negative" }),
});
