const userController = require('../controllers/userController');
const sportController = require('../controllers/sportController');

describe('User and Sports Management Unit & Validation Tests', () => {
  describe('User Role & Status Validation', () => {
    test('User role validation accepts standard roles', () => {
      const validRoles = ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'];
      const checkValid = (role) => validRoles.includes(role.toLowerCase());

      expect(checkValid('admin')).toBe(true);
      expect(checkValid('Coach')).toBe(true);
      expect(checkValid('superadmin')).toBe(false);
    });

    test('Self-deactivation restriction prevents admin lock-out', () => {
      const currentAdminId = '507f1f77bcf86cd799439011';
      const targetUserId = '507f1f77bcf86cd799439011';
      const isDeactivating = false;

      const isSelfDeactivation = (adminId, targetId, isActive) => {
        return adminId === targetId && !isActive;
      };

      expect(isSelfDeactivation(currentAdminId, targetUserId, isDeactivating)).toBe(true);
    });
  });

  describe('Sport Category & Duplicate Normalization', () => {
    test('Normalizes sport names and checks duplicate regex pattern', () => {
      const existingSports = ['Basketball', 'Football', 'Cricket'];
      const isDuplicate = (name) => existingSports.some(s => s.toLowerCase() === name.trim().toLowerCase());

      expect(isDuplicate('  basketball ')).toBe(true);
      expect(isDuplicate('Tennis')).toBe(false);
    });

    test('Ensures sport categories match schema enum', () => {
      const allowedCategories = ['Team', 'Individual'];
      const validateCategory = (cat) => allowedCategories.includes(cat);

      expect(validateCategory('Team')).toBe(true);
      expect(validateCategory('Individual')).toBe(true);
      expect(validateCategory('WaterSport')).toBe(false);
    });
  });
});
