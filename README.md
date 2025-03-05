# Flight Booking System API

A flight booking REST API built with Elysia and Bun runtime.

## Prerequisites

### 1. Install Bun Runtime

```bash


### 2. Install Visual Studio Code
1. Download from: https://code.visualstudio.com/
2. Install these extensions:

   - Thunder Client (for API testing)
   - Bun
   - TypeScript

## Project Setup

```bash
# Clone the repository
git clone git@github.com:Markky55123/Flight-Booking-Seat-Allocation-System.git
cd app

# Install dependencies
bun install

# Create SQLite database
bun run db:setup

# Start development server
bun run dev
```

## Project Structure
```
app/
├── src/
│   ├── index.ts          # Main application entry
│   ├── db.ts            # Database configuration
│   ├── flight.ts        # Flight management
│   ├── booking_system.ts # Booking logic
│   └── passenger.ts     # Passenger management
├── tests/
│   ├── test_booking_system.ts
│   ├── test_booking_system.ts
│   └── test_passenger.ts
└── package.json
```

## Development

```bash
# Start the server with hot reload
bun run dev

# Run tests
bun test

# Run specific test file
bun test tests/test_flight.ts
```

## API Testing with cURL

### Passenger Endpoints

#### 1. Create Passenger
```bash
curl -X POST http://localhost:3000/passengers ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P004\",\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@example.com\",\"phone\":\"1234567890\"}"
```

Expected Response:
```json
{
  "passenger_id": "P004",
  "first_name": "Taiyo",
  "last_name": "Oyiat",
  "email": "Taiyo@example.com",
  "phone": "1234567890"
}
```

#### 2. Get Passenger Details
```bash
curl http://localhost:3000/passengers/P001
```

Expected Response:
```json
{
  "passenger_id": "P001",
  "first_name": "Monkey",
  "last_name": "D.Luffy",
  "email": "D.Luffy@example.com",
  "phone": "0603252525"
}
```

### Flight Endpoints

#### 1. Get All Flights
```bash
curl http://localhost:3000/flights
```

#### 2. Get Flight Details
```bash
curl http://localhost:3000/flights/F001
```

#### 3. Get Available Seats
```bash
curl http://localhost:3000/flights/F001/seats
```

Expected Response:
```json
[
  {
    "class_name": "Economy",
    "total": 36,
    "available": 36
  },
  {
    "class_name": "Business",
    "total": 12,
    "available": 12
  },
  {
    "class_name": "First",
    "total": 12,
    "available": 12
  }
]
```

### Booking Endpoints

#### 1. Create Booking (Economy Class)
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Economy\",\"booking_date\":\"2025-02-01\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{ 
  "booking_id":"B1741194324251",
  "passenger_id":"P001",
  "flight_id":"F001",
  "seat":"12B",
  "price":300,
  "status":"Confirmed"
}
```

#### 2. Create Booking (Business Class)
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Business\",\"booking_date\":\"2025-02-01\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{ 
  "booking_id":"B1741194433687",
  "passenger_id":"P001",
  "flight_id":"F001",
  "seat":"12B",
  "price":1000,
  "status":"Confirmed"
}
```

#### 3. Create Booking (First Class)
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"First\",\"booking_date\":\"2025-02-01\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{ 
  "booking_id":"B1741194494750",
  "passenger_id":"P001",
  "flight_id":"F001",
  "seat":"12B",
  "price":3000,
  "status":"Confirmed"
}

```

#### 4. Cancel Booking
```bash
curl -X DELETE http://localhost:3000/bookings/B1741188014253
```

### Price Testing

#### 1. Early Booking Discount (30+ days)
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Economy\",\"booking_date\":\"2025-01-01\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{
  "booking_id": "B1741188014253",
  "passenger_id": "P001",
  "flight_id": "F001",
  "seat": "12B",
  "price": 270.00,
  "status": "Confirmed"
}
```

#### 2. Last Minute Surcharge (≤7 days)
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Economy\",\"booking_date\":\"2025-02-25\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{
  "booking_id": "B1741188014254",
  "passenger_id": "P001",
  "flight_id": "F001",
  "seat": "12B",
  "price": 360.00,
  "status": "Confirmed"
}
```

### Error Testing

#### 1. Invalid Passenger ID
```bash
curl http://localhost:3000/passengers/P999
```

#### 2. Invalid Flight ID
```bash
curl http://localhost:3000/flights/F999
```

#### 3. Booking with Past Date
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Economy\",\"booking_date\":\"2024-01-01\",\"departure_date\":\"2024-02-01\"}"
```

Expected Response:
```json
{ 
  "booking_id":"B1741194578098",
  "passenger_id":"P001",
  "flight_id":"F001",
  "seat":"12B",
  "price":270,
  "status":"Confirmed"
}
```

#### 4. Full Flight Booking
```bash
curl -X POST http://localhost:3000/bookings ^
-H "Content-Type: application/json" ^
-d "{\"passenger_id\":\"P001\",\"flight_id\":\"F001\",\"seat_class\":\"Economy\",\"booking_date\":\"2025-02-01\",\"departure_date\":\"2025-03-01\"}"
```

Expected Response:
```json
{ 
  "booking_id":"B1741194619663",
  "passenger_id":"P001",
  "flight_id":"F001",
  "seat":"12B",
  "price":300,
  "status":"Confirmed"
}
```