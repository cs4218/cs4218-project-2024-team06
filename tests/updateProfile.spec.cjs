import { test, expect } from '@playwright/test';

test('updateProfile', async ({ page }) => {
    await page.goto('http://localhost:3000/');
});