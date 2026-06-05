export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Meesho RBAC API Documentation",
    version: "1.0.0",
    description: "Complete API specification for the Meesho Role-Based Access Control (RBAC) System. This API handles user registration, admin management, product catalogs, shopping carts, addresses, orders, payments, refunds, wishlists, and user profiles. To execute authenticated endpoints, click 'Authorize' and input your JWT token."
  },
  servers: [
    {
      url: "https://meeshoapis.onrender.com/api",
      description: "Live Production Server (Render)"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT Bearer token to access protected user and admin endpoints."
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          mobile: { type: "string" },
          role: { type: "string", example: "user" },
          isVerified: { type: "boolean" },
          isBlocked: { type: "boolean" }
        }
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          image: {
            type: "object",
            properties: {
              url: { type: "string" },
              public_id: { type: "string" }
            }
          }
        }
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          discountPrice: { type: "number" },
          category: { type: "string" },
          subCategory: { type: "string" },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                public_id: { type: "string" }
              }
            }
          },
          stock: { type: "number" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          isActive: { type: "boolean" }
        }
      },
      CartItem: {
        type: "object",
        properties: {
          product: { $ref: "#/components/schemas/Product" },
          quantity: { type: "number" },
          price: { type: "number" }
        }
      },
      Cart: {
        type: "object",
        properties: {
          user: { type: "string" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" }
          },
          totalPrice: { type: "number" }
        }
      },
      Address: {
        type: "object",
        properties: {
          id: { type: "string" },
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          postalCode: { type: "string" },
          country: { type: "string" },
          isDefault: { type: "boolean" }
        }
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          user: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product: { type: "string" },
                quantity: { type: "number" },
                price: { type: "number" }
              }
            }
          },
          totalAmount: { type: "number" },
          shippingAddress: { type: "string" },
          status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
          paymentStatus: { type: "string", enum: ["pending", "paid", "failed", "refunded"] },
          dispute: {
            type: "object",
            properties: {
              isDisputed: { type: "boolean" },
              reason: { type: "string" },
              status: { type: "string", enum: ["open", "resolved"] },
              resolution: { type: "string" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/user/auth/register": {
      post: {
        tags: ["User Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "mobile", "password", "username"],
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  mobile: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Invalid input or user already exists" }
        }
      }
    },
    "/user/auth/login": {
      post: {
        tags: ["User Auth"],
        summary: "Login a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/user/auth/verify-otp": {
      post: {
        tags: ["User Auth"],
        summary: "Verify user OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "otp"],
                properties: {
                  email: { type: "string" },
                  otp: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "OTP verified successfully" },
          400: { description: "Invalid or expired OTP" }
        }
      }
    },
    "/user/auth/verify-email": {
      post: {
        tags: ["User Auth"],
        summary: "Verify email with code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "verificationCode"],
                properties: {
                  email: { type: "string" },
                  verificationCode: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Email verified successfully" }
        }
      }
    },
    "/user/auth/reset-password": {
      post: {
        tags: ["User Auth"],
        summary: "Reset user password with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "newPassword", "otp"],
                properties: {
                  email: { type: "string" },
                  newPassword: { type: "string" },
                  otp: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Password reset successful" }
        }
      }
    },
    "/user/auth/change-password": {
      post: {
        tags: ["User Auth"],
        summary: "Change password (authenticated)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["oldPassword", "newPassword"],
                properties: {
                  oldPassword: { type: "string" },
                  newPassword: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Password changed successfully" }
        }
      }
    },
    "/user/auth/logout": {
      post: {
        tags: ["User Auth"],
        summary: "Logout user",
        responses: {
          200: { description: "Logout successful" }
        }
      }
    },
    "/admin/auth/login": {
      post: {
        tags: ["Admin Auth"],
        summary: "Login an admin",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Admin login successful" }
        }
      }
    },
    "/admin/auth/logout": {
      post: {
        tags: ["Admin Auth"],
        summary: "Logout admin",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Admin logout successful" }
        }
      }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories (Public)",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Category" }
                }
              }
            }
          }
        }
      }
    },
    "/subcategories": {
      get: {
        tags: ["Categories"],
        summary: "Get all subcategories (Public)",
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/category": {
      post: {
        tags: ["Admin Category"],
        summary: "Create a new category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "description"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Category created" }
        }
      }
    },
    "/admin/get/categories": {
      get: {
        tags: ["Admin Category"],
        summary: "Get all categories for admin",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/update/category/{id}": {
      patch: {
        tags: ["Admin Category"],
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Category updated" }
        }
      }
    },
    "/admin/delete/category/{id}": {
      delete: {
        tags: ["Admin Category"],
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Category deleted" }
        }
      }
    },
    "/admin/subcategory": {
      post: {
        tags: ["Admin Subcategory"],
        summary: "Create a subcategory",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "category"],
                properties: {
                  name: { type: "string" },
                  category: { type: "string", description: "Parent category ID" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Subcategory created" }
        }
      }
    },
    "/admin/get/subcategory": {
      get: {
        tags: ["Admin Subcategory"],
        summary: "Get all subcategories for admin",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/update/subcategory/{id}": {
      patch: {
        tags: ["Admin Subcategory"],
        summary: "Update subcategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Subcategory updated" }
        }
      }
    },
    "/admin/delete/subcategory/{id}": {
      delete: {
        tags: ["Admin Subcategory"],
        summary: "Delete subcategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Subcategory deleted" }
        }
      }
    },
    "/product/all": {
      get: {
        tags: ["Products"],
        summary: "Get all products (Public)",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" }
                }
              }
            }
          }
        }
      }
    },
    "/product/search": {
      get: {
        tags: ["Products"],
        summary: "Search products",
        parameters: [
          {
            name: "query",
            in: "query",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/product/category/{categoryId}": {
      get: {
        tags: ["Products"],
        summary: "Get products by category ID",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/product/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/product/create": {
      post: {
        tags: ["Admin Product"],
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "price", "category", "subCategory", "seller"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  discountPrice: { type: "number" },
                  category: { type: "string" },
                  subCategory: { type: "string" },
                  seller: { type: "string" },
                  stock: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Product created" }
        }
      }
    },
    "/admin/product/my": {
      get: {
        tags: ["Admin Product"],
        summary: "Get admin's products",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/product/{id}": {
      put: {
        tags: ["Admin Product"],
        summary: "Update product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  discountPrice: { type: "number" },
                  stock: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Product updated" }
        }
      },
      delete: {
        tags: ["Admin Product"],
        summary: "Delete product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Product deleted" }
        }
      }
    },
    "/user/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Add product to cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number", default: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Added to cart" }
        }
      }
    },
    "/user/cart/get": {
      get: {
        tags: ["Cart"],
        summary: "Get cart contents",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Cart" }
              }
            }
          }
        }
      }
    },
    "/user/cart/item/{productId}": {
      get: {
        tags: ["Cart"],
        summary: "Get specific cart item details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/user/cart/update": {
      patch: {
        tags: ["Cart"],
        summary: "Update cart item quantity",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "number" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Cart updated" }
        }
      }
    },
    "/user/cart/remove/item/{id}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove specific item from cart by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", description: "Cart item identifier (not product ID)" }
          }
        ],
        responses: {
          200: { description: "Item removed from cart" }
        }
      }
    },
    "/user/cart/clear": {
      delete: {
        tags: ["Cart"],
        summary: "Clear all cart items",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Cart cleared" }
        }
      }
    },
    "/user/cart/summary": {
      get: {
        tags: ["Cart"],
        summary: "Get cart price summary details",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/user/address/create": {
      post: {
        tags: ["User Address"],
        summary: "Add shipping address",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["street", "city", "state", "postalCode", "country"],
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  postalCode: { type: "string" },
                  country: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Address created" }
        }
      }
    },
    "/user/address": {
      get: {
        tags: ["User Address"],
        summary: "Get user's addresses",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Address" }
                }
              }
            }
          }
        }
      }
    },
    "/user/address/{id}": {
      put: {
        tags: ["User Address"],
        summary: "Update address by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  postalCode: { type: "string" },
                  country: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Address updated" }
        }
      },
      delete: {
        tags: ["User Address"],
        summary: "Delete address by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Address deleted" }
        }
      }
    },
    "/user/address/default/{id}": {
      put: {
        tags: ["User Address"],
        summary: "Set default address",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Default address updated" }
        }
      }
    },
    "/order/create": {
      post: {
        tags: ["Orders"],
        summary: "Create a new order",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["addressId", "paymentMethod"],
                properties: {
                  addressId: { type: "string" },
                  paymentMethod: { type: "string", example: "COD" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Order created successfully" }
        }
      }
    },
    "/order/my": {
      get: {
        tags: ["Orders"],
        summary: "Get user orders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Order" }
                }
              }
            }
          }
        }
      }
    },
    "/order/cancel/{id}": {
      put: {
        tags: ["Orders"],
        summary: "Cancel order",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Order cancelled" }
        }
      }
    },
    "/order/dispute/{id}": {
      put: {
        tags: ["Orders"],
        summary: "Raise a dispute on an order",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: {
                  reason: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Dispute raised successfully" }
        }
      }
    },
    "/admin/orders": {
      get: {
        tags: ["Admin Orders"],
        summary: "Get all orders",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/order/{id}": {
      put: {
        tags: ["Admin Orders"],
        summary: "Update order status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["processing", "shipped", "delivered", "cancelled"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Order status updated" }
        }
      }
    },
    "/admin/order/dispute/{id}": {
      put: {
        tags: ["Admin Orders"],
        summary: "Resolve a dispute on an order",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status", "resolution"],
                properties: {
                  status: { type: "string", enum: ["resolved"] },
                  resolution: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Dispute resolved successfully" }
        }
      }
    },
    "/payment/create": {
      post: {
        tags: ["Payments"],
        summary: "Create a payment session",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId"],
                properties: {
                  orderId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Payment processing initialized" }
        }
      }
    },
    "/payment/my": {
      get: {
        tags: ["Payments"],
        summary: "Get my payments",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/payments": {
      get: {
        tags: ["Admin Payments"],
        summary: "Get all payments",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/payment/update/{id}": {
      put: {
        tags: ["Admin Payments"],
        summary: "Update payment status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["completed", "failed", "refunded"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Payment status updated" }
        }
      }
    },
    "/admin/revenue": {
      get: {
        tags: ["Admin Payments"],
        summary: "Get global revenue stats",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/seller/{sellerId}/payments": {
      get: {
        tags: ["Admin Payments"],
        summary: "Get seller specific payments list",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "sellerId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/refund/request": {
      post: {
        tags: ["Refunds"],
        summary: "Submit a refund request",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId", "reason"],
                properties: {
                  orderId: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Refund requested" }
        }
      }
    },
    "/refund/my": {
      get: {
        tags: ["Refunds"],
        summary: "Get user refund history",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/refunds": {
      get: {
        tags: ["Admin Refunds"],
        summary: "Get all refund requests",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/admin/refund/process/{id}": {
      put: {
        tags: ["Admin Refunds"],
        summary: "Process a refund transaction",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: { type: "string", enum: ["approve", "reject"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Refund processed successfully" }
        }
      }
    },
    "/admin/refund/update/{id}": {
      put: {
        tags: ["Admin Refunds"],
        summary: "Update refund details or status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["pending", "processed", "failed"] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Refund status updated" }
        }
      }
    },
    "/user/wishlist/add": {
      post: {
        tags: ["Wishlist"],
        summary: "Add product to wishlist",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId"],
                properties: {
                  productId: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Added to wishlist" }
        }
      }
    },
    "/user/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "Get wishlist details",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" }
        }
      }
    },
    "/user/wishlist/delete/{productId}": {
      delete: {
        tags: ["Wishlist"],
        summary: "Remove product from wishlist by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Removed from wishlist" }
        }
      }
    },
    "/user/profile": {
      get: {
        tags: ["User Profile"],
        summary: "Get authenticated user profile details",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" }
              }
            }
          }
        }
      },
      put: {
        tags: ["User Profile"],
        summary: "Update user profile info",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  phoneNumber: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Profile updated successfully" }
        }
      }
    }
  }
};
