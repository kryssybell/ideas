import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/setup-guide-screenshots.json');
const BASE = 'http://localhost:3000';

const STEPS = [
  // Stage 1
  { index: 0,  id: '1.1',  title: 'Install Claude Desktop',                        stage: 'Foundation — Local Setup' },
  { index: 1,  id: '1.2',  title: 'Install Node.js',                                stage: 'Foundation — Local Setup' },
  { index: 2,  id: '1.3',  title: 'Create a GitHub account',                        stage: 'Foundation — Local Setup' },
  { index: 3,  id: '1.4',  title: 'Create a Vercel account',                        stage: 'Foundation — Local Setup' },
  { index: 4,  id: '1.5',  title: 'Create a Supabase account',                      stage: 'Foundation — Local Setup' },
  { index: 5,  id: '1.6',  title: 'Install Claude Code',                            stage: 'Foundation — Local Setup' },
  { index: 6,  id: '1.7',  title: 'Copy the QGS folder into Documents/Ai Files',   stage: 'Foundation — Local Setup' },
  { index: 7,  id: '1.8',  title: 'Tell Claude Code who you are',                   stage: 'Foundation — Local Setup' },
  { index: 8,  id: '1.9',  title: 'Run the setup command (npm install)',             stage: 'Foundation — Local Setup' },
  { index: 9,  id: '1.10', title: 'Run the sync command (npm run sync-product)',     stage: 'Foundation — Local Setup' },
  { index: 10, id: '1.11', title: 'Make the launcher double-clickable (Mac only)',  stage: 'Foundation — Local Setup' },
  { index: 11, id: '1.12', title: 'Open Claude Code using the launcher file',       stage: 'Foundation — Local Setup' },
  { index: 12, id: '1.13', title: 'Answer the first-time questions from Claude Code', stage: 'Foundation — Local Setup' },
  { index: 13, id: '1.14', title: 'Check that everything worked',                   stage: 'Foundation — Local Setup' },
  // Stage 2
  { index: 14, id: '2.1',  title: 'Install Homebrew — the Mac app installer',       stage: 'Save Your Work to GitHub' },
  { index: 15, id: '2.2',  title: 'Tell your Mac where to find Homebrew',           stage: 'Save Your Work to GitHub' },
  { index: 16, id: '2.3',  title: 'Install the GitHub connection tool (gh)',        stage: 'Save Your Work to GitHub' },
  { index: 17, id: '2.4',  title: 'Connect Terminal to your GitHub account',        stage: 'Save Your Work to GitHub' },
  { index: 18, id: '2.5',  title: 'Upload your QGS folders to GitHub',             stage: 'Save Your Work to GitHub' },
  // Stage 3
  { index: 19, id: '3.1',  title: 'Decide what your app will do',                  stage: 'Create Your First App' },
  { index: 20, id: '3.2',  title: 'Choose a short name for your app',              stage: 'Create Your First App' },
  { index: 21, id: '3.3',  title: 'Create the app folder from the template',       stage: 'Create Your First App' },
  { index: 22, id: '3.4',  title: "Update the app's name file",                    stage: 'Create Your First App' },
  { index: 23, id: '3.5',  title: 'Write what your app is about (Master Dossier)', stage: 'Create Your First App' },
  { index: 24, id: '3.6',  title: 'Copy the QGS rules into your new app',          stage: 'Create Your First App' },
  { index: 25, id: '3.7',  title: 'Add your app to the main list',                 stage: 'Create Your First App' },
  // Stage 4
  { index: 26, id: '4.1',  title: 'Log in to Supabase',                            stage: "Set Up Your App's Storage" },
  { index: 27, id: '4.2',  title: 'Create a storage space for your app',           stage: "Set Up Your App's Storage" },
  { index: 28, id: '4.3',  title: 'Save your secret connection keys',              stage: "Set Up Your App's Storage" },
  { index: 29, id: '4.4',  title: 'Set up the storage structure',                  stage: "Set Up Your App's Storage" },
  { index: 30, id: '4.5',  title: "Set up storage for your app's specific information", stage: "Set Up Your App's Storage" },
  { index: 31, id: '4.6',  title: 'Connect your app to its storage (local only)',  stage: "Set Up Your App's Storage" },
  // Stage 5
  { index: 32, id: '5.1',  title: "Upload your app's code to GitHub",              stage: 'Put Your App on the Internet' },
  { index: 33, id: '5.2',  title: 'Log in to Vercel',                              stage: 'Put Your App on the Internet' },
  { index: 34, id: '5.3',  title: 'Tell Vercel which GitHub folder to publish',    stage: 'Put Your App on the Internet' },
  { index: 35, id: '5.4',  title: 'Give Vercel your Supabase secret keys',         stage: 'Put Your App on the Internet' },
  { index: 36, id: '5.5',  title: 'Give Vercel your identity details',             stage: 'Put Your App on the Internet' },
  { index: 37, id: '5.6',  title: 'Press Deploy — go live!',                       stage: 'Put Your App on the Internet' },
  { index: 38, id: '5.7',  title: 'Open your live app and check it works',         stage: 'Put Your App on the Internet' },
  // Stage 6
  { index: 39, id: '6.1',  title: 'Every day: open Claude Code the right way',     stage: 'Keeping Going' },
  { index: 40, id: '6.2',  title: 'Every day: check what tasks are waiting',       stage: 'Keeping Going' },
  { index: 41, id: '6.3',  title: 'For each piece of work: follow the task steps', stage: 'Keeping Going' },
  { index: 42, id: '6.4',  title: 'Every time you publish: update the version number', stage: 'Keeping Going' },
  { index: 43, id: '6.5',  title: 'For each new app: repeat Stages 3, 4, and 5',  stage: 'Keeping Going' },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const results = [];

  // ── Welcome screen (before started) ─────────────────────────────────────────
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.removeItem('qgs-started');
    localStorage.removeItem('qgs-current-index');
    localStorage.removeItem('qgs-completed');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  const welcomeShot = await page.screenshot({ encoding: 'base64', type: 'png' });
  results.push({ id: 'welcome', title: 'Welcome Screen', stage: 'Welcome', dataUrl: `data:image/png;base64,${welcomeShot}` });
  process.stdout.write('✓ welcome — Welcome Screen\n');

  // ── Individual steps ─────────────────────────────────────────────────────────
  await page.evaluate(() => {
    localStorage.setItem('qgs-started', 'true');
    localStorage.setItem('qgs-current-index', '0');
  });

  for (const step of STEPS) {
    await page.evaluate((idx) => {
      localStorage.setItem('qgs-current-index', String(idx));
    }, step.index);

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const shot = await page.screenshot({ encoding: 'base64', type: 'png' });
    results.push({ id: step.id, title: step.title, stage: step.stage, dataUrl: `data:image/png;base64,${shot}` });
    process.stdout.write(`✓ ${step.id} — ${step.title}\n`);
  }

  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} screenshots to ${OUT}`);
}

run().catch(err => { console.error(err); process.exit(1); });
