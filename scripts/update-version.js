#!/usr/bin/env node

/**
 * Auto-update version.json during build
 * This script runs during npm build and ensures every deployment
 * gets a unique version number for automatic update detection
 *
 * Usage: node scripts/update-version.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Generate version identifiers
  const timestamp = Date.now();
  const buildTime = new Date().toISOString();
  
  let gitSha = 'dev';
  try {
    gitSha = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'] 
    }).trim();
  } catch (e) {
    console.log('⚠ Git SHA not available (running outside git repo)');
  }

  const versionString = `${gitSha}-${timestamp}`;
  const environment = process.env.VERCEL ? 'vercel' : process.env.NODE_ENV || 'development';

  // Create version object
  const versionData = {
    v: versionString,
    timestamp: timestamp,
    deployed: buildTime,
    environment: environment,
    git: gitSha,
    platform: process.platform,
  };

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write version.json
  const versionFile = path.join(publicDir, 'version.json');
  fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

  // Print info
  console.log('\n✓ Version file generated successfully');
  console.log(`  Location: ${versionFile}`);
  console.log(`  Version: ${versionString}`);
  console.log(`  Timestamp: ${timestamp} (${buildTime})`);
  console.log(`  Environment: ${environment}`);
  console.log(`  Git SHA: ${gitSha}`);
  console.log('');

  // Verify file was created
  if (fs.existsSync(versionFile)) {
    const content = fs.readFileSync(versionFile, 'utf-8');
    const parsed = JSON.parse(content);
    console.log('✓ File verified and readable');
    process.exit(0);
  } else {
    console.error('✗ Failed to create version.json');
    process.exit(1);
  }

} catch (error) {
  console.error('✗ Error generating version file:', error.message);
  process.exit(1);
}
