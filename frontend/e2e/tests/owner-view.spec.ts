import { test, expect } from '@playwright/test';

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:3000';

test.describe('Owner View', () => {
  test('should display bookings on owner page', async ({ page, request }) => {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 3);
    bookingDate.setHours(11, 0, 0, 0);

    const response = await request.post(`${API_BASE}/bookings`, {
      data: {
        eventTypeId: 'demo',
        guestName: 'Test Guest',
        guestEmail: 'testguest@example.com',
        startTime: bookingDate.toISOString(),
      },
    });

    expect(response.status()).toBe(201);

    await page.goto('/owner');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Предстоящие записи', { timeout: 10000 });

    await expect(page.getByText('Test Guest')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('testguest@example.com')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should show empty state when no bookings', async ({ page }) => {
    await page.goto('/owner');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Предстоящие записи', { timeout: 10000 });
    // Note: This test may fail if previous tests created bookings
    // The backend uses in-memory storage shared across tests in the same run
    await expect(page.getByText('Нет предстоящих записей')).toBeVisible({ timeout: 5000 });
  });
});