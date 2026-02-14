const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
