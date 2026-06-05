import multer from "multer";

const storage = multer.memoryStorage();

export let uploadProfileImage = multer({ storage }).single("profileImage");

export let uploadProductImages = multer({ storage }).array("images", 5);
