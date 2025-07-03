// index.js
require('dotenv').config(); // must be very top

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message'); // ✅ Add this
const friendsRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const app = express();



// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', messageRoutes); // ✅ this line must exist
app.use('/api/friends', friendsRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.send('Chat app backend is running.');
});

// Create HTTP server and bind to Express
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // 👈 Allow React app
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
const onlineUsers = new Map();
// Handle socket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  
    // 1. Save user's socket ID
    socket.on('register', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is now online.`);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
    // 1.5 Handle friend requests 
    socket.on('send_friend_request', ({ toUserId }) => {
      console.log('📩 Friend request triggered to user:', toUserId); // ✅ Add this
      const socketId = onlineUsers.get(toUserId);
      if (socketId) {
        io.to(socketId).emit('new_friend_request');
      }
    });
    //1.5.2 handle friend request acceptance or decline
    socket.on('friend_request_accepted', ({ fromUserId, toUserId }) => {
      const socketId = onlineUsers.get(fromUserId);
      if (socketId) {
        io.to(socketId).emit('friend_request_accepted', { userId: toUserId });
    
        // ✅ NEW: also trigger UI update
        io.to(socketId).emit('refresh_connections');
      }
    });
    
    
    socket.on('friend_request_declined', ({ fromUserId, toUserId }) => {
      const socketId = onlineUsers.get(fromUserId);
      if (socketId) {
        io.to(socketId).emit('friend_request_declined', { userId: toUserId });
      }
    });
    
    
  
    // 2. Handle sending a message
    socket.on('private_message', async ({ senderId, recipientId, text }) => {
      const recipientSocketId = onlineUsers.get(recipientId); // ✅ Moved up
      const senderSocketId = onlineUsers.get(senderId);
    
      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        text,
        delivered: !!recipientSocketId // ✅ Now recipientSocketId is defined
      });
    
      await message.save();
    
      console.log('Recipient socket:', recipientSocketId);
      console.log('Sender socket:', senderSocketId);
    
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', {
          _id: message._id,
          senderId,
          recipientId,
          text,
          timestamp: message.timestamp,
          delivered: true,
          read: false
        });
      }
    
      if (senderSocketId) {
        io.to(senderSocketId).emit('new_message', {
          _id: message._id,
          senderId,
          recipientId,
          text,
          timestamp: message.timestamp,
          delivered: !!recipientSocketId,
          read: false
        });
      }
    });
    
    
    // Handle typing indicator
    socket.on('typing', ({ from, to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing', { from });
      }
    });

      // 2.5 Mark message as delivered
      socket.on('mark_as_delivered', async ({ messageId }) => {
        try {
          const message = await Message.findByIdAndUpdate(
            messageId,
            { delivered: true },
            { new: true }
          );
          if (message) {
            const senderSocketId = onlineUsers.get(String(message.sender));
            if (senderSocketId) {
              io.to(senderSocketId).emit('message_delivered', { messageId });
            }
          }
        } catch (err) {
          console.error('Error marking message as delivered:', err);
        }
      });
    // 2.6 Handle mark as read
    socket.on('mark_as_read', async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(messageId, { read: true }, { new: true });
        if (message) {
          const senderSocketId = onlineUsers.get(String(message.sender));
          if (senderSocketId) {
            io.to(senderSocketId).emit('message_read', { messageId });
          }
        }
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    });

  

    
  
    // 3. Handle disconnection
    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected.`);
          // Update online users
          io.emit('online_users', Array.from(onlineUsers.keys()));
          break;
        }
      }
    });
  });
  

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');

  // Start the server after DB is ready
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

app.get('/ping', (req, res) => {
  res.send('pong');
});