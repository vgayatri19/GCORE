const mongoose = require('mongoose');

const departmentResourceSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    schedule: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DepartmentResource', departmentResourceSchema);
