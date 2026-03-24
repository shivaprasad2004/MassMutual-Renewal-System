const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await userService.createUser({ name, email, password, role });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // If not in local DB, check ServiceNow
      const snUser = await userService.authenticateWithServiceNow(email, password);
      if (snUser) {
        // Create user locally if they authenticated via ServiceNow
        user = await User.create({
          name: snUser.name,
          email: snUser.email,
          password: password, // Store password to match bcrypt later, or handle differently
          role: snUser.role
        });
      } else {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Even if local user exists, password might have changed in SN
        const snUser = await userService.authenticateWithServiceNow(email, password);
        if (!snUser) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
      }
    }

    // Sync login event to ServiceNow
    userService.logUserLogin(user);

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
