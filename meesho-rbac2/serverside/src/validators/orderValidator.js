import Joi from "joi";

export const createOrderSchema = Joi.object({
  product: Joi.string().required().messages({
    "any.required": "Product ID is required",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1",
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),

  addressId: Joi.string().required().messages({
    "any.required": "Address ID is required",
  }),

  paymentMethod: Joi.string().valid("upi", "card").required().messages({
    "any.only": "paymentMethod must be one of upi, card",
    "any.required": "paymentMethod is required",
  }),
});
