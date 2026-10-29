const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const { initSocket } = require('./sockets');
const { initCronJobs } = require('./jobs/overdueCheck');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.IO & Cron Jobs
initSocket(server);
initCronJobs();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SportSync API is healthy & running', timestamp: new Date() });
});

// Mount API v1 Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/sports', require('./routes/sport.routes'));
app.use('/api/v1/players', require('./routes/player.routes'));
app.use('/api/v1/teams', require('./routes/team.routes'));
app.use('/api/v1/achievements', require('./routes/achievement.routes'));
app.use('/api/v1/attendance', require('./routes/attendance.routes'));
app.use('/api/v1/equipment', require('./routes/equipment.routes'));
app.use('/api/v1/borrow', require('./routes/borrow.routes'));
app.use('/api/v1/fines', require('./routes/fine.routes'));
app.use('/api/v1/venues', require('./routes/venue.routes'));
app.use('/api/v1/tournaments', require('./routes/tournament.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/announcements', require('./routes/announcement.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));
app.use('/api/v1/reports', require('./routes/report.routes'));
app.use('/api/v1/audit-logs', require('./routes/auditLog.routes'));
app.use('/api/v1/sports-news', require('./routes/sportsNews.routes'));

// Serve static frontend assets in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
} else {
  // Root endpoint for development
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'SportSync Backend API is running',
      health: '/api/v1/health',
    });
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SportSync Backend API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
