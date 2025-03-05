import { beforeEach, describe, expect, test } from "bun:test";
import { Flight } from "../src/flight";
import { Database } from "bun:sqlite";
import { initializeDatabase } from "../src/db";

describe("Flight", () => {
    let db: Database;

    beforeEach(() => {
        db = initializeDatabase();
    });

    test("should load flight successfully", () => {
        const flight = new Flight(db, undefined, "F001");
        const details = flight.getFlightDetails();

        expect(details).toBeDefined();
        expect(details.flight_id).toBe("F001");
        expect(details.airline).toBe("Airline A");
        expect(details.origin).toBe("City A");
        expect(details.destination).toBe("City B");
    });

    test("should throw error for non-existent flight", () => {
        expect(() => {
            new Flight(db, undefined, "F999");
        }).toThrow("Flight F999 not found");
    });

    test("should get available seats", () => {
        const flight = new Flight(db, undefined, "F001");
        const seats = flight.getAvailableSeats();

        expect(seats).toHaveLength(3);
        expect(seats).toContainEqual({
            class_name: "Economy",
            total: 36,
            available: 36
        });
        expect(seats).toContainEqual({
            class_name: "Business",
            total: 12,
            available: 12
        });
        expect(seats).toContainEqual({
            class_name: "First",
            total: 12,
            available: 12
        });
    });

    test("should validate flight id format", () => {
        expect(() => {
            new Flight(db, undefined, "Invalid");
        }).toThrow();

        expect(() => {
            new Flight(db, undefined, "F1");
        }).toThrow();

        expect(() => {
            new Flight(db, undefined, "F0001");
        }).toThrow();
    });

    test("should have correct flight schedule", () => {
        const flight = new Flight(db, undefined, "F001");
        const details = flight.getFlightDetails();

        const departure = new Date(details.departure);
        const arrival = new Date(details.arrival);

        expect(departure).toBeInstanceOf(Date);
        expect(arrival).toBeInstanceOf(Date);
        expect(arrival.getTime()).toBeGreaterThan(departure.getTime());
    });

    test("should return null for invalid flight details", () => {
        const flight = new Flight(db);
        const details = flight.getFlightDetails();

        expect(details).toBeDefined();
        expect(details.flight_id).toBe("");
        expect(details.airline).toBe("");
        expect(details.origin).toBe("");
        expect(details.destination).toBe("");
    });
});