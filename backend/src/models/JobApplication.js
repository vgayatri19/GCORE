const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobListing', required: true },
    status: { type: String, enum: ['applied', 'shortlisted', 'rejected', 'selected'], default: 'applied' }
  },
  { timestamps: true }
);

jobApplicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
