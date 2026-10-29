const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, enum: ['Team', 'Individual'], default: 'Team' },
    description: { type: String, trim: true },
    icon: { type: String, default: 'trophy' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sport', sportSchema);
