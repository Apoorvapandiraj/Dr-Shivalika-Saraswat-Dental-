const mongoose = require('mongoose');

const buildUri = () => {
  const mongodbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (mongodbUri) return mongodbUri;
  const { DB_USER, DB_PASSWORD, DB_CLUSTER, DB_APPNAME } = process.env;
  if (!DB_CLUSTER) throw new Error('Database configuration missing: set MONGODB_URI, MONGO_URI, or DB_CLUSTER');
  const auth = DB_USER && DB_PASSWORD ? `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@` : '';
  const appName = DB_APPNAME ? `?appName=${DB_APPNAME}` : '';
  return `mongodb+srv://${auth}${DB_CLUSTER}/dr-shivalika${appName}`;
};

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(buildUri(), {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

module.exports = connectDatabase;
