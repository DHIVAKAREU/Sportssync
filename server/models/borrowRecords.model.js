const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    requestDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    borrowDate: { type: Date },
    dueDate: { type: Date, required: true, index: true },
    returnDate: { type: Date },
    conditionAtReturn: { type: String, enum: ['Good', 'Damaged', 'Lost'] },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected', 'Issued', 'Returned', 'Overdue', 'Lost', 'Damaged'],
      default: 'Pending',
      index: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
