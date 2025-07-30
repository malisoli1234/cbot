const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/currencies', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️ Database connection error: ${error.message}`);
    console.log(`⚠️ Server will run without database. Install MongoDB or start MongoDB service.`);
    // Don't exit process, just log the error
  }
};

module.exports = connectDB; 