const { spawn } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/unit/normalizers.test.js',
  'tests/unit/otp.test.js',
  'tests/unit/sessions.test.js',
  'tests/e2e/auth.test.js',
  'tests/e2e/booking.test.js'
];

async function runTestFile(file) {
  return new Promise((resolve, reject) => {
    console.log(`\n========================================`);
    console.log(`RUNNING: ${file}`);
    console.log(`========================================\n`);

    const child = spawn(process.execPath, ['--test', file], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test file ${file} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const start = Date.now();
  console.log('🚀 Starting Comprehensive Delhast Test Suite (Sequential Isolation)...\n');

  for (const file of testFiles) {
    try {
      await runTestFile(file);
    } catch (err) {
      console.error(`\n❌ [FAILED] ${file}:`, err.message);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n========================================`);
  console.log(`🎉 ALL 5 TEST SUITES PASSED IN ${duration}s!`);
  console.log(`========================================\n`);
  process.exit(0);
}

main();
