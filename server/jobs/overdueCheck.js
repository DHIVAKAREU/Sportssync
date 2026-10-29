const cron = require('node-cron');
const BorrowRecord = require('../models/borrowRecords.model');
const Fine = require('../models/fines.model');

const checkOverdueBorrows = async () => {
  try {
    console.log('Running daily overdue borrow check...');
    const now = new Date();

    const overdueRecords = await BorrowRecord.find({
      status: 'Issued',
      dueDate: { $lt: now },
    });

    for (const record of overdueRecords) {
      record.status = 'Overdue';
      await record.save();

      const diffTime = Math.abs(now - new Date(record.dueDate));
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dailyRate = 20;
      const amount = overdueDays * dailyRate;

      const existingFine = await Fine.findOne({ borrowRecord: record._id, reason: 'Late Return' });
      if (existingFine) {
        existingFine.overdueDays = overdueDays;
        existingFine.amount = amount;
        await existingFine.save();
      } else {
        await Fine.create({
          borrowRecord: record._id,
          student: record.borrower,
          reason: 'Late Return',
          overdueDays,
          ratePerDay: dailyRate,
          amount,
          status: 'Unpaid',
        });
      }

      const Notification = require('../models/notifications.model');
      await Notification.create({
        recipient: record.borrower,
        title: 'Equipment Borrow Overdue Alert',
        message: `Your borrowed item is overdue by ${overdueDays} day(s). Current late fine accrued: ₹${amount}. Please return immediately.`,
        type: 'fine',
        link: '/fines',
      });
    }
    console.log(`Overdue check complete. Processed ${overdueRecords.length} records.`);
  } catch (error) {
    console.error('Error in overdue check job:', error.message);
  }
};

// Schedule cron job to run at midnight every day
const initCronJobs = () => {
  cron.schedule('0 0 * * *', () => {
    checkOverdueBorrows();
  });
};

module.exports = { initCronJobs, checkOverdueBorrows };
