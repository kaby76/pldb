# PLDB - A Programming Language Database

[![Build Status](https://github.com/breck7/pldb/workflows/Tests/badge.svg)](https://github.com/breck7/pldb/actions)

PLDB is a comprehensive public domain database containing over 135,000 facts about more than 5,000 programming languages. The project includes both the complete dataset and the website code for [pldb.io](https://pldb.io).

## 🌟 Key Features

- **Rich Dataset**: Extensive information about programming languages, from high-level formats to binary specifications
- **Multiple Export Formats**: Access the complete dataset in CSV, TSV, or JSON format
- **Public Domain**: All data and code is freely available for any use
- **Regular Updates**: Actively maintained with version control and release notes
- **Web Interface**: Browse the data through an intuitive web interface at [pldb.io](https://pldb.io)

## 📊 Data Downloads

Access the complete dataset in your preferred format:

- **CSV**: [pldb.io/pldb.csv](https://pldb.io/pldb.csv)
- **TSV**: [pldb.io/pldb.tsv](https://pldb.io/pldb.tsv)
- **JSON**: [pldb.io/pldb.json](https://pldb.io/pldb.json)

Full documentation for the data formats is available at [pldb.io/csv.html](https://pldb.io/csv.html)

## 🚀 Local Development

### Prerequisites

- Node.js (v18 or later recommended)
- npm
- cloc (optional, for line counting): `npm i -g cloc`

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/breck7/pldb
cd pldb

# Install dependencies
npm install
```

### Building the Site

The build process has multiple steps that must be run in order:

```bash
# 1. Build the parsers file
node cli.js buildParsersFile

# 2. Build the root folder (generates pldb.json, measures.json, and root HTML files)
node ./node_modules/scroll-cli/scroll.js build

# 3. Generate feature pages (requires measures.json from step 2)
node -e "const {Tables} = require('./Computer.js'); Tables.writeAllFeaturePages()"

# 4. Build all subfolders (order matters: creators before lists)
for dir in blog books concepts creators features lists pages; do
  echo "Building $dir..."
  (cd "$dir" && node ../node_modules/scroll-cli/scroll.js build)
done
```

**Build order dependencies:**
- `creators/` must be built before `lists/` (lists needs `creators.json`)
- Feature `.scroll` files must be generated (step 3) before building `features/`

**Note**: The `npm run build` command may not work correctly on all platforms due to shell piping issues. Use the manual steps above for reliable builds.

### Running a Local Server

After building, serve the site locally:

```bash
npx serve .
```

Then open http://localhost:3000 in your browser.

### Windows/MSYS2 Compatibility

If building on Windows with MSYS2, you need to patch `scroll-cli` for path compatibility. Edit `node_modules/scroll-cli/parsers/root.parsers` and change:

```javascript
// Change these lines:
get folderPath() {
  return Utils.posix.dirname(this.filePath) + "/"
}
get filename() {
  return Utils.posix.basename(this.filePath)
}

// To:
get folderPath() {
  return require("path").dirname(this.filePath) + "/"
}
get filename() {
  return require("path").basename(this.filePath)
}
```

Also apply the same change to `node_modules/scroll-cli/node_modules/scroll-cli/parsers/root.parsers` if it exists.

### Other Commands

```bash
# Run tests
npm run test

# Format code before committing
npm run format
```

## 📁 Repository Structure

The most important components of the repository:

- `concepts/`: Contains the ScrollSet (individual files for each concept)
- `code/measures.parsers`: Contains the Parsers (schema) for the ScrollSet
- View detailed language statistics at [pldb.io/pages/about.html](https://pldb.io/pages/about.html)

## 🏆 Rankings

PLDB includes a sophisticated ranking system for programming languages based on five key metrics:

- Number of estimated users
- Foundation score (languages built using this language)
- Estimated job opportunities
- Language influence
- Available measurements

Learn more about the ranking algorithm at [pldb.io/pages/the-rankings-algorithm.html](https://pldb.io/pages/the-rankings-algorithm.html)

## 📜 Version History

Latest major releases:

- **9.0.0** (May 2024): Migrated to Scroll 84
- **8.0.0** (March 2023): Upgraded to TrueBase 9
- See [Release Notes](https://pldb.io/releaseNotes.html) for complete history

## 🤝 Contributing

Contributions are welcome! PLDB is designed for two main audiences:

1. **Programming Language Creators**: Use our organized data to make informed design decisions
2. **Programming Language Users**: Get data-driven insights about the programming language ecosystem

## 📚 Resources

- **Main Website**: [pldb.io](https://pldb.io)
- **About Page**: [pldb.io/pages/about.html](https://pldb.io/pages/about.html)
- **Acknowledgements**: [pldb.io/pages/acknowledgements.html](https://pldb.io/pages/acknowledgements.html)

## 📖 Citation

This project is dedicated to the public domain. When using PLDB, we appreciate attribution but it's not required. All sources are listed at [pldb.io/pages/acknowledgements.html](https://pldb.io/pages/acknowledgements.html).

## 🌐 Mirrors

The primary site is hosted at [pldb.io](https://pldb.io) via ScrollHub. For offline access or redundancy, you can clone the repository and build locally:

```bash
git clone https://github.com/breck7/pldb.git
cd pldb
git pull  # To keep updated
```
