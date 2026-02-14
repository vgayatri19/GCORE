const AuditLog = require('../models/AuditLog');

const logAdminAction = async (adminId, action, metadata = {}) => {
  await AuditLog.create({ admin: adminId, action, metadata });
};

module.exports = { logAdminAction };
