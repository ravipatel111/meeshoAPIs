import Cart from "../../models/cartModels.js";
import Product from "../../models/productModels.js";

export const addToCart = async (req, res) => {
  try {
    const { product, quantity, variantId } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ success: false, message: "product and quantity are required" });
    }

    const productData = await Product.findById(product);
    if (!productData) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (variantId) {
      const variant = productData.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({ success: false, message: "Variant not found" });
      }
      if (variant.stock < quantity) {
        return res.status(400).json({ success: false, message: "Out of stock for this variant" });
      }
    } else {
      if (productData.stock < quantity) {
        return res.status(400).json({ success: false, message: "Out of stock" });
      }
    }

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [{ product, quantity, variant: variantId || null }],
      });
    } else {
      const index = cart.items.findIndex(
        (item) => item.product.toString() === product &&
          ((!variantId && !item.variant) || (item.variant && item.variant.toString() === variantId))
      );

      if (index > -1) {
        const newQty = cart.items[index].quantity + quantity;
        if (variantId) {
          const variant = productData.variants.id(variantId);
          if (variant.stock < newQty) {
            return res.status(400).json({ success: false, message: "Out of stock for this variant" });
          }
        } else {
          if (productData.stock < newQty) {
            return res.status(400).json({ success: false, message: "Out of stock" });
          }
        }
        cart.items[index].quantity = newQty;
      } else {
        cart.items.push({ product, quantity, variant: variantId || null });
      }

      await cart.save();
    }

    res.json({ success: true, data: cart });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

    if (!cart) {
      return res.json({ success: true, items: [], totalAmount: 0 });
    }

    let total = 0;
    const items = cart.items.map((item) => {
      const itemObj = item.toObject();
      if (item.product) {
        let price = item.product.price;
        if (item.variant) {
          const v = item.product.variants.id(item.variant);
          if (v) {
            price = v.price;
            itemObj.selectedVariant = v;
          }
        }
        total += price * item.quantity;
      }
      return itemObj;
    });

    res.json({ success: true, items, totalAmount: total });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a particular product from the cart by productId and variantId
export const getCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItem = cart.items.find(
      (item) => item.product && item.product._id.toString() === productId &&
        ((!variantId && !item.variant) || (item.variant && item.variant.toString() === variantId))
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    const itemObj = cartItem.toObject();
    if (cartItem.variant && cartItem.product.variants) {
      const v = cartItem.product.variants.id(cartItem.variant);
      if (v) itemObj.selectedVariant = v;
    }

    res.json({ success: true, data: itemObj });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { variantId } = req.query;
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === req.params.id &&
        ((!variantId && !item.variant) || (item.variant && item.variant.toString() === variantId)))
    );

    await cart.save();

    res.json({ success: true, message: "Item removed" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ success: true, message: "Cart cleared" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { product, quantity, variantId } = req.body;

    if (!product || quantity === undefined) {
      return res.status(400).json({ success: false, message: "product and quantity are required" });
    }

    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.product.toString() === product &&
        ((!variantId && !item.variant) || (item.variant && item.variant.toString() === variantId))
    );

    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    const productData = await Product.findById(product);
    if (productData) {
      if (variantId) {
        const variant = productData.variants.id(variantId);
        if (variant && variant.stock < quantity) {
          return res.status(400).json({ success: false, message: "Out of stock for this variant" });
        }
      } else {
        if (productData.stock < quantity) {
          return res.status(400).json({ success: false, message: "Out of stock" });
        }
      }
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, data: cart });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

    if (!cart) return res.json({ success: true, cartCount: 0, cartTotal: 0 });

    let total = 0;
    let count = 0;

    cart.items.forEach((item) => {
      if (item.product) {
        let price = item.product.price;
        if (item.variant) {
          const v = item.product.variants.id(item.variant);
          if (v) price = v.price;
        }
        total += price * item.quantity;
        count += item.quantity;
      }
    });

    res.json({ success: true, cartCount: count, cartTotal: total });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
