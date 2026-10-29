const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    fixture: { type: mongoose.Schema.Types.ObjectId, ref: 'Fixture', required: true, unique: true, index: true },
    teamAScore: { type: Number, default: 0 },
    teamBScore: { type: Number, default: 0 },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Walkover', 'Cancelled'],
      default: 'Scheduled',
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchDetails: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
