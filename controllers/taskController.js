const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const { logActivity } = require("../utils/activity");


exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user._id,
    });

    await logActivity({
      userId: req.user._id,
      action: "TASK_CREATED",
      entity: "Task",
      entityId: task._id,
      details: { title: task.title, priority: task.priority, status: task.status },
      req,
    });

    res.status(201).json({ success: true, message: "Task created.", task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getMyTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    const before = { status: task.status, priority: task.priority, title: task.title };

    const { title, description, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    await logActivity({
      userId: req.user._id,
      action: "TASK_UPDATED",
      entity: "Task",
      entityId: task._id,
      details: { before, after: { status: task.status, priority: task.priority, title: task.title } },
      req,
    });

    res.status(200).json({ success: true, message: "Task updated.", task });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied.",
      });
    }

    await task.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: "TASK_DELETED",
      entity: "Task",
      entityId: req.params.id,
      details: { title: task.title },
      req,
    });

    res.status(200).json({ success: true, message: "Task deleted." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};