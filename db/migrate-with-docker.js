#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', ...options });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

async function runMigration() {
  try {
    console.log('Starting MySQL container...');
    await runCommand('docker-compose', ['up', '-d', 'mysql'], { 
      cwd: path.join(__dirname, '..') 
    });
    
    console.log('Waiting for MySQL to be ready...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('Running Sequelize migration...');
    await runCommand('npm', ['run', 'migrate']);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();