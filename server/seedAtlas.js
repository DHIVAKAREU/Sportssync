const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config();

const Role = require('./models/roles.model');
const User = require('./models/users.model');
const Sport = require('./models/sports.model');
const Venue = require('./models/venues.model');
const EquipmentCategory = require('./models/equipmentCategories.model');
const Equipment = require('./models/equipment.model');
const Tournament = require('./models/tournaments.model');
const Team = require('./models/teams.model');
const Announcement = require('./models/announcements.model');
const Achievement = require('./models/achievements.model');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas successfully.');

    // 1. Roles
    console.log('Seeding Roles...');
    let roles = await Role.find();
    if (roles.length === 0) {
      roles = await Role.insertMany([
        { name: 'admin', description: 'Full system administrator' },
        { name: 'coordinator', description: 'Sports council coordinator' },
        { name: 'coach', description: 'Sport coach' },
        { name: 'equipment_incharge', description: 'Equipment & store incharge' },
        { name: 'student', description: 'Student player / member' },
      ]);
    }
    const rolesMap = {};
    roles.forEach(r => { rolesMap[r.name] = r._id; });

    // 2. Users
    console.log('Seeding Users...');
    const userCount = await User.countDocuments();
    let adminUser, coordUser, coachUser, equipUser, studentUser;
    if (userCount === 0) {
      const users = await User.create([
        { name: 'System Admin', email: 'admin@sportsync.edu', password: 'Admin@123', role: rolesMap['admin'] },
        { name: 'Sports Coordinator', email: 'coordinator@sportsync.edu', password: 'Coord@123', role: rolesMap['coordinator'] },
        { name: 'Coach David', email: 'coach@sportsync.edu', password: 'Coach@123', role: rolesMap['coach'], department: 'Physical Education' },
        { name: 'Equipment Manager', email: 'equipment@sportsync.edu', password: 'Equip@123', role: rolesMap['equipment_incharge'] },
        { name: 'Alex Johnson', email: 'student@sportsync.edu', password: 'Student@123', role: rolesMap['student'], registerNumber: 'REG1001', department: 'Computer Science', year: 3 },
      ]);
      adminUser = users[0];
      coordUser = users[1];
      coachUser = users[2];
      equipUser = users[3];
      studentUser = users[4];
    } else {
      adminUser = await User.findOne({ email: 'admin@sportsync.edu' });
      coordUser = await User.findOne({ email: 'coordinator@sportsync.edu' });
      coachUser = await User.findOne({ email: 'coach@sportsync.edu' });
      equipUser = await User.findOne({ email: 'equipment@sportsync.edu' });
      studentUser = await User.findOne({ email: 'student@sportsync.edu' });
    }

    // 3. Sports
    console.log('Seeding Sports...');
    let sports = await Sport.find();
    if (sports.length === 0) {
      sports = await Sport.insertMany([
        { name: 'Basketball', category: 'Team', minTeamSize: 5, maxTeamSize: 12, description: 'Indoor 5v5 Basketball' },
        { name: 'Football', category: 'Team', minTeamSize: 11, maxTeamSize: 18, description: 'Outdoor 11v11 Association Football' },
        { name: 'Badminton', category: 'Individual', minTeamSize: 1, maxTeamSize: 2, description: 'Singles and Doubles Badminton' },
        { name: 'Cricket', category: 'Team', minTeamSize: 11, maxTeamSize: 16, description: 'T20 & 50-over Cricket' },
        { name: 'Table Tennis', category: 'Individual', minTeamSize: 1, maxTeamSize: 2, description: 'Indoor Ping Pong' },
        { name: 'Volleyball', category: 'Team', minTeamSize: 6, maxTeamSize: 12, description: 'Outdoor 6v6 Volleyball' },
      ]);
    }

    // 4. Venues
    console.log('Seeding Venues...');
    let venues = await Venue.find();
    if (venues.length === 0) {
      venues = await Venue.insertMany([
        { name: 'Main Indoor Basketball Court', code: 'COURT-A', location: 'Sports Complex Ground Floor', type: 'Court', capacity: 300 },
        { name: 'Central Football Turf', code: 'FIELD-1', location: 'Main Campus East Wing', type: 'Outdoor Field', capacity: 1500 },
        { name: 'Badminton Arena (4 Courts)', code: 'BADM-HALL', location: 'Indoor Stadium 2nd Floor', type: 'Indoor Hall', capacity: 200 },
        { name: 'Cricket Stadium', code: 'CRIC-MAIN', location: 'South Ground', type: 'Ground', capacity: 3000 },
      ]);
    }

    // 5. Equipment Categories & Items
    console.log('Seeding Equipment Categories & Inventory...');
    let categories = await EquipmentCategory.find();
    if (categories.length === 0) {
      categories = await EquipmentCategory.insertMany([
        { name: 'Balls', description: 'Basketballs, Footballs, Cricket Balls' },
        { name: 'Rackets & Bats', description: 'Badminton rackets, TT bats, Cricket bats' },
        { name: 'Protective Gear', description: 'Helmets, Pads, Gloves' },
        { name: 'Training Accessories', description: 'Cones, Markers, Bibs' },
      ]);
    }
    const allCategories = await EquipmentCategory.find();
    const catMap = {};
    allCategories.forEach(c => { catMap[c.name] = c._id; });

    let equipmentCount = await Equipment.countDocuments();
    if (equipmentCount === 0) {
      const defaultCatId = allCategories[0]._id;
      await Equipment.insertMany([
        { equipmentCode: 'EQ-BALL-001', name: 'Spalding Official Basketball', category: catMap['Balls'] || defaultCatId, totalQuantity: 20, availableQuantity: 18, issuedQuantity: 2, damagedQuantity: 0, lostQuantity: 0, condition: 'Good' },
        { equipmentCode: 'EQ-BALL-002', name: 'Nike Pitch Football (Size 5)', category: catMap['Balls'] || defaultCatId, totalQuantity: 15, availableQuantity: 12, issuedQuantity: 3, damagedQuantity: 0, lostQuantity: 0, condition: 'Good' },
        { equipmentCode: 'EQ-RACK-001', name: 'Yonex Badminton Racket Carbonex 8000', category: catMap['Rackets & Bats'] || defaultCatId, totalQuantity: 16, availableQuantity: 14, issuedQuantity: 2, damagedQuantity: 0, lostQuantity: 0, condition: 'Good' },
        { equipmentCode: 'EQ-BAT-001', name: 'SG English Willow Cricket Bat', category: catMap['Rackets & Bats'] || defaultCatId, totalQuantity: 8, availableQuantity: 6, issuedQuantity: 2, damagedQuantity: 0, lostQuantity: 0, condition: 'Good' },
      ]);
    }

    // 6. Teams
    console.log('Seeding Teams...');
    let teamCount = await Team.countDocuments();
    if (teamCount === 0 && sports.length > 0) {
      const basketball = sports.find(s => s.name === 'Basketball');
      const football = sports.find(s => s.name === 'Football');
      await Team.create([
        { name: 'Thunderbolts BC', sport: basketball._id, captain: studentUser?._id, createdBy: coordUser?._id, season: '2025-2026' },
        { name: 'Red Dragons FC', sport: football._id, captain: studentUser?._id, createdBy: coordUser?._id, season: '2025-2026' },
      ]);
    }

    // 7. Tournaments
    console.log('Seeding Tournaments...');
    let tournamentCount = await Tournament.countDocuments();
    if (tournamentCount === 0 && sports.length > 0 && venues.length > 0) {
      const basketball = sports.find(s => s.name === 'Basketball');
      const bballCourt = venues.find(v => v.name.includes('Basketball'));
      await Tournament.create([
        {
          name: 'Annual Inter-College Basketball Championship 2026',
          sport: basketball._id,
          venue: bballCourt._id,
          format: 'Knockout',
          startDate: new Date('2026-09-10'),
          endDate: new Date('2026-09-15'),
          status: 'Upcoming',
          maxTeams: 16,
          createdBy: coordUser?._id,
        },
      ]);
    }

    // 8. Announcements
    console.log('Seeding Announcements...');
    let announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
        {
          title: 'Welcome to SportSync 2026!',
          description: 'Registration for the Inter-College Basketball Championship is now open. All teams are requested to submit roster details by Sept 1st.',
          targetAudience: ['All'],
          createdBy: adminUser?._id || coordUser?._id,
        },
        {
          title: 'Sports Store Timings Update',
          description: 'The sports equipment store will remain open from 8:00 AM to 6:00 PM on all weekdays.',
          targetAudience: ['student'],
          createdBy: equipUser?._id || adminUser?._id,
        },
      ]);
    }

    // 9. Achievements & Players
    console.log('Seeding Achievements...');
    let achievementCount = await Achievement.countDocuments();
    if (achievementCount === 0 && studentUser && sports.length > 0) {
      const Player = require('./models/players.model');
      let player = await Player.findOne({ user: studentUser._id });
      if (!player) {
        player = await Player.create({
          user: studentUser._id,
          sport: sports.find(s => s.name === 'Badminton')?._id || sports[0]._id,
          approvalStatus: 'Approved',
        });
      }

      await Achievement.create([
        {
          title: 'Gold Medal - State Level Badminton Singles',
          player: player._id,
          sport: sports.find(s => s.name === 'Badminton')?._id || sports[0]._id,
          competition: 'State Inter-University Sports Meet 2025',
          level: 'State',
          year: 2025,
          position: '1st Place',
          medal: 'Gold',
          certificate: 'https://res.cloudinary.com/sportsync_demo/image/upload/sample.jpg',
          status: 'verified',
          verifiedBy: coachUser?._id,
        },
      ]);
    }

    console.log('🎉 Comprehensive database seeding complete! All initial collection datas are stored in MongoDB Atlas.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
