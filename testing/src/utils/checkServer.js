import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

// Base URL from setup
const BASE_URL = 'http://localhost:3000';

/**
 * Check if the server is running
 * @returns {Promise<boolean>} True if server is running, false otherwise
 */
export async function checkServerStatus() {
  try {
    console.log(chalk.blue(`Checking server connection at ${BASE_URL}...`));
    
    const spinner = ora('Connecting to API server...').start();
    
    try {
      // First, try a GET request to the root URL
      // Even a 404 response means the server is running
      const response = await axios.get(BASE_URL, { 
        timeout: 5000,
        validateStatus: (status) => {
          // Consider any response a success, even 404
          // This just checks if the server is running
          return status >= 200 && status < 500;
        }
      });
      
      if (response.status === 404) {
        spinner.info(chalk.yellow('Server is running but root endpoint returned 404 - this is okay!'));
      } else {
        spinner.succeed(chalk.green('Successfully connected to the API server!'));
      }
      
      console.log(chalk.green('✓ Server is running and responding to requests'));
      return true;
    } catch (error) {
      spinner.fail(chalk.red(`Failed to connect to the API server at ${BASE_URL}`));
      console.log(chalk.yellow('Please ensure your server is running before running tests'));
      console.log(chalk.yellow(`To start the server, run: cd ../server && yarn dev`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('Error checking server status:'), error);
    return false;
  }
}

// When run directly, check server status and exit with appropriate code
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await checkServerStatus();
  process.exit(result ? 0 : 1);
}

export default checkServerStatus; 