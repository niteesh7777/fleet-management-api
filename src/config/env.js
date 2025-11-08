import dotenv from 'dotenv';
dotenv.config();

const required = ['PORT', 'MONGO_URI'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 4001,
  mongoUri: process.env.MONGO_URI,
};
