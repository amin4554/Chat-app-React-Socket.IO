const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get chat history between 2 users
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
      senderId: msg.sender.toString(),
      recipientId: msg.recipient.toString(),
      text: msg.text,
      timestamp: msg.timestamp,
      delivered: msg.delivered,
      read: msg.read
    }));

    res.json(formattedMessages);
  } catch (err) {
    console.error('Message fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get message status
router.get('/messages/status/:messageId', async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    res.json({
      delivered: message?.delivered || false,
      read: message?.read || false
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Mark message as delivered
router.patch('/messages/:id/delivered', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { delivered: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivered status' });
  }
});

// Mark message as read
router.patch('/messages/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update read status' });
  }
});

module.exports = router;
