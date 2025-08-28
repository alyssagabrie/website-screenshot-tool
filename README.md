# website-screenshot-tool
Screenshot Capture Tool (shot.js)

This script uses Puppeteer to capture full-page screenshots of event websites from a CSV or TXT list. Screenshots are saved into the nike-archive folder by default.

1. Prepare Your Input
Option A: CSV (recommended)

Export your Google Sheet as CSV (sites.csv).

The file should contain columns:

Company

Contract #

Website Link

Example:

Company,Contract #,Website Link
NovoNordisk,17293,https://www.eventgifthub.com/nacdsummit2024

Option B: Plain URLs

Create a urls.txt with one URL per line.

Example:

https://www.eventgifthub.com/17293-nacdsummit2024
https://www.eventgifthub.com/17290-bluecorefall2024

2. Run the Script

From PowerShell or terminal, run:

node shot.js


By default, it looks for sites.csv → sites.tsv → urls.txt.

To specify a file explicitly:

node shot.js nike-archive "sites.csv"

3. Output

Screenshots are saved in the nike-archive folder.

Filenames follow this pattern:

<Contract#>-<Company>.png if Contract # and Company are present.

Otherwise, fallback to a URL-based filename.

4. Tips

Always close the CSV file in Excel before running (OneDrive/Excel can lock it).

If nothing happens, check the console message:

Using input: shows which file the script is reading.

You can delete or overwrite sites.csv each run — the script only reads it.

Keep your headers consistent: Company, Contract #, Website Link.

5. Requirements

Node.js
 (v18+)

Puppeteer

npm install puppeteer
