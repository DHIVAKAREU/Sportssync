describe('Equipment Quantity Invariant Unit Tests', () => {
  const validateQuantityInvariant = (total, available, issued, damaged, lost) => {
    return total === (available + issued + damaged + lost);
  };

  test('should pass validation when quantities balance out correctly', () => {
    const isValid = validateQuantityInvariant(30, 22, 8, 0, 0);
    expect(isValid).toBe(true);
  });

  test('should fail validation when sum does not match total quantity', () => {
    const isValid = validateQuantityInvariant(30, 22, 10, 0, 0); // 32 != 30
    expect(isValid).toBe(false);
  });

  test('should pass validation with damaged and lost reallocations', () => {
    const isValid = validateQuantityInvariant(20, 10, 5, 3, 2); // 10+5+3+2 = 20
    expect(isValid).toBe(true);
  });
});
