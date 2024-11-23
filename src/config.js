// client/src/config.js
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';
import fs from 'fs';

// Define the path to the root .env file
const envPath = path.resolve(__dirname, '../.env');

// Ensure the .env file exists
if (fs.existsSync(envPath)) {
  // Load environment variables from the root .env file
  const env = dotenv.config({ path: envPath });
  dotenvExpand(env);
}

// Export the configuration object
const config = {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL 
};

export default config;
