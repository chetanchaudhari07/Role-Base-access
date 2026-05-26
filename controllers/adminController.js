const { validationResult } = require("express-validator");
const User = require("../models/User");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActiveLog");
const { logActivity } = require("../utils/activity");

exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate("taskCount")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(filter),
    ]);

    await logActivity({
      userId: req.user._id,
      action: "ADMIN_VIEWED_USERS",
      entity: "User",
      details: { filters: { role, status, search }, page, limit },
      req,
    });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("taskCount")
      .select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const previousStatus = user.status;
    user.status = status;
    await user.save({ validateBeforeSave: false });

    await logActivity({
      userId: req.user._id,
      action: "USER_STATUS_UPDATED",
      entity: "User",
      entityId: user._id,
      details: {
        targetUser: user.email,
        previousStatus,
        newStatus: status,
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { deletedCount } = await Task.deleteMany({ createdBy: user._id });

    await logActivity({
      userId: req.user._id,
      action: "USER_DELETED",
      entity: "User",
      entityId: user._id,
      details: {
        deletedUser: { name: user.name, email: user.email, role: user.role },
        tasksDeleted: deletedCount,
      },
      req,
    });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User deleted. ${deletedCount} associated task(s) also removed.`,
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      userId,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (userId) filter.createdBy = userId;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email role status")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    await logActivity({
      userId: req.user._id,
      action: "ADMIN_VIEWED_TASKS",
      entity: "Task",
      details: { filters: { status, priority, userId }, page, limit },
      req,
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnyTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    await task.deleteOne();

    await logActivity({
      userId: req.user._id,
      action: "ADMIN_DELETED_TASK",
      entity: "Task",
      entityId: task._id,
      details: {
        title: task.title,
        owner: task.createdBy?.email,
      },
      req,
    });

    res.status(200).json({ success: true, message: "Task deleted by admin." });
  } catch (error) {
    next(error);
  }
};

exports.getActivityLogs = async (req, res, next) => {
  try {
    const {
      userId,
      action,
      entity,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("user", "name email role")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.params.userId).select("name email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find({ user: req.params.userId })
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments({ user: req.params.userId }),
    ]);

    res.status(200).json({
      success: true,
      user,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "inactive" }),
      User.countDocuments({ role: "admin" }),
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      ActivityLog.find()
        .populate("user", "name email")
        .sort("-createdAt")
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, active: activeUsers, inactive: inactiveUsers, admins: adminUsers },
        tasks: {
          total: totalTasks,
          byStatus: tasksByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
          byPriority: tasksByPriority.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};