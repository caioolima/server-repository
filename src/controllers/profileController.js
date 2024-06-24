const User = require('../models/userModel');

const express = require('express');

exports.findUserByToken = async (req, res) => {
  try {
    const {userId: id} = req.user;

    const user = await User.findById(id);

    if(!user) {
      return res.status(400).json({ success: false, errors, message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ available: false }); // Em caso de erro, considerar como não disponível
  }
};
