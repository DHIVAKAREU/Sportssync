const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    role: { type: String, enum: ['captain', 'vice-captain', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ team: 1, player: 1 }, { unique: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
