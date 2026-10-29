const mongoose = require('mongoose');

const tournamentRegistrationSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

tournamentRegistrationSchema.index({ tournament: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('TournamentRegistration', tournamentRegistrationSchema);
