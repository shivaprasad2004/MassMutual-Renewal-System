const express = require('express');
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import Server from socket.io
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
require('./models'); // Import models to ensure they are registered

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const customerRoutes = require('./routes/customerRoutes');
const initCron = require('./jobs/renewalCheck');

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/customers', customerRoutes);

// Initialize Cron Jobs
initCron();

app.get('/', (req, res) => {
  res.send('MassMutual Policy Renewal API is running');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Listen on server, not app
  console.log(`Server running on port ${PORT}`);
});
