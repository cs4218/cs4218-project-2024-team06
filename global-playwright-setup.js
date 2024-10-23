import dotenv from 'dotenv';

//Load environment variables from .env for Playwright tests
dotenv.config({ path: './.env' });

export default async () => {
  console.log('Loaded environment variables for Playwright tests');
};
