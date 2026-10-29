const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: false, index: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    title: { type: String, required: true, trim: true },
    competition: { type: String, trim: true },
    level: {
      type: String,
      required: true,
      enum: ['Intra College', 'Intra-College', 'Inter College', 'Inter-College', 'District', 'State', 'National', 'International'],
    },
    year: { type: Number, required: true, index: true },
    position: { type: String, trim: true }, // e.g. "1st Place", "Runner-Up"
    medal: { type: String, enum: ['Gold', 'Silver', 'Bronze', 'None'], default: 'None' },
    description: { type: String, trim: true },
    certificate: { type: String, default: '' },
    images: [{ type: String }],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true, enum: ['pending', 'verified'], default: 'pending', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
