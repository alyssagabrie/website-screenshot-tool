# Website Screenshot Tool

A Node.js script that automatically captures full-page screenshots of websites using Puppeteer. Perfect for archiving web pages, creating visual documentation, or bulk screenshot generation.

## What the Script Does

The `shot.js` script:
- Reads URLs from CSV, TSV, or TXT files
- Automatically captures full-page screenshots of each website
- Generates organized filenames based on company/contract information
- Saves screenshots to a specified output directory
- Provides progress tracking and error handling

## Requirements

- **Node.js** (version 14 or higher)
- **Puppeteer** (automatically installed via npm)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Input File Preparation

The script supports three input file formats:

### 1. CSV File (`sites.csv`)

Use this format when you have company and contract information:

```csv
Company,Contract #,Website Link
NovoNordisk,17293,https://www.eventgifthub.com/nacdsummit2024
Bluecore Inc.,17290,https://www.eventgifthub.com/bluecorefall2024
Procore,17285,https://www.eventgifthub.com/17285-nike-event
```

**Supported column names:**
- Company: `Company`, `Company Name`, `Name`
- Contract: `Contract #`, `Contract`, `Contract Number`, `Contract No`
- URL: `Website Link`, `Website`, `Link`, `URL`, `Onsite`

### 2. TSV File (`sites.tsv`)

Same format as CSV but uses tabs as separators:

```tsv
Company	Contract #	Website Link
NovoNordisk	17293	https://www.eventgifthub.com/nacdsummit2024
Bluecore Inc.	17290	https://www.eventgifthub.com/bluecorefall2024
```

### 3. Text File (`urls.txt`)

Simple list of URLs (one per line):

```
https://www.eventgifthub.com/17260-nike-event
https://www.eventgifthub.com/smcvirtualtechstyleday
https://example.com
```

## How to Run the Script

### Default Usage

The script automatically detects input files and uses default settings:

```bash
node shot.js
```

This will:
- Look for `sites.csv`, `sites.tsv`, or `urls.txt` in the current directory
- Save screenshots to a `nike-archive` folder
- Use the first input file found

### Explicit Arguments

Specify custom output directory and input file:

```bash
node shot.js [output-directory] [input-file]
```

**Examples:**
```bash
# Save to custom folder with CSV input
node shot.js my-screenshots sites.csv

# Save to custom folder with text file input
node shot.js archive urls.txt

# Save to current directory
node shot.js . sites.csv
```

## Output and Filenames

### Screenshot Location
Screenshots are saved to the specified output directory (default: `nike-archive/`).

### Filename Generation

**For CSV/TSV files with company/contract data:**
- Format: `[ContractNumber]-[CompanyName].png`
- Example: `17293-NovoNordisk.png`

**For simple URL lists:**
- Format: `[sanitized-url].png`
- Example: `www.eventgifthub.com_17260-nike-event.png`

**Filename sanitization:**
- Special characters are replaced with underscores
- Spaces are preserved but normalized
- Maximum length: 180 characters
- Invalid filename characters are removed

## Common Tips

### Performance
- The script processes URLs sequentially to avoid overwhelming servers
- Each page waits for network activity to settle before capturing
- 60-second timeout per page

### Error Handling
- Failed screenshots are logged but don't stop the process
- Check the console output for any failed URLs
- Common issues: timeouts, invalid URLs, or blocked access

### Browser Settings
- Runs in headless mode (no visible browser window)
- Full-page screenshots capture entire page content
- Automatically scrolls to top before capturing

### File Management
- Output directory is created automatically if it doesn't exist
- Existing files with the same name will be overwritten
- Use unique output directories for different batches

## Troubleshooting

**"No input file found" error:**
- Ensure you have `sites.csv`, `sites.tsv`, or `urls.txt` in the project directory
- Or specify the input file explicitly as the second argument

**"No rows/URLs found in input" error:**
- Check that your input file has valid data
- For CSV/TSV: ensure proper column headers and at least one data row
- For TXT: ensure URLs are on separate lines and not empty

**Screenshot failures:**
- Some websites may block automated access
- Check if URLs are accessible in a regular browser
- Consider adding delays or user-agent headers if needed

**Puppeteer installation issues:**
- Run `npm install` to ensure all dependencies are installed
- On some systems, you may need additional system dependencies for Chromium

## Example Workflow

1. **Prepare your data:**
   ```csv
   Company,Contract #,Website Link
   Test Company,12345,https://example.com
   ```

2. **Run the script:**
   ```bash
   node shot.js
   ```

3. **Check results:**
   - Screenshots saved in `nike-archive/` folder
   - Console shows progress and results summary
   - Filename: `12345-Test Company.png`
