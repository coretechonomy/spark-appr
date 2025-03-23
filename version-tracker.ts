import { chromium } from 'playwright';

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

  const version = rawVersion.split(' ')[0]; // Extract the version part

  console.log(`${rawVersion}`);
  console.log(`${version}`);
  console.log(`${releaseDate}`);

  // Close the browser
  await browser.close();
})();