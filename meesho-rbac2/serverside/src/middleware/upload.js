import multer from "multer";

const storage = multer.memoryStorage();

export let uploadProfileImage = multer({ storage }).single("profileImage");

export let uploadProductImages = multer({ storage }).fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 2 }
]);
