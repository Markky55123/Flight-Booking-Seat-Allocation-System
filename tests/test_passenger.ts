import { describe, expect, test, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { Passenger } from "../src/passenger";
import { initializeDatabase } from "../src/db";

describe("Passenger", () => {
    let db: Database;
    let testPassengerId: number;

    beforeEach(() => {
        db = initializeDatabase();
        db.query('DELETE FROM passengers').run();

        const result = db.query(`
            INSERT INTO passengers (passenger_id, first_name, last_name, email, phone)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
        `).get(
            "P001",
            "Monkey",
            "D.Luffy",
            "luffy@email.com",
            "0901234567"
        ) as { id: number };

        testPassengerId = result.id;
    });

    test("should create new passenger successfully", () => {
        const passenger = new Passenger(db);
        const result = passenger.createPassenger(
            "P004",
            "Taiyo",
            "Kuroki",
            "taiyo@email.com",
            "0909999999"
        );

        expect(result).toBeDefined();
        expect(result.passenger_id).toBe("P004");
    });

    test("should update passenger information", () => {
        const passenger = new Passenger(db, testPassengerId);
        const result = passenger.setname(
            "P001",
            "MonkeyV2",
            "D.LuffyV2",
            "D.Luffy2@example.com",
            "0909999998"
        );

        expect(result).toBeDefined();
        expect(result.first_name).toBe("MonkeyV2");
        expect(result.last_name).toBe("D.LuffyV2");
        expect(result.email).toBe("D.Luffy2@example.com");
    });

    test("should validate email format", () => {
        const passenger = new Passenger(db);

        expect(() => passenger.createPassenger(
            "P005",
            "Test",
            "User",
            "invalid-email",
            "0901234567"
        )).toThrow("Invalid email format");
    });

    test("should validate phone number format", () => {
        const passenger = new Passenger(db);

        expect(() => passenger.createPassenger(
            "P005",
            "Test",
            "User",
            "test@email.com",
            "123456"
        )).toThrow("Invalid phone number format");
    });

    test("should not create duplicate passenger ID", () => {
        const passenger = new Passenger(db);

        expect(() => passenger.createPassenger(
            "P001",
            "Test",
            "User",
            "test@email.com",
            "0901234567"
        )).toThrow("Passenger ID already exists");
    });

    test("should get passenger booking history", () => {
        const passenger = new Passenger(db, testPassengerId);
        const bookings = passenger.getBookingHistory();

        expect(Array.isArray(bookings)).toBe(true);
        if (bookings.length > 0) {
            expect(bookings[0]).toHaveProperty('booking_id');
            expect(bookings[0]).toHaveProperty('flight_id');
            expect(bookings[0]).toHaveProperty('booking_date');
            expect(bookings[0]).toHaveProperty('status');
            expect(bookings[0]).toHaveProperty('price');
            expect(bookings[0]).toHaveProperty('seat_number');
            expect(bookings[0]).toHaveProperty('class_name');
        }
    });
});