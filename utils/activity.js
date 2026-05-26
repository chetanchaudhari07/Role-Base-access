const ActivityLog = require("../models/ActiveLog");


const logActivity = async ({
  userId,
  action,
  entity,
  entityId = null,
  details = {},
  status = "success",
  req = null,
}) => {
  try {
    const logData = {
      user: userId,
      action,
      entity,
      entityId,
      details,
      status,
    };

    if (req) {
      logData.ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        null;
      logData.userAgent = req.headers["user-agent"] || null;
    }

    await ActivityLog.create(logData);
  } catch (err) {
    console.error("⚠️  Activity log error:", err.message);
  }
};

module.exports = { logActivity };