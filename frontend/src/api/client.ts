import type {
  EventType,
  TimeSlot,
  Booking,
  CreateBookingPayload,
  NotFoundError,
  SlotUnavailableError,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw error;
  }
  return response.json();
}

export const api = {
  async listEventTypes(): Promise<EventType[]> {
    const response = await fetch(`${API_BASE}/event-types`);
    return handleResponse<EventType[]>(response);
  },

  async getEventType(eventTypeId: string): Promise<EventType | NotFoundError> {
    const response = await fetch(`${API_BASE}/event-types/${eventTypeId}`);
    return handleResponse<EventType | NotFoundError>(response);
  },

  async getAvailableSlots(eventTypeId: string): Promise<TimeSlot[]> {
    const response = await fetch(`${API_BASE}/availability/${eventTypeId}`);
    return handleResponse<TimeSlot[]>(response);
  },

  async createBooking(payload: CreateBookingPayload): Promise<Booking | SlotUnavailableError> {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<Booking | SlotUnavailableError>(response);
  },

  async listUpcomingBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_BASE}/bookings`);
    return handleResponse<Booking[]>(response);
  },
};