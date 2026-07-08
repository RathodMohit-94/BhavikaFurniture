require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');

// Connect to MongoDB
connectDB();

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.disable('x-powered-by');

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount the dynamic admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'new-fur-api', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.status ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
