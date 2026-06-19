import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@server("http://localhost:8000", "Local development")
namespace BookingCalendar;

/** Event type model */
model EventType {
  id: int32;
  title: string;
  description: string;
  duration_minutes: int32;
}

/** Time slot with start and end */
model Slot {
  start_time: utcDateTime;
  end_time: utcDateTime;
}

/** Booking creation request */
model BookingCreate {
  event_type_id: int32;
  start_time: utcDateTime;
  guest_name: string;
  guest_email: string;
}

/** Booking response */
model Booking {
  id: int32;
  event_type_id: int32;
  event_type_title: string;
  guest_name: string;
  guest_email: string;
  start_time: utcDateTime;
  end_time: utcDateTime;
  created_at: utcDateTime;
}

/** Event type creation payload */
model EventTypeCreate {
  title: string;
  description: string;
  duration_minutes: int32;
}

/** Event type update payload */
model EventTypeUpdate {
  title?: string;
  description?: string;
  duration_minutes?: int32;
}

/** Error response */
model Error {
  detail: string;
}

/** Public API — guests */
@route("/api/event-types")
interface EventTypesPublic {
  /** List all event types */
  @get list(): EventType[];

  /** Get available slots for an event type */
  @route("{id}/slots")
  @get getSlots(id: int32): Slot[];
}

@route("/api/bookings")
interface BookingsPublic {
  /** Create a booking */
  @post create(...BookingCreate): Booking | Error;
}

/** Admin API */
@route("/admin/{secret}")
interface AdminAPI {
  /** Create event type */
  @route("event-types")
  @post createEventType(secret: string, ...EventTypeCreate): EventType | Error;

  /** Update event type */
  @route("event-types/{id}")
  @put updateEventType(secret: string, id: int32, ...EventTypeUpdate): EventType | Error;

  /** Delete event type */
  @route("event-types/{id}")
  @delete deleteEventType(secret: string, id: int32): void | Error;
}
