import { test, expect } from '@playwright/test';

test.describe('Guest Flow', () => {
  test('should complete booking successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Book a Meeting');

    const eventTypeCards = page.locator('[class*="Card"]');
    await expect(eventTypeCards.first()).toBeVisible();

    await page.getByRole('link', { name: /View Availability/i }).first().click();

    await expect(page.locator('h1')).not.toContainText('Book a Meeting');

    const availableSlot = page.locator('button:has-text("09:00"), button:has-text("10:00"), button:has-text("11:00")').first();
    await availableSlot.click();

    await page.getByRole('button', { name: /Continue to Booking/i }).click();

    await expect(page.locator('h2')).toContainText('Complete Your Booking');

    await page.fill('input#name', 'John Doe');
    await page.fill('input#email', 'john@example.com');

    await page.getByRole('button', { name: /Confirm Booking/i }).click();

    await expect(page.locator('h2')).toContainText('Booking Confirmed');
  });

  test('should display event types on home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Book a Meeting');

    await expect(page.getByText('30-min Consultation')).toBeVisible();
    await expect(page.getByText('Product Demo')).toBeVisible();
    await expect(page.getByText('Strategy Session')).toBeVisible();
  });

  test('should navigate to availability page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Availability/i }).first().click();

    await expect(page).not.toHaveURL('/');
  });
});