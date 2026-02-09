import dotenv from 'dotenv';
dotenv.config();

const required = [
  'PORT',
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
];

const missing = [];
for (const key of required) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoURI: process.env.MONGO_URI,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
