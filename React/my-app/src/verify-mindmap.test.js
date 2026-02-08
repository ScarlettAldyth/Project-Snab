import { test, expect } from '@playwright/test';

test('verify mind map integration', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Click "Let the magic begin"
  await page.click('button.enter-button');
  
  // Wait for sidebar to be visible
  await page.waitForSelector('.sidebar');
  
  // Click on Mind Map tile
  // The Mind Map tile has label "Mind Map"
  await page.click('text=Mind Map');
  
  // Check if Mind Map component is rendered
  // It has a div with text "Central Idea"
  await expect(page.locator('text=Central Idea')).toBeVisible();
  
  // Take a screenshot
  await page.screenshot({ path: 'mind-map-verification.png' });
});
