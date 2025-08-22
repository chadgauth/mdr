#!/usr/bin/env node

/**
 * Build validation script for MDR project
 * This script validates that no dead code exists before building
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const BUNDLE_ANALYSIS_FILE = path.join(PROJECT_ROOT, 'bundle-analysis.json');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function runCommand(command, description) {
  log(`Running: ${description}...`);
  try {
    const output = execSync(command, { 
      cwd: PROJECT_ROOT, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.stderr || error.message 
    };
  }
}

async function validateTypeScript() {
  logSection('TypeScript Validation');
  
  const result = await runCommand(
    'npx tsc --noEmit --strict',
    'Checking TypeScript compilation with strict mode'
  );
  
  if (!result.success) {
    logError('TypeScript validation failed:');
    console.log(result.output);
    return false;
  }
  
  logSuccess('TypeScript validation passed');
  return true;
}

async function validateESLint() {
  logSection('ESLint Validation');
  
  const result = await runCommand(
    'npx eslint . --max-warnings=0 --format=compact',
    'Running ESLint with zero warnings tolerance'
  );
  
  if (!result.success) {
    logError('ESLint validation failed:');
    console.log(result.output);
    return false;
  }
  
  logSuccess('ESLint validation passed');
  return true;
}

async function validateDeadCode() {
  logSection('Dead Code Detection');
  
  const result = await runCommand(
    'npx ts-prune --error',
    'Scanning for unused exports with ts-prune'
  );
  
  if (!result.success) {
    logError('Dead code detected:');
    console.log(result.output);
    return false;
  }
  
  logSuccess('No dead code found');
  return true;
}

async function analyzeBundleSize() {
  logSection('Bundle Analysis');
  
  // Set environment variable for bundle analysis
  process.env.ANALYZE_BUNDLE = 'true';
  
  // Clean previous analysis
  if (fs.existsSync(BUNDLE_ANALYSIS_FILE)) {
    fs.unlinkSync(BUNDLE_ANALYSIS_FILE);
  }
  
  const result = await runCommand(
    'npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /tmp/bundle.js --sourcemap-output /tmp/bundle.map',
    'Creating bundle for analysis'
  );
  
  if (!result.success) {
    logError('Bundle creation failed:');
    console.log(result.output);
    return false;
  }
  
  // Analyze bundle if analysis file was created
  if (fs.existsSync(BUNDLE_ANALYSIS_FILE)) {
    try {
      const bundleData = JSON.parse(fs.readFileSync(BUNDLE_ANALYSIS_FILE, 'utf8'));
      const uniqueModules = new Set(bundleData.map(m => m.relativePath));
      
      log(`📊 Bundle contains ${uniqueModules.size} unique modules`);
      
      // Check for suspicious modules
      const suspiciousModules = [...uniqueModules].filter(module => 
        module.includes('test') || 
        module.includes('spec') ||
        module.includes('story') ||
        module.includes('mock')
      );
      
      if (suspiciousModules.length > 0) {
        logWarning(`Found ${suspiciousModules.length} potentially unnecessary modules:`);
        suspiciousModules.forEach(module => log(`  - ${module}`, colors.yellow));
      }
      
      // Clean up analysis file
      fs.unlinkSync(BUNDLE_ANALYSIS_FILE);
      
      logSuccess('Bundle analysis completed');
      return true;
    } catch (error) {
      logWarning(`Could not analyze bundle: ${error.message}`);
      return true; // Don't fail the build for analysis issues
    }
  } else {
    logWarning('Bundle analysis file not generated');
    return true;
  }
}

async function runTests() {
  logSection('Running Tests');
  
  const result = await runCommand(
    'npm test -- --coverage --watchAll=false',
    'Running Jest tests with coverage'
  );
  
  if (!result.success) {
    logError('Tests failed:');
    console.log(result.output);
    return false;
  }
  
  logSuccess('All tests passed');
  return true;
}

async function main() {
  log(`${colors.bold}${colors.blue}MDR Build Validation${colors.reset}`);
  log('This script validates the codebase for dead code and build readiness.\n');
  
  const validations = [
    { name: 'TypeScript', fn: validateTypeScript },
    { name: 'ESLint', fn: validateESLint },
    { name: 'Dead Code Detection', fn: validateDeadCode },
    { name: 'Bundle Analysis', fn: analyzeBundleSize },
    { name: 'Tests', fn: runTests }
  ];
  
  const results = [];
  
  for (const validation of validations) {
    const success = await validation.fn();
    results.push({ name: validation.name, success });
    
    if (!success && process.env.FAIL_FAST !== 'false') {
      logError(`Build validation failed at: ${validation.name}`);
      process.exit(1);
    }
  }
  
  // Summary
  logSection('Validation Summary');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED`);
    }
  });
  
  if (passed === total) {
    log(`\n${colors.bold}${colors.green}🎉 All validations passed! Build is ready.${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.bold}${colors.red}💥 ${total - passed} validation(s) failed. Fix issues before building.${colors.reset}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    logError(`Build validation failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateTypeScript,
  validateESLint,
  validateDeadCode,
  analyzeBundleSize,
  runTests
};