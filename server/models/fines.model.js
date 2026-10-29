const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    borrowRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, enum: ['Late Return', 'Damaged', 'Lost'] },
    overdueDays: { type: Number, default: 0 },
    ratePerDay: { type: Number, default: 0 },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['Unpaid', 'Paid', 'Waived'], default: 'Unpaid', index: true },
    paidDate: { type: Date },
    waivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    waivedReason: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fine', fineSchema);
