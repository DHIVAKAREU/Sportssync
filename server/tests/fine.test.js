describe('Fine Calculation Logic Unit Tests', () => {
  const calculateLateFine = (dueDate, returnDate, dailyRate = 20) => {
    const due = new Date(dueDate);
    const ret = new Date(returnDate);
    if (ret <= due) return 0;
    const diffTime = Math.abs(ret - due);
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return overdueDays * dailyRate;
  };

  test('should return 0 fine if returned on or before due date', () => {
    const fine = calculateLateFine('2026-08-10', '2026-08-10');
    expect(fine).toBe(0);
  });

  test('should calculate fine correctly for 5 overdue days (₹100 at ₹20/day)', () => {
    const fine = calculateLateFine('2026-07-10', '2026-07-15', 20);
    expect(fine).toBe(100);
  });

  test('should calculate fine correctly for 1 overdue day', () => {
    const fine = calculateLateFine('2026-08-01', '2026-08-02', 20);
    expect(fine).toBe(20);
  });
});
