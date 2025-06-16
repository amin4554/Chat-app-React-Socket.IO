// index.js
require('dotenv').config(); // must be very top

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message'); // ✅ Add this

const authRoutes = require('./routes/auth');
const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', require('./routes/messages')); // add this line

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
    });
  
    // 2. Handle sending a message
    socket.on('private_message', async ({ senderId, recipientId, text }) => {
      // Save to DB
      const message = new Message({
        sender: senderId,
        recipient: recipientId,
        text
      });
  
      await message.save();
  
      // Send to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new_message', {
          _id: message._id,
          senderId,
          text,
          timestamp: message.timestamp
        });
      }
    });
  
    // 3. Handle disconnection
    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected.`);
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