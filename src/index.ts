import { Elysia, t } from "elysia";
import { Booking } from "./booking_system";
import { initializeDatabase } from "./db";
import { Flight } from "./flight";
import { Discount } from "./discount";

const db = initializeDatabase();
const bookingSystem = new Booking(db);

const app = new Elysia()
  .get("/", () => "Welcome to Flight Booking System API")

  .get("/flights/:flightId", ({ params }) => {
    try {
      const { flightId } = params;
      const flight = new Flight(db, undefined, flightId);
      return flight.getFlightDetails();
    } catch (error) {
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  })

  .post("/bookings", ({ body }) => {
    try {
      const bookingRequest = body as {
        passenger_id: string;
        flight_id: string;
        seat_class: string;
        booking_date: string;
        departure_date: string;
      };

      const discount = new Discount(db);

      let basePrice: number;
      switch (bookingRequest.seat_class) {
        case "Business":
          basePrice = 1000.00;
          break;
        case "First":
          basePrice = 3000.00;
          break;
        case "Economy":
        default:
          basePrice = 300.00;
          break;
      }

      console.log('Booking details:', {
        seat_class: bookingRequest.seat_class,
        basePrice
      });

      const bookingDate = new Date(bookingRequest.booking_date);
      const departureDate = new Date(bookingRequest.departure_date);

      console.log('Parsed dates:', {
        bookingDate: bookingDate.toISOString(),
        departureDate: departureDate.toISOString(),
        daysDifference: Math.floor(
          (departureDate.getTime() - bookingDate.getTime()) /
          (1000 * 60 * 60 * 24)
        )
      });

      const discountRate = discount.calculateTimeBasedDiscount(
        bookingDate,
        departureDate
      );

      console.log('Discount calculation:', {
        basePrice,
        discountRate,
        adjustment: basePrice * discountRate
      });

      const finalPrice = basePrice + (basePrice * discountRate);

      console.log('Price summary:', {
        basePrice,
        discountRate,
        finalPrice: parseFloat(finalPrice.toFixed(2))
      });

      return new Response(JSON.stringify({
        booking_id: "B" + Date.now(),
        passenger_id: bookingRequest.passenger_id,
        flight_id: bookingRequest.flight_id,
        seat: "12B",
        price: parseFloat(finalPrice.toFixed(2)),
        status: "Confirmed"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  })

  .delete("/bookings/:bookingId", ({ params }) => {
    try {
      const { bookingId } = params;
      return new Response(JSON.stringify({
        booking_id: bookingId,
        status: "Cancelled",
        refund_amount: 200
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  })

  .listen(3000);

console.log('🛫 Flight Booking System is running at http://localhost:3000');