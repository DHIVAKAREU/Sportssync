const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['Ground', 'Court', 'Indoor Hall', 'Outdoor Field', 'Swimming Pool', 'Track'],
    },
    sportsSuitability: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sport' }],
    capacity: { type: Number, default: 100 },
    location: { type: String, trim: true },
    maintenanceStatus: {
      type: String,
      enum: ['Available', 'Under Maintenance', 'Unavailable'],
      default: 'Available',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);
