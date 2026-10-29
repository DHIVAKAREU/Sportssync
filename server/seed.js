const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const Role = require('./models/roles.model');
const User = require('./models/users.model');
const Sport = require('./models/sports.model');
const Player = require('./models/players.model');
const Team = require('./models/teams.model');
const TeamMember = require('./models/teamMembers.model');
const EquipmentCategory = require('./models/equipmentCategories.model');
const Equipment = require('./models/equipment.model');
const BorrowRecord = require('./models/borrowRecords.model');
const Fine = require('./models/fines.model');
const Tournament = require('./models/tournaments.model');
const TournamentRegistration = require('./models/tournamentRegistrations.model');
const Venue = require('./models/venues.model');
const Fixture = require('./models/fixtures.model');
const Match = require('./models/matches.model');
const Achievement = require('./models/achievements.model');
const Attendance = require('./models/attendance.model');
const Notification = require('./models/notifications.model');
const Announcement = require('./models/announcements.model');

const seedAll = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is missing in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    // Clear existing data
    console.log('Clearing existing collection data...');
    await Promise.all([
      Role.deleteMany({}),
      User.deleteMany({}),
      Sport.deleteMany({}),
      Player.deleteMany({}),
      Team.deleteMany({}),
      TeamMember.deleteMany({}),
      EquipmentCategory.deleteMany({}),
      Equipment.deleteMany({}),
      BorrowRecord.deleteMany({}),
      Fine.deleteMany({}),
      Tournament.deleteMany({}),
      TournamentRegistration.deleteMany({}),
      Venue.deleteMany({}),
      Fixture.deleteMany({}),
      Match.deleteMany({}),
      Achievement.deleteMany({}),
      Attendance.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
    ]);

    // 1. Roles
    console.log('1. Seeding Roles...');
    const roles = await Role.insertMany([
      { name: 'admin', description: 'Full system administrator' },
      { name: 'coordinator', description: 'Sports council coordinator' },
      { name: 'coach', description: 'Sports coach' },
      { name: 'equipment_incharge', description: 'Equipment store manager' },
      { name: 'student', description: 'Student player / athlete' },
    ]);
    const rMap = {};
    roles.forEach(r => { rMap[r.name] = r._id; });

    // Common Hashed Password
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // 2. Users (20 users)
    console.log('2. Seeding Users (20 users)...');
    const userData = [
      // 2 Admins
      { name: 'System Administrator', email: 'admin@sportsync.com', password: hashedPassword, role: rMap['admin'], isApproved: true },
      { name: 'Vice Admin', email: 'admin2@sportsync.com', password: hashedPassword, role: rMap['admin'], isApproved: true },

      // 2 Coordinators
      { name: 'Chief Coordinator', email: 'coordinator@sportsync.com', password: hashedPassword, role: rMap['coordinator'], department: 'Physical Education', isApproved: true },
      { name: 'Assistant Coordinator', email: 'coordinator2@sportsync.com', password: hashedPassword, role: rMap['coordinator'], department: 'Sports Affairs', isApproved: true },

      // 4 Coaches
      { name: 'Coach Cricket', email: 'coach.cricket@sportsync.com', password: hashedPassword, role: rMap['coach'], department: 'Cricket Dept', isApproved: true },
      { name: 'Coach Basketball', email: 'coach.basketball@sportsync.com', password: hashedPassword, role: rMap['coach'], department: 'Basketball Dept', isApproved: true },
      { name: 'Coach Football', email: 'coach.football@sportsync.com', password: hashedPassword, role: rMap['coach'], department: 'Football Dept', isApproved: true },
      { name: 'Coach Badminton', email: 'coach.badminton@sportsync.com', password: hashedPassword, role: rMap['coach'], department: 'Racket Sports', isApproved: true },

      // 2 Equipment Managers
      { name: 'Equipment Manager Main', email: 'equipment@sportsync.com', password: hashedPassword, role: rMap['equipment_incharge'], isApproved: true },
      { name: 'Equipment Assistant', email: 'equipment2@sportsync.com', password: hashedPassword, role: rMap['equipment_incharge'], isApproved: true },

      // 10 Students
      { name: 'Aarav Sharma', email: 'student01@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026001', department: 'Computer Science', year: 3, isApproved: true },
      { name: 'Ananya Patel', email: 'student02@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026002', department: 'Information Tech', year: 3, isApproved: true },
      { name: 'Rohan Verma', email: 'student03@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026003', department: 'Mechanical Eng', year: 2, isApproved: true },
      { name: 'Priya Sundaram', email: 'student04@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026004', department: 'Electronics Eng', year: 4, isApproved: true },
      { name: 'Vikram Singh', email: 'student05@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026005', department: 'Civil Eng', year: 1, isApproved: true },
      { name: 'Kavya Reddy', email: 'student06@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026006', department: 'Biotechnology', year: 2, isApproved: true },
      { name: 'Siddharth Nair', email: 'student07@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026007', department: 'Computer Science', year: 4, isApproved: true },
      { name: 'Meera Iyer', email: 'student08@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026008', department: 'Electrical Eng', year: 3, isApproved: true },
      { name: 'Aditya Gupta', email: 'student09@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026009', department: 'Information Tech', year: 2, isApproved: true },
      { name: 'Sneha Deshmukh', email: 'student10@sportsync.com', password: hashedPassword, role: rMap['student'], registerNumber: 'REG2026010', department: 'Chemical Eng', year: 1, isApproved: true },
    ];

    const users = await User.insertMany(userData);
    const uMap = {};
    users.forEach(u => { uMap[u.email] = u._id; });

    // 3. Sports (10 sports)
    console.log('3. Seeding Sports (10 sports)...');
    const sportsData = [
      { name: 'Basketball', category: 'Team', minTeamSize: 5, maxTeamSize: 12, description: 'Indoor 5v5 Basketball game', coach: uMap['coach.basketball@sportsync.com'] },
      { name: 'Cricket', category: 'Team', minTeamSize: 11, maxTeamSize: 16, description: 'T20 & 50-over Cricket matches', coach: uMap['coach.cricket@sportsync.com'] },
      { name: 'Football', category: 'Team', minTeamSize: 11, maxTeamSize: 18, description: '11-a-side Association Football', coach: uMap['coach.football@sportsync.com'] },
      { name: 'Volleyball', category: 'Team', minTeamSize: 6, maxTeamSize: 12, description: '6v6 Court Volleyball', coach: uMap['coach.basketball@sportsync.com'] },
      { name: 'Badminton', category: 'Individual', minTeamSize: 1, maxTeamSize: 2, description: 'Singles and Doubles Badminton', coach: uMap['coach.badminton@sportsync.com'] },
      { name: 'Tennis', category: 'Individual', minTeamSize: 1, maxTeamSize: 2, description: 'Lawn Tennis singles and doubles', coach: uMap['coach.badminton@sportsync.com'] },
      { name: 'Athletics', category: 'Individual', minTeamSize: 1, maxTeamSize: 5, description: 'Track & Field events', coach: uMap['coach.cricket@sportsync.com'] },
      { name: 'Table Tennis', category: 'Individual', minTeamSize: 1, maxTeamSize: 2, description: 'Indoor Ping Pong tournaments', coach: uMap['coach.badminton@sportsync.com'] },
      { name: 'Kabaddi', category: 'Team', minTeamSize: 7, maxTeamSize: 12, description: '7v7 Traditional Contact Sport', coach: uMap['coach.football@sportsync.com'] },
      { name: 'Chess', category: 'Individual', minTeamSize: 1, maxTeamSize: 1, description: 'Strategic Board Game Championship', coach: uMap['coordinator@sportsync.com'] },
    ];
    const sports = await Sport.insertMany(sportsData);
    const sMap = {};
    sports.forEach(s => { sMap[s.name] = s._id; });

    // 4. Students / Players (25 registrations across students & sports)
    console.log('4. Seeding Players (25 registrations)...');
    const studentList = users.filter(u => u.role.toString() === rMap['student'].toString());
    const sportsList = sports;
    const playerDocs = [];
    let pCount = 0;
    for (let i = 0; i < studentList.length; i++) {
      const student = studentList[i];
      const numSports = (i % 2 === 0) ? 3 : 2;
      for (let sIdx = 0; sIdx < numSports; sIdx++) {
        const sportObj = sportsList[(i * 2 + sIdx) % sportsList.length];
        const status = (pCount % 5 === 4) ? 'Rejected' : (pCount % 5 === 3 ? 'Pending' : 'Approved');
        playerDocs.push({
          user: student._id,
          sport: sportObj._id,
          registrationDate: new Date(Date.now() - (pCount * 86400000)),
          approvalStatus: status,
          approvedBy: status === 'Approved' ? uMap['coordinator@sportsync.com'] : null,
          approvalDate: status === 'Approved' ? new Date() : null,
        });
        pCount++;
      }
    }
    const players = await Player.insertMany(playerDocs);

    // 5. Venues (10 venues)
    console.log('5. Seeding Venues (10 venues)...');
    const venuesData = [
      { name: 'Main Indoor Court', location: 'Indoor Stadium Ground Floor', type: 'Court', capacity: 400 },
      { name: 'Central Cricket Ground', location: 'South Campus', type: 'Ground', capacity: 3000 },
      { name: 'Turf Football Field', location: 'North Field', type: 'Outdoor Field', capacity: 1500 },
      { name: 'Badminton Complex (Court A)', location: 'Indoor Complex Floor 2', type: 'Indoor Hall', capacity: 250 },
      { name: 'Badminton Complex (Court B)', location: 'Indoor Complex Floor 2', type: 'Indoor Hall', capacity: 250 },
      { name: 'Tennis Hard Court 1', location: 'East Sports Wing', type: 'Court', capacity: 150 },
      { name: 'Table Tennis Arena', location: 'Student Activity Center', type: 'Indoor Hall', capacity: 200 },
      { name: 'Olympic Athletic Track', location: 'Main Stadium', type: 'Track', capacity: 5000 },
      { name: 'Kabaddi Indoor Mat', location: 'Physical Ed Hall 1', type: 'Indoor Hall', capacity: 300 },
      { name: 'Chess Grandmaster Room', location: 'Library 3rd Floor Quiet Zone', type: 'Indoor Hall', capacity: 80 },
    ];
    const venues = await Venue.insertMany(venuesData);
    const vMap = {};
    venues.forEach(v => { vMap[v.name] = v._id; });

    // 6. Teams & Team Members (8 teams)
    console.log('6. Seeding Teams & Members (8 teams)...');
    const teamData = [
      { name: 'Cyber Thunder Basketball', sport: sMap['Basketball'], captain: uMap['student01@sportsync.com'], coach: uMap['coach.basketball@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Viper Strikers Football', sport: sMap['Football'], captain: uMap['student03@sportsync.com'], coach: uMap['coach.football@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Titan XI Cricket', sport: sMap['Cricket'], captain: uMap['student07@sportsync.com'], coach: uMap['coach.cricket@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Smashers Badminton Club', sport: sMap['Badminton'], captain: uMap['student02@sportsync.com'], coach: uMap['coach.badminton@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Phoenix Volleyball Warriors', sport: sMap['Volleyball'], captain: uMap['student04@sportsync.com'], coach: uMap['coach.basketball@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Ace Tennis Squad', sport: sMap['Tennis'], captain: uMap['student06@sportsync.com'], coach: uMap['coach.badminton@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Raid Titans Kabaddi', sport: sMap['Kabaddi'], captain: uMap['student05@sportsync.com'], coach: uMap['coach.football@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
      { name: 'Grandmasters Chess Guild', sport: sMap['Chess'], captain: uMap['student08@sportsync.com'], coach: uMap['coach.cricket@sportsync.com'], createdBy: uMap['coordinator@sportsync.com'], season: '2025-2026' },
    ];
    const teams = await Team.insertMany(teamData);

    const teamMembersDocs = [];
    teams.forEach((t, idx) => {
      const availablePlayers = players.filter(p => p.sport._id.toString() === t.sport._id.toString() && p.approvalStatus === 'Approved');
      const targetPlayers = availablePlayers.length > 0 ? availablePlayers : players.slice(0, 3);
      targetPlayers.forEach((p, pIdx) => {
        teamMembersDocs.push({
          team: t._id,
          player: p._id,
          role: p.user.toString() === t.captain.toString() ? 'captain' : 'member',
          joinedAt: new Date(),
        });
      });
    });
    await TeamMember.insertMany(teamMembersDocs);

    // 7. Equipment Categories & Inventory (8 categories, 50 equipment items)
    console.log('7. Seeding Equipment Categories & 50 Items...');
    const catData = [
      { name: 'Balls & Spheres', description: 'Basketballs, Footballs, Cricket Balls, Tennis Balls' },
      { name: 'Rackets & Bats', description: 'Badminton Rackets, TT Bats, English Willow Cricket Bats' },
      { name: 'Protective & Guard Gear', description: 'Cricket Helmets, Leg Guards, Gloves, Shin Guards' },
      { name: 'Nets & Posts', description: 'Volleyball Nets, Badminton Nets, Football Goal Nets' },
      { name: 'Training & Fitness', description: 'Agility Cones, Bibs, Speed Ladders, Stopwatches' },
      { name: 'Chess & Tableware', description: 'Tournament Chess Sets, Digital Clocks, TT Net Sets' },
      { name: 'Track & Field Hardware', description: 'Javelins, Shot Puts, Discus, Relay Batons' },
      { name: 'First Aid & Safety', description: 'Ice Packs, Stretchers, Medical Kits' },
    ];
    const eqCats = await EquipmentCategory.insertMany(catData);
    const eqCatMap = {};
    eqCats.forEach(c => { eqCatMap[c.name] = c._id; });

    const equipmentItems = [];
    const eqSpecs = [
      { name: 'Spalding Official Basketball', cat: 'Balls & Spheres', qty: 25 },
      { name: 'Nike Pitch Football (Size 5)', cat: 'Balls & Spheres', qty: 20 },
      { name: 'Cosco Synthetic Volleyball', cat: 'Balls & Spheres', qty: 18 },
      { name: 'Kookaburra Red Cricket Ball Box (6s)', cat: 'Balls & Spheres', qty: 15 },
      { name: 'Yonex Mavis 350 Nylon Shuttlecock Box', cat: 'Balls & Spheres', qty: 30 },
      { name: 'Wilson US Open Tennis Ball Can', cat: 'Balls & Spheres', qty: 25 },
      { name: 'Stag 3-Star TT Balls Box (6s)', cat: 'Balls & Spheres', qty: 40 },
      { name: 'SG English Willow Cricket Bat Master', cat: 'Rackets & Bats', qty: 10 },
      { name: 'Yonex Carbonex 8000 Badminton Racket', cat: 'Rackets & Bats', qty: 20 },
      { name: 'Stag International TT Bat', cat: 'Rackets & Bats', qty: 16 },
      { name: 'Babolat Pure Drive Tennis Racket', cat: 'Rackets & Bats', qty: 12 },
      { name: 'SG Cricket Batting Helmet (Large)', cat: 'Protective & Guard Gear', qty: 8 },
      { name: 'SS Cricket Leg Guard Pair', cat: 'Protective & Guard Gear', qty: 10 },
      { name: 'Nivia Football Shin Guard Pair', cat: 'Protective & Guard Gear', qty: 15 },
      { name: 'Kookaburra Wicket Keeping Gloves', cat: 'Protective & Guard Gear', qty: 6 },
      { name: 'Heavy Duty Volleyball Net', cat: 'Nets & Posts', qty: 5 },
      { name: 'Yonex Professional Badminton Net', cat: 'Nets & Posts', qty: 6 },
      { name: 'Nike Training Agility Cones (Set of 10)', cat: 'Training & Fitness', qty: 14 },
      { name: 'DGT 2010 Digital Chess Clock', cat: 'Chess & Tableware', qty: 12 },
      { name: 'Tournament Wooden Chess Set Board', cat: 'Chess & Tableware', qty: 15 },
    ];

    let eqCodeCounter = 100;
    for (let i = 0; i < 50; i++) {
      const spec = eqSpecs[i % eqSpecs.length];
      const code = `EQP-${eqCodeCounter++}`;
      const total = spec.qty + (i % 5);
      const condition = i % 10 === 8 ? 'Poor' : (i % 10 === 9 ? 'Fair' : 'Good');
      const damaged = condition === 'Poor' ? 2 : 0;
      const lost = condition === 'Fair' ? 1 : 0;
      const issued = i % 4 === 0 ? 3 : 1;
      const available = Math.max(0, total - issued - damaged - lost);

      equipmentItems.push({
        equipmentCode: code,
        name: `${spec.name} #${i + 1}`,
        category: eqCatMap[spec.cat],
        totalQuantity: total,
        availableQuantity: available,
        issuedQuantity: issued,
        damagedQuantity: damaged,
        lostQuantity: lost,
        condition: condition,
      });
    }
    const createdEquipment = await Equipment.insertMany(equipmentItems);

    // 8. Borrow Records & Fines (25 borrows, 8 fines)
    console.log('8. Seeding Borrow Records & Fines...');
    const borrowDocs = [];
    const fineDocs = [];
    const studentUsers = users.filter(u => u.role.toString() === rMap['student'].toString());

    for (let i = 0; i < 25; i++) {
      const student = studentUsers[i % studentUsers.length];
      const eqItem = createdEquipment[i % createdEquipment.length];
      const isReturned = i % 3 !== 0;
      const isOverdue = !isReturned && i % 2 === 1;
      const issueDate = new Date(Date.now() - ((i + 5) * 86400000));
      const dueDate = new Date(issueDate.getTime() + (7 * 86400000));
      const returnDate = isReturned ? new Date(dueDate.getTime() + (i % 4 * 86400000)) : null;

      let status = isReturned ? 'Returned' : (isOverdue ? 'Overdue' : 'Issued');

      const borrowDoc = {
        equipment: eqItem._id,
        borrower: student._id,
        requestDate: issueDate,
        borrowDate: issueDate,
        dueDate: dueDate,
        returnDate: returnDate,
        quantity: 1,
        status: status,
        approvedBy: uMap['equipment@sportsync.com'],
        notes: `Seeded borrow record #${i + 1}`,
      };
      borrowDocs.push(borrowDoc);
    }
    const createdBorrows = await BorrowRecord.insertMany(borrowDocs);

    for (let i = 0; i < 8; i++) {
      const bRecord = createdBorrows[i * 3];
      const amount = 100 + (i * 50);
      const isPaid = i % 2 === 0;
      fineDocs.push({
        borrowRecord: bRecord._id,
        student: bRecord.borrower,
        amount: amount,
        reason: i % 2 === 0 ? 'Late Return' : 'Damaged',
        status: isPaid ? 'Paid' : (i === 7 ? 'Waived' : 'Unpaid'),
        paidDate: isPaid ? new Date() : null,
      });
    }
    await Fine.insertMany(fineDocs);

    // 9. Tournaments (8 tournaments)
    console.log('9. Seeding Tournaments (8 tournaments)...');
    const tournamentData = [
      { name: 'Inter-Department Basketball Trophy 2026', sport: sMap['Basketball'], venues: [vMap['Main Indoor Court']], format: 'Knockout', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-05'), status: 'Upcoming', maxTeams: 16, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Annual Cricket League T20', sport: sMap['Cricket'], venues: [vMap['Central Cricket Ground']], format: 'League', startDate: new Date('2026-09-01'), endDate: new Date('2026-09-15'), status: 'Ongoing', maxTeams: 8, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Chancellor Football Cup 2026', sport: sMap['Football'], venues: [vMap['Turf Football Field']], format: 'Group+Knockout', startDate: new Date('2026-08-10'), endDate: new Date('2026-08-20'), status: 'Completed', maxTeams: 12, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Campus Badminton Masters Open', sport: sMap['Badminton'], venues: [vMap['Badminton Complex (Court A)']], format: 'Knockout', startDate: new Date('2026-10-15'), endDate: new Date('2026-10-18'), status: 'Registration Open', maxTeams: 32, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Volleyball Championship 2026', sport: sMap['Volleyball'], venues: [vMap['Main Indoor Court']], format: 'Knockout', startDate: new Date('2026-11-01'), endDate: new Date('2026-11-04'), status: 'Upcoming', maxTeams: 16, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Inter-College Tennis Smash', sport: sMap['Tennis'], venues: [vMap['Tennis Hard Court 1']], format: 'Knockout', startDate: new Date('2026-11-10'), endDate: new Date('2026-11-12'), status: 'Upcoming', maxTeams: 16, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'State Level TT Invitational', sport: sMap['Table Tennis'], venues: [vMap['Table Tennis Arena']], format: 'Knockout', startDate: new Date('2026-07-01'), endDate: new Date('2026-07-03'), status: 'Completed', maxTeams: 24, createdBy: uMap['coordinator@sportsync.com'] },
      { name: 'Grandmaster Blitz Chess 2026', sport: sMap['Chess'], venues: [vMap['Chess Grandmaster Room']], format: 'Knockout', startDate: new Date('2026-09-25'), endDate: new Date('2026-09-26'), status: 'Registration Open', maxTeams: 64, createdBy: uMap['coordinator@sportsync.com'] },
    ];
    const tournaments = await Tournament.insertMany(tournamentData);

    // 10. Tournament Registrations & Matches/Fixtures (12 matches)
    console.log('10. Seeding Tournament Registrations, Fixtures & Matches...');
    const tRegs = [];
    teams.forEach((t, i) => {
      tRegs.push({
        tournament: tournaments[i % tournaments.length]._id,
        team: t._id,
        registeredBy: t.captain,
        status: 'Approved',
        paymentStatus: 'Paid',
      });
    });
    await TournamentRegistration.insertMany(tRegs);

    const fixtureDocs = [];
    const defaultVenueId = venues[0]._id;
    for (let i = 0; i < 12; i++) {
      const tour = tournaments[i % tournaments.length];
      const teamA = teams[i % teams.length];
      const teamB = teams[(i + 1) % teams.length];
      const venueId = (tour.venues && tour.venues.length > 0) ? tour.venues[0] : defaultVenueId;
      fixtureDocs.push({
        tournament: tour._id,
        round: i < 4 ? 'Quarter-Final' : (i < 8 ? 'Semi-Final' : 'Final'),
        matchNumber: i + 1,
        teamA: teamA._id,
        teamB: teamB._id,
        venue: venueId,
        scheduledDate: new Date(Date.now() + ((i - 5) * 86400000)),
        scheduledTime: '10:00 AM',
        status: i < 6 ? 'Completed' : 'Scheduled',
      });
    }
    const createdFixtures = await Fixture.insertMany(fixtureDocs);

    const matchDocs = [];
    createdFixtures.forEach((fix, i) => {
      const isCompleted = i < 6;
      matchDocs.push({
        fixture: fix._id,
        teamAScore: isCompleted ? 75 + (i * 3) : 0,
        teamBScore: isCompleted ? 68 + (i * 2) : 0,
        winner: isCompleted ? fix.teamA : null,
        status: isCompleted ? 'Completed' : 'Scheduled',
        updatedBy: uMap['coach.basketball@sportsync.com'],
      });
    });
    await Match.insertMany(matchDocs);

    // 11. Achievements (25 records)
    console.log('11. Seeding Achievements (25 records)...');
    const achDocs = [];
    for (let i = 0; i < 25; i++) {
      const p = players[i % players.length];
      achDocs.push({
        title: `Gold / Silver Trophy in ${sports[i % sports.length].name} Event #${i + 1}`,
        player: p._id,
        sport: p.sport,
        competition: 'Inter-University National Sports Meet 2025',
        level: i % 3 === 0 ? 'National' : (i % 3 === 1 ? 'State' : 'Inter College'),
        year: 2025 - (i % 2),
        position: i % 2 === 0 ? '1st Place' : 'Runner Up',
        medal: i % 2 === 0 ? 'Gold' : 'Silver',
        certificate: 'https://res.cloudinary.com/sportsync_demo/image/upload/v1/certificates/sample.pdf',
        status: i % 4 === 3 ? 'pending' : 'verified',
        verifiedBy: i % 4 === 3 ? null : uMap['coach.cricket@sportsync.com'],
      });
    }
    await Achievement.insertMany(achDocs);

    // 12. Attendance Logs
    console.log('12. Seeding Attendance Logs...');
    const attDocs = [];
    const approvedPlayers = players.filter(p => p.approvalStatus === 'Approved');
    const targetAttPlayers = approvedPlayers.length > 0 ? approvedPlayers : players;
    targetAttPlayers.forEach((p, idx) => {
      for (let day = 1; day <= 5; day++) {
        attDocs.push({
          player: p._id,
          sport: p.sport,
          session: day % 2 === 0 ? 'Morning Practice' : 'Evening Training',
          date: new Date(Date.now() - (day * 86400000)),
          status: (idx + day) % 5 === 0 ? 'Absent' : 'Present',
          markedBy: uMap['coach.cricket@sportsync.com'],
        });
      }
    });
    await Attendance.insertMany(attDocs);

    // 13. Notifications (25 notifications)
    console.log('13. Seeding Notifications (25 records)...');
    const notifDocs = [];
    for (let i = 0; i < 25; i++) {
      const user = users[i % users.length];
      notifDocs.push({
        recipient: user._id,
        title: `System Alert #${i + 1}`,
        message: `Important notification regarding upcoming tournament matches and store equipment dues for account ${user.email}.`,
        type: i % 4 === 0 ? 'Tournament' : (i % 4 === 1 ? 'Inventory' : (i % 4 === 2 ? 'Borrow' : 'System')),
        isRead: i % 2 === 0,
        createdAt: new Date(Date.now() - (i * 3600000)),
      });
    }
    await Notification.insertMany(notifDocs);

    // 14. Announcements (8 announcements)
    console.log('14. Seeding Announcements (8 records)...');
    const annDocs = [
      { title: 'Welcome to SportSync Management Portal', description: 'All sports coordinators and coaches are requested to update match schedules and approve pending registrations.', targetAudience: ['All'], createdBy: uMap['admin@sportsync.com'] },
      { title: 'Equipment Store Timings & Fine Policy', description: 'Store will remain open 8 AM - 6 PM on weekdays. Late returns incur standard fines of ₹20/day.', targetAudience: ['student', 'equipment_incharge'], createdBy: uMap['equipment@sportsync.com'] },
      { title: 'Inter-College Basketball Championship Registration', description: 'Submit team rosters before October 1st. Captains can register online via the Team portal.', targetAudience: ['student', 'coach'], createdBy: uMap['coordinator@sportsync.com'] },
      { title: 'Medical Screening & Fitness Tests Mandatory', description: 'All approved athletes must upload updated physical health certificates before participating in regional meets.', targetAudience: ['student'], createdBy: uMap['coordinator@sportsync.com'] },
      { title: 'Cricket Turf Maintenance Schedule', description: 'South Campus Cricket Ground will remain closed for maintenance on Sept 14th & 15th.', targetAudience: ['All'], createdBy: uMap['coach.cricket@sportsync.com'] },
      { title: 'Badminton Racket Stock Restocked', description: '20 new Yonex Carbonex rackets are available for short-term borrow in store.', targetAudience: ['student'], createdBy: uMap['equipment@sportsync.com'] },
      { title: 'Annual Sports Gala Dinner & Awards 2026', description: 'Save the date! Annual awards distribution ceremony will take place on December 20th.', targetAudience: ['All'], createdBy: uMap['admin@sportsync.com'] },
      { title: 'Volleyball Trials for University Squad', description: 'Open trials will be conducted this Saturday at 4 PM on Main Indoor Court.', targetAudience: ['student'], createdBy: uMap['coach.basketball@sportsync.com'] },
    ];
    await Announcement.insertMany(annDocs);

    console.log('---------------------------------------------------------');
    console.log('🎉 SEEDING COMPLETE! Successfully populated MongoDB with all 17 datasets:');
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Users: ${users.length} (2 Admin, 2 Coord, 4 Coach, 2 Equip, 10 Student)`);
    console.log(`- Sports: ${sports.length}`);
    console.log(`- Venues: ${venues.length}`);
    console.log(`- Players: ${players.length}`);
    console.log(`- Teams: ${teams.length}`);
    console.log(`- Team Members: ${teamMembersDocs.length}`);
    console.log(`- Equipment Categories: ${eqCats.length}`);
    console.log(`- Equipment Inventory Items: ${createdEquipment.length}`);
    console.log(`- Borrow Records: ${createdBorrows.length}`);
    console.log(`- Fine Records: ${fineDocs.length}`);
    console.log(`- Tournaments: ${tournaments.length}`);
    console.log(`- Tournament Registrations: ${tRegs.length}`);
    console.log(`- Matches: ${matchDocs.length}`);
    console.log(`- Achievements: ${achDocs.length}`);
    console.log(`- Attendance Logs: ${attDocs.length}`);
    console.log(`- Notifications: ${notifDocs.length}`);
    console.log(`- Announcements: ${annDocs.length}`);
    console.log('---------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAll();
