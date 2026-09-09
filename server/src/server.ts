import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import { connectDB } from './config/db';
import { seedDatabase } from './seed/seed';
import { User } from './models/User';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const dbUri = await connectDB();
    console.log(`✅ MongoDB Ready at: ${dbUri}`);

    // Auto-seed if database is empty (fresh MongoMemoryServer or new installation)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📭 Database is empty — running auto-seed with open mandi data...');
      await seedDatabase(false); // false = don't disconnect after seeding
      console.log('✅ Auto-seed complete.');
    } else {
      console.log(`ℹ️  Database already has ${userCount} users — skipping seed.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 FarmSetu Backend running on http://localhost:${PORT}`);
      console.log(`   Demo Farmer: farmer@farmsetu.com / demo123`);
      console.log(`   Demo Buyer:  buyer@farmsetu.com  / demo123`);
      console.log(`   Demo Admin:  admin@farmsetu.com  / demo123`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
