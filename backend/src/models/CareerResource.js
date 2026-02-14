const mongoose = require('mongoose');

const careerResourceSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['resume', 'job_search', 'interview', 'skills'], required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerResource', careerResourceSchema);
