const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join personal user room for direct notifications
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
      }
    });

    // Join role room (e.g. role_admin, role_coach)
    socket.on('join_role_room', (roleName) => {
      if (roleName) {
        socket.join(`role_${roleName.toLowerCase()}`);
        console.log(`Socket ${socket.id} joined room role_${roleName.toLowerCase()}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
  }
  return io;
};

module.exports = { initSocket, getIO };
