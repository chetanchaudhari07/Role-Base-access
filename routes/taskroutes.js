const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createTask,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");


router.use(protect);


const taskRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 100 }),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "completed"])
    .withMessage("Status must be todo, in-progress, or completed"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO date"),
];

const updateRules = [
  body("title").optional().trim().isLength({ min: 1, max: 100 }),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "completed"]),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"]),
  body("dueDate").optional().isISO8601(),
];


router.get("/", getMyTasks);
router.post("/", taskRules, createTask);
router.get("/:id", getTask);
router.put("/:id", updateRules, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;