import { test, expect } from '@playwright/test';

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:3000';

test.describe('Slot Conflict Handling', () => {
  test('should show error when booking already taken slot', async ({ page, request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const slotTime = tomorrow.toISOString();

    const response = await request.post(`${API_BASE}/bookings`, {
      data: {
        eventTypeId: 'consultation',
        guestName: 'First Guest',
        guestEmail: 'first@example.com',
        startTime: slotTime,
      },
    });

    expect(response.status()).toBe(201);

    await page.goto(`/book/consultation/schedule`);

    const slotButton = page.locator(`button:has-text("${String(tomorrow.getHours()).padStart(2, '0')}:00")`).first();
    if (await slotButton.isVisible()) {
      await slotButton.click();
      await page.getByRole('button', { name: /Продолжить/i }).click();

      await page.fill('input#name', 'Second Guest');
      await page.fill('input#email', 'second@example.com');
      await page.getByRole('button', { name: /Подтвердить запись/i }).click();

      await expect(page.getByText(/уже занято/i)).toBeVisible();
    }
  });

  test('should return 409 when trying to book occupied slot via API', async ({ request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(15, 0, 0, 0);

    const slotTime = tomorrow.toISOString();

    await request.post(`${API_BASE}/bookings`, {
      data: {
        eventTypeId: 'consultation',
        guestName: 'First Booker',
        guestEmail: 'first@test.com',
        startTime: slotTime,
      },
    });

    const conflictResponse = await request.post(`${API_BASE}/bookings`, {
      data: {
        eventTypeId: 'consultation',
        guestName: 'Second Booker',
        guestEmail: 'second@test.com',
        startTime: slotTime,
      },
    });

    expect(conflictResponse.status()).toBe(409);
    const body = await conflictResponse.json();
    expect(body.detail.code).toBe('SLOT_UNAVAILABLE');
  });
});