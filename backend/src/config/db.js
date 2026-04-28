const mongoose = require('mongoose');

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crud_demo';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
};

module.exports = connectDb;
