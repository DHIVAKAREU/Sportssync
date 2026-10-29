const Fixture = require('../models/fixtures.model');
const Match = require('../models/matches.model');

/**
 * Check if venue or team has schedule overlap or violates rest hours
 */
const isSlotAvailable = async (venueId, teamAId, teamBId, candidateDate, restHours = 4) => {
  const matchStart = new Date(candidateDate);
  const matchEnd = new Date(matchStart.getTime() + 2 * 60 * 60 * 1000); // 2 hr duration

  // Check venue overlap across ALL tournaments
  const venueOverlap = await Fixture.findOne({
    venue: venueId,
    status: { $ne: 'Cancelled' },
    scheduledDate: {
      $gte: new Date(matchStart.getTime() - 2 * 60 * 60 * 1000),
      $lte: matchEnd,
    },
  });
  if (venueOverlap) return false;

  // Check team overlap & rest gap across ALL tournaments
  const restMarginMs = restHours * 60 * 60 * 1000;
  const teamConflict = await Fixture.findOne({
    status: { $ne: 'Cancelled' },
    $or: [{ teamA: { $in: [teamAId, teamBId] } }, { teamB: { $in: [teamAId, teamBId] } }],
    scheduledDate: {
      $gte: new Date(matchStart.getTime() - restMarginMs),
      $lte: new Date(matchEnd.getTime() + restMarginMs),
    },
  });
  if (teamConflict) return false;

  return true;
};

/**
 * Generate Fixtures algorithm (Section 18)
 */
const generateTournamentFixtures = async ({ tournamentId, format, teams, venues, startDate, restHours = 4 }) => {
  if (!teams || teams.length < 2) {
    throw new Error('At least 2 teams are required to generate fixtures');
  }
  if (!venues || venues.length === 0) {
    throw new Error('At least 1 active venue is required for scheduling');
  }

  // Clear previous scheduled fixtures if any
  const oldFixtures = await Fixture.find({ tournament: tournamentId });
  const oldFixtureIds = oldFixtures.map(f => f._id);
  await Match.deleteMany({ fixture: { $in: oldFixtureIds } });
  await Fixture.deleteMany({ tournament: tournamentId });

  const generatedFixtures = [];
  let currentDate = new Date(startDate);

  if (format === 'Knockout') {
    let currentTeams = [...teams];
    let matchNum = 1;
    let roundNum = 1;

    // Handle byes if team count is not a power of 2
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(currentTeams.length)));
    const byesCount = totalSlots - currentTeams.length;

    for (let i = 0; i < currentTeams.length; i += 2) {
      const teamA = currentTeams[i];
      const teamB = currentTeams[i + 1] || null;

      let chosenVenue = venues[0]._id;
      let slotFound = false;

      for (const v of venues) {
        if (await isSlotAvailable(v._id, teamA, teamB, currentDate, restHours)) {
          chosenVenue = v._id;
          slotFound = true;
          break;
        }
      }

      const fixture = await Fixture.create({
        tournament: tournamentId,
        round: `Round ${roundNum}`,
        matchNumber: matchNum++,
        teamA,
        teamB,
        venue: chosenVenue,
        scheduledDate: currentDate,
        scheduledTime: '10:00 AM',
        status: 'Scheduled',
        generatedBy: 'Auto',
      });

      await Match.create({
        fixture: fixture._id,
        status: 'Scheduled',
      });

      generatedFixtures.push(fixture);

      // Increment date slot by 4 hours
      currentDate = new Date(currentDate.getTime() + 4 * 60 * 60 * 1000);
    }
  } else {
    // Round Robin / League Algorithm
    const n = teams.length;
    let matchNum = 1;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const teamA = teams[i];
        const teamB = teams[j];

        let chosenVenue = venues[(matchNum - 1) % venues.length]._id;

        const fixture = await Fixture.create({
          tournament: tournamentId,
          round: `League Match ${matchNum}`,
          matchNumber: matchNum++,
          teamA,
          teamB,
          venue: chosenVenue,
          scheduledDate: currentDate,
          scheduledTime: `${9 + (matchNum % 6)}:00 AM`,
          status: 'Scheduled',
          generatedBy: 'Auto',
        });

        await Match.create({
          fixture: fixture._id,
          status: 'Scheduled',
        });

        generatedFixtures.push(fixture);
        currentDate = new Date(currentDate.getTime() + 3 * 60 * 60 * 1000);
      }
    }
  }

  return generatedFixtures;
};

module.exports = {
  generateTournamentFixtures,
  isSlotAvailable,
};
