import dotenv from 'dotenv';

//Load environment variables from .env for Playwright tests
dotenv.config({ path: './.env' });
// process.env.MONGO_URL = process.env.MONGO_URL_TEST;

export default async () => {
  console.log('Loaded environment variables for Playwright tests');
};
