export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  startTime: string;
}

export interface NotFoundError {
  code: "NOT_FOUND";
  message: string;
}

export interface SlotUnavailableError {
  code: "SLOT_UNAVAILABLE";
  message: string;
}