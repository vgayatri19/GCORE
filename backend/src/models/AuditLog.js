const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
