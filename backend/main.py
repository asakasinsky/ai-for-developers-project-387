from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Calendar Booking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root endpoint for health check ---

@app.get("/")
def root():
    return {"status": "ok", "service": "Calendar Booking API"}

# --- Models ---

class EventType(BaseModel):
    id: str
    name: str
    description: str
    durationMinutes: int

class TimeSlot(BaseModel):
    startTime: datetime
    endTime: datetime
    available: bool

class Booking(BaseModel):
    id: str
    eventTypeId: str
    guestName: str
    guestEmail: str
    startTime: datetime
    endTime: datetime
    createdAt: datetime

class CreateBookingRequest(BaseModel):
    eventTypeId: str
    guestName: str
    guestEmail: str
    startTime: datetime

class NotFoundError(BaseModel):
    code: str = "NOT_FOUND"
    message: str

class SlotUnavailableError(BaseModel):
    code: str = "SLOT_UNAVAILABLE"
    message: str

# --- In-Memory Storage ---

event_types_db: dict[str, EventType] = {
    "consultation": EventType(
        id="consultation",
        name="30-min Consultation",
        description="Quick consultation call to discuss your needs",
        durationMinutes=30,
    ),
    "demo": EventType(
        id="demo",
        name="Product Demo",
        description="Full product demonstration with Q&A",
        durationMinutes=60,
    ),
    "strategy": EventType(
        id="strategy",
        name="Strategy Session",
        description="Deep dive into your business goals and planning",
        durationMinutes=90,
    ),
}

bookings_db: list[Booking] = []

# --- API Endpoints ---

@app.get("/event-types", response_model=list[EventType])
def list_event_types():
    return list(event_types_db.values())

@app.get("/event-types/{event_type_id}", response_model=EventType)
def get_event_type(event_type_id: str):
    if event_type_id not in event_types_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Event type not found"}
        )
    return event_types_db[event_type_id]

@app.get("/availability/{event_type_id}", response_model=list[TimeSlot])
def get_available_slots(event_type_id: str):
    if event_type_id not in event_types_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Event type not found"}
        )

    event_type = event_types_db[event_type_id]
    now = datetime.now(timezone.utc)
    slots = []

    current_time = now.replace(hour=9, minute=0, second=0, microsecond=0)
    if current_time < now:
        current_time += timedelta(days=1)

    end_date = now + timedelta(days=14)

    while current_time < end_date:
        if current_time.weekday() < 5:
            slot_start = current_time
            slot_end = slot_start + timedelta(minutes=event_type.durationMinutes)

            is_available = not any(
                booking.startTime == slot_start
                for booking in bookings_db
            )

            slots.append(TimeSlot(
                startTime=slot_start,
                endTime=slot_end,
                available=is_available,
            ))

        current_time += timedelta(minutes=30)

    return slots

@app.post("/bookings", response_model=Booking, status_code=status.HTTP_201_CREATED)
def create_booking(request: CreateBookingRequest):
    if request.eventTypeId not in event_types_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Event type not found"}
        )

    event_type = event_types_db[request.eventTypeId]

    existing_booking = next(
        (b for b in bookings_db if b.startTime == request.startTime),
        None
    )
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "SLOT_UNAVAILABLE", "message": "This time slot is no longer available"}
        )

    now = datetime.now(timezone.utc)
    booking = Booking(
        id=str(uuid4()),
        eventTypeId=request.eventTypeId,
        guestName=request.guestName,
        guestEmail=request.guestEmail,
        startTime=request.startTime,
        endTime=request.startTime + timedelta(minutes=event_type.durationMinutes),
        createdAt=now,
    )
    bookings_db.append(booking)
    return booking

@app.get("/bookings", response_model=list[Booking])
def list_upcoming_bookings():
    now = datetime.now(timezone.utc)
    upcoming = [b for b in bookings_db if b.startTime > now]
    upcoming.sort(key=lambda b: b.startTime)
    return upcoming