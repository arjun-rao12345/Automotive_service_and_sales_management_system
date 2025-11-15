const app = require('./app');
const { testConnection } = require('./config/database');
const config = require('./config/config');

const PORT = config.port;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║   🚗  AUTOMOTIVE SERVICE MANAGEMENT SYSTEM API        ║
║                                                        ║
║   Server: http://localhost:${PORT}                      ║
║   Environment: ${config.env.toUpperCase().padEnd(38)}  ║
║   Database: Connected ✅                               ║
║                                                        ║
║   API Endpoints:                                       ║
║   - GET  /health                                       ║
║   - /api/dashboard                                     ║
║   - /api/customers                                     ║
║   - /api/vehicles                                      ║
║   - /api/services                                      ║
║   - /api/employees                                     ║
║   - /api/inventory                                     ║
║   - /api/invoices                                      ║
║   - /api/feedback                                      ║
║   - /api/insurance                                     ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();