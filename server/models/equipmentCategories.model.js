const mongoose = require('mongoose');

const equipmentCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquipmentCategory', equipmentCategorySchema);
