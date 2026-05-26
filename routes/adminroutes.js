const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllTasks,
  deleteAnyTask,
  getActivityLogs,
  getUserActivityLogs,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");


router.use(protect, adminOnly);


router.get("/stats", getDashboardStats);


router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

router.patch(
  "/users/:id/status",
  [
    body("status")
      .isIn(["active", "inactive"])
      .withMessage("Status must be 'active' or 'inactive'"),
  ],
  updateUserStatus
);

router.delete("/users/:id", deleteUser);


router.get("/tasks", getAllTasks);
router.delete("/tasks/:id", deleteAnyTask);


router.get("/activity-logs", getActivityLogs);
router.get("/activity-logs/user/:userId", getUserActivityLogs);

module.exports = router;