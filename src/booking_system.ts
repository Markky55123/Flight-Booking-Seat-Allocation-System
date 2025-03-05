import { Database } from "bun:sqlite";
import { Discount } from "./discount";

export class Booking {
  getFlightAvailability(flightId: string) {
    return this.db.prepare("SELECT * FROM flights WHERE id = ? AND available_seats > 0").get(flightId);
  }
  private db: Database;
  private discount: Discount;

  constructor(db: Database) {
    this.db = db;
    this.discount = new Discount(db);
  }

  private calculateRefund(price: number, departureDate: Date): number {
    const now = new Date("2025-02-01");
    const departureTime = new Date(departureDate);

    const daysUntilDeparture = Math.ceil(
      (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (daysUntilDeparture >= 30) {
      return price * 0.9;
    } else if (daysUntilDeparture >= 7) {
      return price * 0.5;
    }
    return 0;
  }

  public async createBooking(bookingRequest: {
    passenger_id: string;
    flight_id: string;
    seat_class: string;
    booking_date: string;
  }): Promise<{
    booking_id?: string;
    passenger_id?: string;
    flight_id?: string;
    seat?: string;
    price?: number;
    status?: string;
    error?: string;
  }> {
    try {
      const passenger = this.db
        .prepare("SELECT id FROM passengers WHERE passenger_id = ?")
        .get(bookingRequest.passenger_id) as { id: number } | undefined;

      if (!passenger) {
        return { error: "Passenger not found" };
      }

      const flight = this.db
        .prepare("SELECT id, departure FROM flights WHERE flight_id = ?")
        .get(bookingRequest.flight_id) as { id: number; departure: string } | undefined;

      if (!flight) {
        return { error: "Flight not found" };
      }

      const seat = this.db
        .prepare(
          `SELECT s.id, s.seat_number, sp.price as base_price
              FROM seats s
              JOIN seat_prices sp ON s.class_name = sp.class_name
              WHERE s.flight_id = ? AND s.class_name = ? AND s.is_available = TRUE
              LIMIT 1`
        )
        .get(flight.id, bookingRequest.seat_class) as {
          id: number;
          seat_number: string;
          base_price: number;
        } | undefined;

      if (!seat) {
        return { error: "No seats available in selected class" };
      }

      const priceCalc = this.discount.calculateFinalPrice(
        seat.base_price,
        new Date(bookingRequest.booking_date),
        new Date(flight.departure),
        flight.id,
        bookingRequest.seat_class,
        bookingRequest.passenger_id
      );

      const insertStmt = this.db.prepare(
        `INSERT INTO bookings (passenger_id, flight_id, seat_id, booking_date, price, status)
             VALUES (?, ?, ?, ?, ?, ?)`
      );

      const result = insertStmt.run(
        passenger.id,
        flight.id,
        seat.id,
        bookingRequest.booking_date,
        priceCalc.finalPrice,
        "Confirmed"
      );

      this.db.prepare("UPDATE seats SET is_available = FALSE WHERE id = ?").run(seat.id);

      const bookingId = `B${String(result.lastInsertRowid).padStart(5, "0")}`;

      return {
        booking_id: bookingId,
        passenger_id: bookingRequest.passenger_id,
        flight_id: bookingRequest.flight_id,
        seat: seat.seat_number,
        price: priceCalc.finalPrice,
        status: "Confirmed",
      };
    } catch (error) {
      return { error: `Booking failed: ${error instanceof Error ? error.message : "Unknown error"}` };
    }
  }

  public cancelBooking(bookingId: string) {
    const id = parseInt(bookingId.replace('B', ''));

    const booking = this.db
      .prepare(
        `SELECT b.*, f.departure, b.status
           FROM bookings b 
           JOIN flights f ON b.flight_id = f.id 
           WHERE b.id = ?`
      )
      .get(id) as {
        id: number;
        seat_id: number;
        price: number;
        departure: string;
        status: string;
      } | undefined;

    if (!booking) {
      return { error: "Booking not found" };
    }

    if (booking.status === 'Cancelled') {
      return { error: "Booking is already cancelled" };
    }

    const refundAmount = this.calculateRefund(
      booking.price,
      new Date(booking.departure)
    );

    this.db
      .prepare("UPDATE bookings SET status = ? WHERE id = ?")
      .run("Cancelled", booking.id);

    this.db
      .prepare("UPDATE seats SET is_available = TRUE WHERE id = ?")
      .run(booking.seat_id);

    return {
      booking_id: bookingId,
      status: "Cancelled",
      refund_amount: refundAmount
    };
  }

  public getBookingDetails(bookingId: string) {
    const id = parseInt(bookingId.replace('B', ''));

    return this.db
      .prepare(
        `SELECT 
            b.id as booking_id, 
            p.passenger_id, 
            f.flight_id, 
            s.seat_number, 
            b.booking_date, 
            b.price, 
            b.status, 
            f.departure, 
            f.arrival, 
            f.origin, 
            f.destination, 
            s.class_name
          FROM bookings b
          JOIN passengers p ON b.passenger_id = p.id
          JOIN flights f ON b.flight_id = f.id
          JOIN seats s ON b.seat_id = s.id
          WHERE b.id = ?`
      )
      .get(id);
  }

  public getPassengerBookingHistory(passengerId: string) {
    return this.db.query(`
          SELECT 
              b.id as booking_id,
              b.flight_id,
              b.booking_date,
              b.status,
              b.price,
              s.seat_number,
              s.class_name,
              f.departure,
              f.arrival,
              f.origin,
              f.destination
          FROM bookings b
          JOIN seats s ON b.seat_id = s.id
          JOIN flights f ON b.flight_id = f.id
          JOIN passengers p ON b.passenger_id = p.id
          WHERE p.passenger_id = ?
          ORDER BY b.booking_date DESC
      `).all(passengerId);
  }
}
