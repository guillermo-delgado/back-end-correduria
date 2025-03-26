import mongoose from 'mongoose';

export const connectToMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'correduria',
  });
  console.log('✅ Conectado a MongoDB');
};
