import chalk from 'chalk';
import { execSync } from 'child_process';
import path from 'path';

/**
 * Formats and displays test results in the terminal
 * @param {string} results - The raw test results from Vitest
 */
export function formatTestResults(results) {
  const lines = results.split('\n');
  
  lines.forEach(line => {
    if (line.includes('✓')) {
      console.log(chalk.green(line));
    } else if (line.includes('✗') || line.includes('FAIL')) {
      console.log(chalk.red(line));
    } else if (line.includes('Test Files') || line.includes('Tests') || line.includes('Duration')) {
      console.log(chalk.cyan(line));
    } else if (line.includes('RUN')) {
      console.log(chalk.yellow(line));
    } else {
      console.log(line);
    }
  });
}

/**
 * Runs a test file and returns the formatted results
 * @param {string} testFile - The test file to run (optional)
 * @param {boolean} coverage - Whether to run with coverage (optional)
 * @returns {string} The formatted test results
 */
export function runTest(testFile = null, coverage = false) {
  // Use npx to ensure we're running the locally installed vitest
  let command = 'npx vitest run';
  
  if (coverage) {
    command += ' --coverage';
  }
  
  if (testFile) {
    command += ` ${testFile}`;
  }
  
  try {
    const results = execSync(command, { encoding: 'utf8' });
    return results;
  } catch (error) {
    return error.stdout || error.message;
  }
}

/**
 * Parses test results and returns statistics
 * @param {string} results - The raw test results 
 * @returns {Object} An object with test statistics
 */
export function parseTestResults(results) {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: ''
  };
  
  // Check if results are valid
  if (!results || typeof results !== 'string') {
    console.log('\nERROR: Invalid test results received');
    return stats;
  }
  
  const lines = results.split('\n');
  let statsFound = false;
  
  // Find the Test Files line which contains overall test counts
  const testFilesLine = lines.find(line => line.trim().startsWith('Test Files'));
  
  if (testFilesLine) {
    statsFound = true;
    // Extract failed, passed and skipped test files
    const failedFilesMatch = testFilesLine.match(/(\d+) failed/);
    const passedFilesMatch = testFilesLine.match(/(\d+) passed/);
    
    // Find the Tests line which contains individual test counts
    const testsLine = lines.find(line => line.trim().startsWith('Tests'));
    
    if (testsLine) {
      // Extract passed, failed and skipped tests
      const passedMatch = testsLine.match(/(\d+) passed/);
      const failedMatch = testsLine.match(/(\d+) failed/);
      const skippedMatch = testsLine.match(/(\d+) skipped/);
      const totalMatch = testsLine.match(/\((\d+)\)/);
      
      if (passedMatch) stats.passed = parseInt(passedMatch[1]);
      if (failedMatch) stats.failed = parseInt(failedMatch[1]);
      if (skippedMatch) stats.skipped = parseInt(skippedMatch[1]);
      
      // Extract total tests directly from the output if available
      if (totalMatch) {
        stats.total = parseInt(totalMatch[1]);
      } else {
        // Otherwise calculate from passed, failed, and skipped
        stats.total = stats.passed + stats.failed + stats.skipped;
      }
    } else {
      // Fallback to counting test files if we can't find the Tests line
      if (failedFilesMatch) stats.failed = parseInt(failedFilesMatch[1]);
      if (passedFilesMatch) stats.passed = parseInt(passedFilesMatch[1]);
      
      // Count individual test results
      lines.forEach(line => {
        if (line.includes('✓') && !line.includes('All tests passed')) {
          stats.passed++;
        } else if (line.includes('✗')) {
          stats.failed++;
        } else if (line.includes('↓')) {
          stats.skipped++;
        }
      });
      
      stats.total = stats.passed + stats.failed + stats.skipped;
    }
  } else {
    // If we can't find the expected format, try to count individual test results
    let individualTestsFound = false;
    
    lines.forEach(line => {
      // Count individual test results by examining each line
      if (line.trim().startsWith('✓') && !line.includes('All tests passed')) {
        stats.passed++;
        individualTestsFound = true;
      } else if (line.trim().startsWith('×') || line.trim().startsWith('✗')) {
        stats.failed++;
        individualTestsFound = true;
      } else if (line.trim().startsWith('↓')) {
        stats.skipped++;
        individualTestsFound = true;
      }
    });
    
    if (individualTestsFound) {
      statsFound = true;
      stats.total = stats.passed + stats.failed + stats.skipped;
    }
  }
  
  // Find duration
  const durationLine = lines.find(line => line.includes('Duration'));
  if (durationLine) {
    const durationMatch = durationLine.match(/Duration\s+(.+)/);
    if (durationMatch) stats.duration = durationMatch[1];
  }
  
  // Log statistics for debugging
  console.log('\nExtracted test statistics:');
  console.log(`  Total: ${stats.total}`);
  console.log(`  Passed: ${stats.passed}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Duration: ${stats.duration}`);
  
  // Mark if we found valid stats
  stats.statsFound = statsFound;
  
  return stats;
}

export default {
  formatTestResults,
  runTest,
  parseTestResults
}; 