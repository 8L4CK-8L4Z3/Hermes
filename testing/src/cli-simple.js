#!/usr/bin/env node

import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import figlet from 'figlet';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Create a promisified version of exec
const execAsync = promisify(exec);

// Display ASCII art banner
console.log(
  chalk.cyan(
    figlet.textSync('Hermes Tester', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
  )
);
console.log(chalk.yellow('CLI API Testing Tool\n'));
console.log(chalk.blue('=== REAL API TESTING MODE ==='));
console.log(chalk.blue('Tests will make actual HTTP requests to your server'));
console.log(chalk.blue('Data will be created in your database\n'));

async function runAllTests() {
  console.log(chalk.yellow('\n⚠ Server check skipped. Tests may fail if server is not running.\n'));
  
  const spinner = ora('Running all tests...').start();
  
  try {
    const command = 'npx vitest run';
    console.log(chalk.blue(`\nExecuting command: ${command}`));
    
    const { stdout, stderr } = await execAsync(command, { cwd: ROOT_DIR });
    
    spinner.succeed('Tests completed!');
    console.log('\n');
    console.log(stdout);
    
    if (stderr) {
      console.error(chalk.red('Errors:'));
      console.error(stderr);
    }
    
    return true;
  } catch (error) {
    spinner.fail('Tests failed!');
    console.error('\n');
    
    if (error.stdout) {
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      console.error(chalk.red('Errors:'));
      console.error(error.stderr);
    }
    
    return false;
  }
}

// Run all tests
runAllTests().then((success) => {
  if (success) {
    console.log(chalk.green('\n✓ All tests completed successfully'));
  } else {
    console.log(chalk.red('\n✗ Tests failed'));
    process.exit(1);
  }
}); 