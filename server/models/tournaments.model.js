const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    description: { type: String, trim: true },
    format: {
      type: String,
      required: true,
      enum: ['Knockout', 'League', 'Group+Knockout'],
      default: 'Knockout',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date },
    venues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
    status: {
      type: String,
      enum: ['Upcoming', 'Registration Open', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
      index: true,
    },
    maxTeams: { type: Number, default: 16 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    runnerUp: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    bestPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
