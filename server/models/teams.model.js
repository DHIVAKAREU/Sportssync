const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    season: { type: String, required: true, trim: true }, // e.g. "2025-2026"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
