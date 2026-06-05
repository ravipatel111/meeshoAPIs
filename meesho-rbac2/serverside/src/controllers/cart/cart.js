import Cart from "../../models/cartModels.js";

export const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ success: false, message: "product and quantity are required" });
    }

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [{ product, quantity }],
      });
    } else {
      const index = cart.items.findIndex(
        (item) => item.product.toString() === product
      );

      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ product, quantity });
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
    cart.items.forEach((item) => {
      if (item.product) total += item.product.price * item.quantity;
    });

    res.json({ success: true, items: cart.items, totalAmount: total });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a particular product from the cart by productId
export const getCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItem = cart.items.find(
      (item) => item.product && item.product._id.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    res.json({ success: true, data: cartItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.id
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
    const { product, quantity } = req.body;

    if (!product || quantity === undefined) {
      return res.status(400).json({ success: false, message: "product and quantity are required" });
    }

    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((item) => item.product.toString() === product);

    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

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
        total += item.product.price * item.quantity;
        count += item.quantity;
      }
    });

    res.json({ success: true, cartCount: count, cartTotal: total });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
