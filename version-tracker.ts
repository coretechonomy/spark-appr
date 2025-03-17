import { chromium } from 'playwright';
import { Octokit } from '@octokit/rest';

export let rawVersion: string = '';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Open new page
  const page = await context.newPage();

  // Go to the login page
  await page.goto(process.env.DOWNLOAD_PAGE_URL || '');

  // Fill in the login form
  await page.fill('input[name="username"]', process.env.USERNAME || '');
  await page.fill('input[name="password"]', process.env.PASSWORD || '');

  // Click the login button
  await page.click('button[type="submit"]');

  // Wait for navigation after login
//   await page.waitForNavigation();

  // Go to the page with the table
  await page.goto(process.env.DOWNLOAD_PAGE_URL || '');

  // Grab the value from the table using xpath
  const rawVersion = await page.$eval(
    '//*[@id="introduction"]/table/tbody/tr[1]/td[2]',
    (element) => element.textContent?.trim() || ''
  );

  const releaseDate = await page.$eval(
    '//*[@id="introduction"]/table/tbody/tr[1]/td[3]',
    (element) => element.textContent?.trim() || ''
  );

  console.log(`${rawVersion}`);
  console.log(`${releaseDate}`);

  // Close the browser
  await browser.close();
})();

const token = process.env.GH_PAT; // GitHub token with repo permissions
const owner = 'coretechonomy';
const repo = 'version-tracker';

if (!token) {
  throw new Error('GH_PAT environment variable is not set');
}

const octokit = new Octokit({
  auth: token,
});

async function createTag(version: string) {
  const { data: latestCommit } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: 'main',
  });

  await octokit.git.createTag({
    owner,
    repo,
    tag: version,
    message: `Release ${version}`,
    object: latestCommit.sha,
    type: 'commit',
  });

  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${version}`,
    sha: latestCommit.sha,
  });

  console.log(`Tag ${version} created successfully`);
}

(async () => {
  try {
    while (!rawVersion) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const version = rawVersion.split(' ')[0]; // Extract the version part
    await createTag(version);
  } catch (error) {
    console.error(error);
  }
})();