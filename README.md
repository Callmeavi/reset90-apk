# Reset 90

A personal 90-day habit tracker with daily done/missed check-ins, reflections, a challenge calendar and progress analytics. Built with plain HTML, CSS and JavaScript. No account, database, build process or backend is required.

## Dependencies

### Required to Run

| Dependency | Purpose | Installation |
| --- | --- | --- |
| A current Chrome, Edge, Firefox or Safari browser | Runs the app and stores your progress | Install or update your preferred browser |
| JavaScript enabled | Check-ins, charts, settings and backups | Normally enabled by default |
| Browser local storage available | Saves your challenge between visits | Use a regular browser profile and allow site storage |
| The app files listed below | Interface and tracking logic | Copy the entire `reset90` folder |

There are **no required npm packages, pip packages, API keys or paid services**. You do not need to run `npm install`.

### Internet-Loaded Visual Assets

| Asset | Source | Behavior Without Internet |
| --- | --- | --- |
| Lucide icons, pinned to version `0.468.0` | `https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js` | Icons may be missing, including icons on check-in buttons; button labels remain available to assistive technology |
| DM Sans and DM Serif Display fonts | `https://fonts.googleapis.com` and `https://fonts.gstatic.com` | Browser fallback fonts are used |
| Nature photograph | `https://images.unsplash.com` | The banner photograph may be missing |

These services receive normal asset requests from your browser; the app does not send them your habit entries or reflections. Core tracking uses local files, but this is **not a fully offline-packaged app**: external assets are not bundled, and cached assets are not guaranteed to be available offline.

### Optional Tools

| Tool | When You Need It |
| --- | --- |
| Python 3 | To serve the app locally using the built-in HTTP server; no Python packages needed |
| Node.js 22 LTS or newer, with npm | To run the development tests and JavaScript syntax checks; not needed for normal use |
| A static hosting service | To access the app from a phone or another computer using a website URL |

## Project Files

```text
reset90/
	index.html       App entry point
	styles.css       Responsive layout and appearance
	core.js          Challenge dates, state validation and analytics
	app.js           User interface, check-ins, local saving and backups
	core.test.cjs    Automated calculation and validation tests
	package.json     Optional test and syntax-check commands
	README.md        This guide
```

The first four files must stay together in the same folder. The other files are useful for documentation and development, but are not needed by the browser.

## Run on Your Computer

### Option 1: Open Directly

1. Copy or extract the `reset90` folder anywhere on your computer.
2. Double-click `index.html`, or open it with your preferred browser.
3. Open **Challenge settings**, choose a start date and adjust your habits.

This needs no terminal or installation. Browser storage for directly opened files varies by browser, so export backups regularly. Keeping the same browser and file location helps avoid unexpectedly seeing an empty challenge.

### Option 2: Local Server

This gives the app a consistent web address and more predictable storage behavior. Install Python 3 if you do not already have it, then open a terminal inside the `reset90` folder.

**Windows PowerShell or Command Prompt:**

```powershell
cd "C:\path\to\reset90"
py -m http.server 8080 --bind 127.0.0.1
```

If the `py` launcher is unavailable but Python is installed, use `python -m http.server 8080 --bind 127.0.0.1` instead.

**macOS or Linux:**

```bash
cd "/path/to/reset90"
python3 -m http.server 8080 --bind 127.0.0.1
```

Open **http://127.0.0.1:8080** in your browser. Keep the terminal running while using the app. Press `Ctrl+C` in that terminal to stop the server.

If port 8080 is busy, substitute 8081 in the command and URL. Each hostname, protocol and port has separate browser storage: consistently use the same URL. Moving from a directly opened file to a local server also requires exporting and importing your progress.

## Run on a Phone or Publish Online

Upload `index.html`, `styles.css`, `core.js` and `app.js` together to a static hosting service such as GitHub Pages, Netlify or Cloudflare Pages. Configure the uploaded folder as the site's root; no build command is required. Open the resulting HTTPS URL in a current mobile or desktop browser.

The `127.0.0.1` server address above works only on the computer running it, not on your phone. Use a static host for convenient access across devices. The Python server is for local use, not production hosting.

Hosting the app does **not** add accounts, shared storage or automatic synchronization. Each browser and device has its own challenge data. Do not upload your exported backup JSON files to a public site or repository.

## Move Your Progress to Another Device

1. On the original browser, open **Challenge settings > Export backup**.
2. Transfer the downloaded `reset90-backup-YYYY-MM-DD.json` file privately to the other device.
3. Open the tracker on that device.
4. Open **Challenge settings > Import backup** and select the JSON file.
5. Confirm replacement of the destination browser's current challenge.

Import replaces the current challenge; it does not merge two devices' check-ins. Export the destination's existing data first if you need to keep it. Copying the app folder alone does not copy browser-stored progress.

## Daily Tracking

- Ten editable starter habits: 10,000 steps, skincare, haircare, focused work, no added sugar, no junk food, reading, hydration, sleep and mindfulness.
- Mark each habit done or missed. Selecting the same status again clears it. Blank check-ins stay separate from missed habits.
- Use the day arrows or the 90-day journey to revisit any day. Future days are visible but cannot be logged yet.
- Add a private daily reflection. Each change is saved in this browser's local storage.
- Change your challenge start date and add, edit or delete habits in settings. Changes apply to the whole challenge; adding or deleting habits changes historical percentages.

## Analytics

Completion is done habits divided by all habit opportunities on elapsed challenge days. Unlogged habits are not labeled missed, but do not count as complete. Future days are excluded. A perfect day means every habit was marked done. The current unfinished day does not break yesterday's perfect-day streak; an unfinished past day does. Weekly charts use challenge weeks, not calendar weeks. Journey milestones count days with at least one check-in, not perfect days.

## Data and Privacy

Data stays in this browser profile on this device under the local-storage key `reset90.challenge.v1`. There is no cloud sync, login, server storage, step-counter integration or automatic verification. Check-ins are manual.

Export backups regularly, especially before changing browsers, devices, file locations or hosting addresses. Clearing site data can erase progress. Private browsing can discard it when the session ends. Backups contain your notes and habits in readable JSON; keep them somewhere private. The app has no password protection or encryption.

If browser storage is unavailable or full, the app warns that changes are only in memory. Export a backup before closing the page.

Goals are editable personal choices, not medical advice. Set nutrition, movement, sleep and care goals that fit your needs.

## Development Checks

With Node.js 22 LTS or newer installed, open a terminal in the `reset90` folder:

```bash
npm test
npm run check
```

No `npm install` is needed. Tests use Node's built-in test runner. `npm test` checks status counting, date boundaries, streaks, completion calculations and backup validation. `npm run check` checks JavaScript syntax. These checks do not replace interactive browser testing.

## Troubleshooting

| Problem | What to Check |
| --- | --- |
| Page looks unstyled or check-ins do not work | Keep the four app files together; enable JavaScript and use a current browser |
| Icons, fonts or photograph are missing | Check internet access and whether the listed asset domains are blocked |
| Progress appears missing | Use the original browser profile and exact URL or file location; restore your JSON backup if necessary |
| Changes are not saved | Allow browser site storage, leave private browsing and export a backup before closing |
| A future day cannot be marked | Future check-ins open on their date; check your device clock and challenge start date |
| Import is rejected | Use an unchanged JSON backup exported by this app; files must be valid and no larger than 2 MB |
| `py` or `python3` is not recognized | Install Python 3 or use the direct-open option |
| `npm` is not recognized | Install Node.js only if you need development checks; it is not required to use the app |