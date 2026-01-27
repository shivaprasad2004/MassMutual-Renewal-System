const express = require('express');
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

const authRoutes = require('./routes/authRoutes');
const policyRoutes = require('./routes/policyRoutes');
const customerRoutes = require('./routes/customerRoutes');
const initCron = require('./jobs/renewalCheck');

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
