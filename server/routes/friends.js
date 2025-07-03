const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Send Friend Request
// POST /api/friends/request
router.post('/request', async (req, res) => {
    const { fromUserId, toUsername } = req.body;
  
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findOne({ username: toUsername });
  
    if (!toUser) return res.status(404).json({ message: 'User not found' });
  
    if (toUser.friendRequests.includes(fromUserId) || toUser.friends.includes(fromUserId)) {
      return res.status(400).json({ message: 'Already sent or already friends' });
    }
  
    toUser.friendRequests.push(fromUserId);
    await toUser.save();
  
    res.json({ message: 'Friend request sent', toUserId: toUser._id });

  });
  
  

// Accept Friend Request
router.post('/accept', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  try {
    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(requesterId);

    if (!currentUser || !requester)
      return res.status(404).json({ message: 'User not found' });

    // Remove from friendRequests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );

    // Add each other as friends
    currentUser.friends.push(requesterId);
    requester.friends.push(currentUserId);

    await currentUser.save();
    await requester.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline Friend Request
router.post('/decline', async (req, res) => {
  const { currentUserId, requesterId } = req.body;

  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser)
      return res.status(404).json({ message: 'User not found' });

    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );

    await currentUser.save();

    res.json({ message: 'Friend request declined' });
  } catch (err) {
    console.error('Decline request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
