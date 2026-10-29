const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    equipmentCode: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, index: 'text' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'EquipmentCategory', required: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport' },
    totalQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    issuedQuantity: { type: Number, default: 0, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    lostQuantity: { type: Number, default: 0, min: 0 },
    condition: { type: String, enum: ['New', 'Good', 'Fair', 'Poor'], default: 'Good' },
    purchaseDate: { type: Date },
    purchaseCost: { type: Number, default: 0 },
    supplier: { type: String, trim: true },
    minimumStockLevel: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual status helper
equipmentSchema.virtual('status').get(function () {
  if (this.availableQuantity === 0) return 'Out of Stock';
  if (this.availableQuantity <= this.minimumStockLevel) return 'Low Stock';
  return 'Available';
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
