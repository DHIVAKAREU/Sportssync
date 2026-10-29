const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    position: { type: String, trim: true },
    jerseyNumber: { type: Number },
    documents: [{ type: String }],
    status: { type: String, required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, trim: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate registration for same sport
playerSchema.index({ user: 1, sport: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);
