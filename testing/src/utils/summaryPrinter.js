import chalk from 'chalk';

/**
 * Generates a horizontal line for table display
 * @param {number} width - Width of the line
 * @returns {string} - The horizontal line
 */
function generateLine(width = 80) {
  return '='.repeat(width);
}

/**
 * Formats and prints overall test summary
 * @param {Object} stats - Test statistics object
 */
export function printSummary(stats) {
  console.log('\n' + generateLine());
  console.log(chalk.bold('TEST SUMMARY'));
  console.log(generateLine());
  
  // If we have valid stats values or explicitly know stats were found
  if (stats && (stats.statsFound || stats.total > 0 || stats.passed > 0 || stats.failed > 0)) {
    console.log(`${chalk.bold('Total Tests:')} ${stats.total}`);
    console.log(`${chalk.bold('Passed:')} ${chalk.green(stats.passed)}`);
    console.log(`${chalk.bold('Failed:')} ${stats.failed > 0 ? chalk.red(stats.failed) : stats.failed}`);
    console.log(`${chalk.bold('Skipped:')} ${chalk.yellow(stats.skipped)}`);
    console.log(`${chalk.bold('Duration:')} ${stats.duration || 'Not available'}`);
    
    console.log(generateLine());
    
    if (stats.failed === 0) {
      console.log(chalk.green.bold('✓ All tests passed!'));
    } else {
      console.log(chalk.red.bold(`✗ ${stats.failed} test${stats.failed !== 1 ? 's' : ''} failed.`));
    }
  } else {
    // Fallback if stats parsing failed
    console.log(`${chalk.bold('Total Tests:')} ${chalk.yellow('Test results could not be parsed')}`);
    console.log(`${chalk.bold('Duration:')} ${stats.duration || 'Unknown'}`);
    
    console.log(generateLine());
    console.log(chalk.yellow.bold('⚠ Test summary could not be generated. Please check test output for details.'));
  }
  
  console.log(generateLine() + '\n');
}

/**
 * Creates a simple progress bar
 * @param {number} percent - Percentage completion
 * @param {number} width - Width of the progress bar
 * @returns {string} - A formatted progress bar
 */
export function progressBar(percent, width = 40) {
  const filled = Math.round(width * (percent / 100));
  const empty = width - filled;
  
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  let barColor = chalk.green;
  if (percent < 70) barColor = chalk.yellow;
  if (percent < 40) barColor = chalk.red;
  
  return `${barColor(filledBar)}${emptyBar} ${percent}%`;
}

/**
 * Prints a coverage summary
 * @param {Object} coverage - Coverage statistics
 */
export function printCoverageSummary(coverage) {
  if (!coverage) return;
  
  console.log('\n' + generateLine());
  console.log(chalk.bold('COVERAGE SUMMARY'));
  console.log(generateLine());
  
  const { lines, statements, functions, branches } = coverage;
  
  console.log(`${chalk.bold('Lines:')}      ${progressBar(lines.pct)}`);
  console.log(`${chalk.bold('Statements:')} ${progressBar(statements.pct)}`);
  console.log(`${chalk.bold('Functions:')}  ${progressBar(functions.pct)}`);
  console.log(`${chalk.bold('Branches:')}   ${progressBar(branches.pct)}`);
  
  console.log(generateLine() + '\n');
}

export default {
  printSummary,
  printCoverageSummary,
  progressBar
}; 