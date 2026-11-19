/**
 * MongoDB Connection Handler using Mongoose
 */
export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[MongoDB] No MONGODB_URI found in .env. Using JSON database (data/db.json).');
    return false;
  }

  try {
    // Dynamic import to prevent crash if mongoose isn't installed yet
    const { default: mongoose } = await import('mongoose');

    await mongoose.connect(uri);
    console.log('[MongoDB] ✅ Successfully connected to MongoDB database!');

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database.');
    });

    return true;
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('[MongoDB] Mongoose package is not installed yet.');
      console.log('          Run "npm install mongoose" in the service/ folder to enable MongoDB.');
    } else {
      console.error('[MongoDB] ❌ Connection failed:', err.message);
    }
    return false;
  }
}
