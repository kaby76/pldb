#!/usr/bin/env node

/**
 * PLDB Build Script
 *
 * This script builds the entire PLDB site from scratch.
 * It handles the correct build order and all dependencies.
 *
 * Usage: node build.js [--serve]
 *   --serve: Start a local server after building
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = __dirname
const SCROLL_CLI = path.join(ROOT, 'node_modules', 'scroll-cli', 'scroll.js')

// Build order matters: creators must be before lists
const SUBFOLDERS = ['blog', 'books', 'concepts', 'creators', 'features', 'lists', 'pages']

function run(cmd, cwd = ROOT) {
  console.log(`\n📂 [${path.basename(cwd)}] Running: ${cmd}`)
  try {
    execSync(cmd, { cwd, stdio: 'inherit' })
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`)
    throw err
  }
}

function runQuiet(cmd, cwd = ROOT) {
  console.log(`📂 [${path.basename(cwd)}] Running: ${cmd}`)
  try {
    execSync(cmd, { cwd, stdio: 'pipe' })
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`)
    throw err
  }
}

async function build() {
  const startTime = Date.now()

  console.log('🔨 PLDB Build Script')
  console.log('=' .repeat(50))

  // Step 1: Build parsers file
  console.log('\n📋 Step 1: Building parsers file...')
  run('node cli.js buildParsersFile')

  // Step 2: Patch scroll-cli for Windows compatibility (if needed)
  console.log('\n🔧 Step 2: Checking scroll-cli Windows compatibility...')
  patchScrollCliIfNeeded()

  // Step 3: Build root folder (generates pldb.json, measures.json)
  console.log('\n📋 Step 3: Building root folder...')
  run(`node "${SCROLL_CLI}" build`)

  // Step 4: Generate feature pages (requires measures.json from step 3)
  console.log('\n📋 Step 4: Generating feature pages...')
  const { Tables } = require('./Computer.js')
  Tables.writeAllFeaturePages()
  console.log('✅ Feature pages generated')

  // Step 5: Build all subfolders
  console.log('\n📋 Step 5: Building subfolders...')
  for (const dir of SUBFOLDERS) {
    const folderPath = path.join(ROOT, dir)
    if (fs.existsSync(folderPath)) {
      console.log(`\n  📁 Building ${dir}/...`)
      try {
        runQuiet(`node "${SCROLL_CLI}" build`, folderPath)
        console.log(`  ✅ ${dir}/ built successfully`)
      } catch (err) {
        console.error(`  ⚠️ ${dir}/ build had errors (continuing...)`)
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n' + '=' .repeat(50))
  console.log(`✅ Build complete in ${elapsed}s`)
}

function patchScrollCliIfNeeded() {
  // Check if we're on Windows and need to patch
  if (process.platform !== 'win32') {
    console.log('  Not on Windows, skipping patch')
    return
  }

  const rootParsersPath = path.join(ROOT, 'node_modules', 'scroll-cli', 'parsers', 'root.parsers')

  if (!fs.existsSync(rootParsersPath)) {
    console.log('  scroll-cli root.parsers not found, skipping patch')
    return
  }

  let content = fs.readFileSync(rootParsersPath, 'utf8')

  if (content.includes('Utils.posix.dirname')) {
    console.log('  Patching scroll-cli for Windows path compatibility...')
    content = content.replace(
      /Utils\.posix\.dirname\(this\.filePath\)/g,
      'require("path").dirname(this.filePath)'
    )
    content = content.replace(
      /Utils\.posix\.basename\(this\.filePath\)/g,
      'require("path").basename(this.filePath)'
    )
    fs.writeFileSync(rootParsersPath, content)
    console.log('  ✅ scroll-cli patched')

    // Also patch nested copy if exists
    const nestedPath = path.join(ROOT, 'node_modules', 'scroll-cli', 'node_modules', 'scroll-cli', 'parsers', 'root.parsers')
    if (fs.existsSync(nestedPath)) {
      let nestedContent = fs.readFileSync(nestedPath, 'utf8')
      nestedContent = nestedContent.replace(
        /Utils\.posix\.dirname\(this\.filePath\)/g,
        'require("path").dirname(this.filePath)'
      )
      nestedContent = nestedContent.replace(
        /Utils\.posix\.basename\(this\.filePath\)/g,
        'require("path").basename(this.filePath)'
      )
      fs.writeFileSync(nestedPath, nestedContent)
      console.log('  ✅ Nested scroll-cli patched')
    }
  } else {
    console.log('  scroll-cli already patched or uses compatible paths')
  }
}

function serve() {
  console.log('\n🌐 Starting local server...')
  console.log('   Open http://localhost:3000 in your browser')
  console.log('   Press Ctrl+C to stop\n')
  run('npx serve .')
}

// Main
const args = process.argv.slice(2)
const shouldServe = args.includes('--serve') || args.includes('-s')

build()
  .then(() => {
    if (shouldServe) {
      serve()
    } else {
      console.log('\n💡 To start a local server, run: npm run serve')
      console.log('   Or: node build.js --serve')
    }
  })
  .catch(err => {
    console.error('\n❌ Build failed:', err.message)
    process.exit(1)
  })
