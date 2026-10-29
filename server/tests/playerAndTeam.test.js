describe('Player Registration & Team Roster Unit & Validation Invariants', () => {
  describe('Player Registration Invariants', () => {
    test('Enforces compound uniqueness to prevent duplicate registrations for same sport', () => {
      const existingRegistrations = [
        { userId: 'user1', sportId: 'sport_basketball', status: 'approved' },
        { userId: 'user1', sportId: 'sport_football', status: 'pending' },
      ];

      const isDuplicateRegistration = (user, sport) => {
        return existingRegistrations.some(r => r.userId === user && r.sportId === sport);
      };

      expect(isDuplicateRegistration('user1', 'sport_basketball')).toBe(true);
      expect(isDuplicateRegistration('user1', 'sport_cricket')).toBe(false);
    });

    test('Validates registration state transitions', () => {
      const validStatuses = ['pending', 'approved', 'rejected'];
      const isValidStatus = (st) => validStatuses.includes(st);

      expect(isValidStatus('pending')).toBe(true);
      expect(isValidStatus('approved')).toBe(true);
      expect(isValidStatus('rejected')).toBe(true);
      expect(isValidStatus('active')).toBe(false);
    });

    test('Enforces maximum of 1 Team sport and 1 Individual sport per student', () => {
      const studentRegistrations = [
        { sport: { name: 'Basketball', category: 'Team' }, status: 'approved' },
      ];

      const canRegisterForSport = (registrations, targetSport) => {
        const active = registrations.filter(r => r.status !== 'rejected');
        const duplicate = active.find(r => r.sport.name === targetSport.name);
        if (duplicate) return { allowed: false, reason: 'DUPLICATE_REGISTRATION' };

        const inCategory = active.find(r => r.sport.category === targetSport.category);
        if (inCategory) return { allowed: false, reason: 'CATEGORY_LIMIT_REACHED' };

        return { allowed: true };
      };

      // Trying another Team sport should be rejected
      expect(canRegisterForSport(studentRegistrations, { name: 'Football', category: 'Team' })).toEqual({
        allowed: false,
        reason: 'CATEGORY_LIMIT_REACHED',
      });

      // Registering for an Individual sport should be allowed
      expect(canRegisterForSport(studentRegistrations, { name: 'Badminton', category: 'Individual' })).toEqual({
        allowed: true,
      });

      // Adding the individual sport fills both slots
      const fullRegistrations = [
        ...studentRegistrations,
        { sport: { name: 'Badminton', category: 'Individual' }, status: 'approved' },
      ];

      // Any additional registration should now be rejected
      expect(canRegisterForSport(fullRegistrations, { name: 'Cricket', category: 'Team' })).toEqual({
        allowed: false,
        reason: 'CATEGORY_LIMIT_REACHED',
      });
      expect(canRegisterForSport(fullRegistrations, { name: 'Tennis', category: 'Individual' })).toEqual({
        allowed: false,
        reason: 'CATEGORY_LIMIT_REACHED',
      });
    });
  });

  describe('Team Member Roster Invariants', () => {
    test('Rejects player addition if registration status is not Approved', () => {
      const playerPending = { _id: 'p1', status: 'pending', sport: 'sport_1' };
      const playerApproved = { _id: 'p2', status: 'approved', sport: 'sport_1' };

      const canAddToRoster = (player, teamSport) => {
        if (player.status !== 'approved') return { allowed: false, reason: 'UNAPPROVED_PLAYER' };
        if (player.sport !== teamSport) return { allowed: false, reason: 'SPORT_MISMATCH' };
        return { allowed: true };
      };

      expect(canAddToRoster(playerPending, 'sport_1')).toEqual({ allowed: false, reason: 'UNAPPROVED_PLAYER' });
      expect(canAddToRoster(playerApproved, 'sport_1')).toEqual({ allowed: true });
    });

    test('Rejects player addition if registered sport does not match team sport', () => {
      const playerFootball = { _id: 'p3', status: 'approved', sport: 'sport_football' };
      const teamBasketballSport = 'sport_basketball';

      const canAddToRoster = (player, teamSport) => {
        if (player.status !== 'approved') return { allowed: false, reason: 'UNAPPROVED_PLAYER' };
        if (player.sport !== teamSport) return { allowed: false, reason: 'SPORT_MISMATCH' };
        return { allowed: true };
      };

      expect(canAddToRoster(playerFootball, teamBasketballSport)).toEqual({ allowed: false, reason: 'SPORT_MISMATCH' });
    });

    test('Setting a team captain updates team captain reference and member role', () => {
      let team = { _id: 't1', captain: 'p1' };
      let members = [
        { player: 'p1', role: 'captain' },
        { player: 'p2', role: 'member' },
      ];

      const setCaptain = (newCaptainId) => {
        // Reset previous captain to member
        members.forEach(m => {
          if (m.player === team.captain) m.role = 'member';
          if (m.player === newCaptainId) m.role = 'captain';
        });
        team.captain = newCaptainId;
      };

      setCaptain('p2');

      expect(team.captain).toBe('p2');
      expect(members.find(m => m.player === 'p1').role).toBe('member');
      expect(members.find(m => m.player === 'p2').role).toBe('captain');
    });
  });
});
