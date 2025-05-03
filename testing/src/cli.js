#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { formatTestResults, runTest, parseTestResults } from './utils/testRunner.js';
import { printSummary, printCoverageSummary } from './utils/summaryPrinter.js';
import { fileURLToPath } from 'url';
import { checkServerStatus } from './utils/checkServer.js';

const execAsync = promisify(exec);

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_DIR = path.resolve(__dirname, 'test');

// Configure commander
program
  .option('-a, --all', 'Run all tests')
  .option('-t, --test <test>', 'Run a specific test file')
  .option('-g, --group <group>', 'Run tests for a specific API group')
  .option('-c, --coverage', 'Generate coverage report')
  .option('-w, --watch', 'Run tests in watch mode')
  .option('-u, --ui', 'Open Vitest UI')
  .parse(process.argv);

// Store options at a higher scope
const cmdOptions = program.opts();

// Display banner
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

// Test categories
const TEST_CATEGORIES = {
  'Authentication': 'auth',
  'Trips': 'trips',
  'Experiences': 'experiences',
  'Content Management': 'content',
  'Admin': 'admin',
  'Analytics': 'analytics',
  'Notifications': 'notifications'
};

// Function to get all test files
async function getTestFiles() {
  const testDir = path.join(process.cwd(), 'src/test');
  const files = await fs.readdir(testDir);
  return files
    .filter(file => file.endsWith('.test.js') || file.endsWith('.spec.js'))
    .map(file => file.replace('.js', ''));
}

// Function to categorize test files
function categorizeTests(testFiles) {
  const categorized = {};
  
  Object.entries(TEST_CATEGORIES).forEach(([category, prefix]) => {
    categorized[category] = testFiles.filter(file => file.startsWith(prefix));
  });
  
  // Add uncategorized tests
  const allCategoryFiles = Object.values(categorized).flat();
  categorized['Other'] = testFiles.filter(file => !allCategoryFiles.includes(file));
  
  return categorized;
}

// Main function
async function main() {
  try {
    // Check if server is running before proceeding
    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
      console.log(chalk.red('Tests require a running server. Please start the server and try again.'));
      process.exit(1);
    }
    
    // Use cmdOptions from higher scope, no need to redefine

    if (cmdOptions.all) {
      // Run all tests
      await runTests();
    } else if (cmdOptions.test) {
      // Run specific test
      await runTests(`src/test/${cmdOptions.test}`);
    } else if (cmdOptions.group) {
      // Find the test files for this group
      const testFiles = await getTestFiles();
      const groupPrefix = Object.entries(TEST_CATEGORIES)
        .find(([name]) => name.toLowerCase() === cmdOptions.group.toLowerCase() || 
               TEST_CATEGORIES[name] === cmdOptions.group.toLowerCase())?.[1];
      
      if (groupPrefix) {
        const groupTests = testFiles.filter(file => file.startsWith(groupPrefix));
        if (groupTests.length > 0) {
          const testPaths = groupTests.map(file => `src/test/${file}.js`);
          await runTests(testPaths.join(' '));
        } else {
          console.error(chalk.red(`No tests found for group: ${cmdOptions.group}`));
        }
      } else {
        console.error(chalk.red(`Unknown test group: ${cmdOptions.group}`));
        console.log(chalk.yellow('Available groups:'));
        Object.entries(TEST_CATEGORIES).forEach(([name, prefix]) => {
          console.log(`  - ${name} (${prefix})`);
        });
      }
    } else {
      // Interactive mode
      const testFiles = await getTestFiles();
      const categorizedTests = categorizeTests(testFiles);
      
      const mainMenu = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            'Run all tests',
            'Run tests by category',
            'Run specific test',
            'Run with coverage',
            'Exit'
          ]
        }
      ]);
      
      if (mainMenu.action === 'Exit') {
        console.log(chalk.cyan('Goodbye!'));
        return;
      } else if (mainMenu.action === 'Run all tests') {
        await runTests();
      } else if (mainMenu.action === 'Run with coverage') {
        await runTests(null, true);
      } else if (mainMenu.action === 'Run tests by category') {
        const categoryMenu = await inquirer.prompt([
          {
            type: 'list',
            name: 'category',
            message: 'Select a test category:',
            choices: Object.keys(categorizedTests).filter(cat => categorizedTests[cat].length > 0)
          }
        ]);
        
        const selectedCategory = categoryMenu.category;
        const categoryFiles = categorizedTests[selectedCategory];
        
        if (categoryFiles.length > 0) {
          const testPaths = categoryFiles.map(file => `src/test/${file}.js`);
          await runTests(testPaths.join(' '));
        } else {
          console.log(chalk.yellow(`No tests found in category: ${selectedCategory}`));
        }
      } else if (mainMenu.action === 'Run specific test') {
        // Flatten the categorized tests into a structured list
        const testChoices = [];
        
        Object.entries(categorizedTests).forEach(([category, files]) => {
          if (files.length > 0) {
            testChoices.push(new inquirer.Separator(`--- ${category} ---`));
            files.forEach(file => {
              testChoices.push({
                name: file,
                value: file
              });
            });
          }
        });
        
        const testMenu = await inquirer.prompt([
          {
            type: 'list',
            name: 'testFile',
            message: 'Select a test file to run:',
            choices: [...testChoices, new inquirer.Separator(), 'Back']
          }
        ]);
        
        if (testMenu.testFile !== 'Back') {
          await runTests(`src/test/${testMenu.testFile}.js`);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Function to run tests
async function runTests(testFile = null, coverage = false) {
  let command = 'npx vitest run';
  
  if (testFile) {
    command += ` ${testFile}`;
  }
  
  if (coverage || cmdOptions.coverage) {
    command += ' --coverage';
  }
  
  if (cmdOptions.watch) {
    command = command.replace('run', '');
  }
  
  if (cmdOptions.ui) {
    command = 'npx vitest --ui';
  }
  
  const spinner = ora('Running tests...').start();
  
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: ROOT_DIR });
    spinner.succeed(chalk.green('Tests completed!'));
    
    if (stderr) {
      console.error(chalk.yellow(stderr));
    }
    
    // Process and display the results
    console.log('\n');
    formatTestResults(stdout);
    
    // Parse and display summary
    const stats = parseTestResults(stdout);
    printSummary(stats);
    
    if (coverage || cmdOptions.coverage) {
      // Note: coverage data parsing would need to be implemented
      // This is a placeholder for actual coverage parsing
      console.log(chalk.yellow('Coverage report generated.'));
      console.log(chalk.yellow('See coverage/index.html for detailed report.'));
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Tests failed'));
    
    if (error.stdout) {
      formatTestResults(error.stdout);
      const stats = parseTestResults(error.stdout);
      printSummary(stats);
      
      // Only exit with error code if there are actual test failures
      if (stats.failed > 0) {
        process.exit(1);
      }
    } else {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }
}

// Run the CLI
main().catch(err => {
  console.error(chalk.red(err));
  process.exit(1);
});