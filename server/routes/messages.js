const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get chat history between 2 users
// server/routes/messages.js
router.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    }).sort({ timestamp: 1 });

    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      senderId: msg.sender.toString(),     // ✅ stringified
      recipientId: msg.recipient.toString(), // ✅ stringified
      text: msg.text,
      timestamp: msg.timestamp
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Message fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


module.exports = router;
