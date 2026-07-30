const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
// Gmail SMTP email service loaded

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/apiRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Security and utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading assets/images locally
}));

// CORS Configuration
app.use(cors({
  origin: '*', // For local dev, allows any frontend port (e.g. 5173, 3000)
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting (500 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Root Health Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediCore HMS Express Server is healthy and running',
    timestamp: new Date().toISOString()
  });
});

// Mount Central API Routes
app.use('/api', apiRoutes);

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test and establish database pool connection
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 MediCore HMS Server running on port ${PORT}`);
      console.log(`📡 API endpoints base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Server startup failure due to DB connection error:', error.message);
    process.exit(1);
  }
};

// Centralized error catchers
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Promise Rejection:', err.message);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
