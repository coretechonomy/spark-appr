import { chromium } from 'playwright';
import path from 'path';
import { promises as fs } from 'fs';

(async () => {
  const scriptDirectory = __dirname; // Set download directory to the script's directory

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });

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
  // await page.waitForNavigation();

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

  const version = rawVersion.split(' ')[0]; // Extract the version part

  console.log(`${rawVersion}`);
  console.log(`${version}`);
  console.log(`${releaseDate}`);

  // Set up download event listener
  const [download] = await Promise.all([
    page.waitForEvent('download'), // Wait for the download to start
    page.click('//*[@id="introduction"]/table/tbody/tr[1]/td[4]/a'), // Click the download link
  ]);

  // Wait for the download to complete and save it to the specified directory
  const downloadPath = await download.path();
  const fileName = download.suggestedFilename();
  const targetPath = path.join(scriptDirectory, fileName);

  // Copy the file to the target path
  await fs.copyFile(downloadPath, targetPath);
  // Remove the original file
  await fs.unlink(downloadPath);

  console.log(`Downloaded file path: ${targetPath}`);

  // Close the browser
  await browser.close();
})();