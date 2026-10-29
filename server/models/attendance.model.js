const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, index: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    session: { type: String, required: true, trim: true }, // e.g. "Morning Practice", "Match Preparation"
    date: { type: Date, required: true, index: true },
    status: { type: String, required: true, enum: ['Present', 'Absent'], default: 'Present' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ player: 1, sport: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
