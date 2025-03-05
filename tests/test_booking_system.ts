import { beforeEach, describe, expect, test } from "bun:test";
import { Booking } from "../src/booking_system";
import { Database } from "bun:sqlite";
import { initializeDatabase } from "../src/db";

describe("Booking System", () => {
    let db: Database;
    let bookingSystem: Booking;

    beforeEach(() => {
        db = initializeDatabase();
        bookingSystem = new Booking(db);

        for (let i = 0; i < 50; i++) {
            db.query(`
                INSERT INTO passengers (passenger_id, first_name, last_name, email, phone)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                `P${i + 10}`,
                `Test${i}`,
                `User${i}`,
                `test${i}@example.com`,
                `123456789${i}`
            );
        }
    });

    test("should book economy class successfully", async () => {
        const result = await bookingSystem.createBooking({
            passenger_id: "P002",
            flight_id: "F001",
            seat_class: "Economy",
            booking_date: "2025-02-01"
        });

        expect(result).toBeDefined();
        expect(result.error).toBeUndefined();
        expect(result.booking_id).toBeDefined();
        expect(result.passenger_id).toBe("P002");
        expect(result.flight_id).toBe("F001");
        expect(result.price).toBe(300);
        expect(result.status).toBe("Confirmed");
    });

    test("should fail booking when flight is full", async () => {
        for (let i = 0; i < 36; i++) {
            const result = await bookingSystem.createBooking({
                passenger_id: `P${i + 10}`,
                flight_id: "F001",
                seat_class: "Economy",
                booking_date: "2025-02-01"
            });
            expect(result.error).toBeUndefined();
        }

        const result = await bookingSystem.createBooking({
            passenger_id: "P002",
            flight_id: "F001",
            seat_class: "Economy",
            booking_date: "2025-02-01"
        });

        expect(result.error).toBeDefined();
        expect(result.error).toContain("No seats available in selected class");
    });

    test("should cancel booking with refund", async () => {
        const booking = await bookingSystem.createBooking({
            passenger_id: "P002",
            flight_id: "F001",
            seat_class: "Economy",
            booking_date: "2025-02-01"
        });

        if (!booking.booking_id) {
            throw new Error("Booking ID is undefined");
        }

        const result = bookingSystem.cancelBooking(booking.booking_id);
        expect(result).toBeDefined();
        expect(result.status).toBe("Cancelled");
        expect(result.refund_amount).toBe(270);
    });

    test("should apply dynamic pricing", async () => {
        for (let i = 0; i < 22; i++) {
            const result = await bookingSystem.createBooking({
                passenger_id: `P${i + 10}`,
                flight_id: "F001",
                seat_class: "Economy",
                booking_date: "2025-02-01"
            });
            expect(result.error).toBeUndefined();
        }

        const result = await bookingSystem.createBooking({
            passenger_id: "P002",
            flight_id: "F001",
            seat_class: "Economy",
            booking_date: "2025-02-01"
        });

        expect(result.error).toBeUndefined();
        expect(result.price).toBeGreaterThan(300);
    });
});