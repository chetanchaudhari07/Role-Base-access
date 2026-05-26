const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");


const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];


router.post("/register", registerRules, register);
router.post("/login", loginRules, login);


router.get("/me", protect, getMe);
router.put("/change-password", protect, changePasswordRules, changePassword);

module.exports = router;