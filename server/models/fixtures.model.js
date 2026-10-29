const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    round: { type: String, default: 'Round 1' }, // e.g. "Round 1", "Quarter-Final", "Semi-Final", "Final"
    matchNumber: { type: Number, required: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    scheduledDate: { type: Date, required: true, index: true },
    scheduledTime: { type: String, required: true }, // e.g. "10:00 AM"
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    generatedBy: { type: String, enum: ['Auto', 'Manual'], default: 'Auto' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fixture', fixtureSchema);
