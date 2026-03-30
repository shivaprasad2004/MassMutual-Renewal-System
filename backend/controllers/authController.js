const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const ServiceNowService = require('../services/servicenowService');

exports.me = async (req, res) => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify with ignoreExpiration to allow refresh of expired tokens
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Check if user still exists
    const user = await userService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Issue fresh token
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token: newToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token refresh failed', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await userService.findUserByEmail(email);
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

    // Direct Authentication against ServiceNow
    const snUser = await ServiceNowService.authenticateUser(email, password);
    
    if (snUser) {
      const token = jwt.sign({ id: snUser.id, role: snUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      // Log login activity to SN
      const SN_AUTH_TABLE = process.env.SN_TABLE_NAME || 'u_massmutualsystemauth';
      ServiceNowService.update(SN_AUTH_TABLE, snUser.id, {
        u_last_login: new Date().toISOString()
      }).catch(err => console.error('SN Last Login Update Error:', err.message));

      res.json({ token, user: snUser });
    } else {
      res.status(400).json({ message: 'Invalid ServiceNow credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
