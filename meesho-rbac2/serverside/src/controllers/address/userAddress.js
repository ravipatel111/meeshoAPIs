import Address from "../../models/addressModel.js";

// Fix: removed leading space before const which caused parse quirk;
// now a proper named export at declaration
export const addAddress = async (req, res) => {
  try {
    const { fullName, mobile, pincode, state, city, addressLine } = req.body;

    if (!fullName || !mobile || !pincode || !state || !city || !addressLine) {
      return res.status(400).json({ success: false, message: "fullName, mobile, pincode, state, city, addressLine are required" });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.userId }, { isDefault: false });
    }

    const address = await Address.create({
      ...req.body,
      user: req.user.userId,
    });

    res.status(201).json({ success: true, message: "Address added", address });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.userId }).sort({ isDefault: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.json({ success: true, message: "Address deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.userId });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await Address.updateMany({ user: req.user.userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ success: true, data: address });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
