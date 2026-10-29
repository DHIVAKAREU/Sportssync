const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'],
      lowercase: true,
      trim: true,
    },
    permissions: [{ type: String }],
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
