import { Database } from "bun:sqlite";

export class Passenger {
    private db: Database;
    private id: number = 0;
    public passenger_id: string = "";
    public first_name: string = "";
    public last_name: string = "";
    public email: string = "";
    public phone: string = "";

    constructor(db: Database, id?: number) {
        this.db = db;
        if (id) {
            this.loadPassenger(id);
        }
    }

    public createPassenger(
        passenger_id: string,
        first_name: string,
        last_name: string,
        email: string,
        phone: string
    ) {
        // Validate inputs
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            throw new Error("Invalid email format");
        }

        if (!/^\d{10}$/.test(phone)) {
            throw new Error("Invalid phone number format");
        }

        const existing = this.db.query('SELECT id FROM passengers WHERE passenger_id = ?')
            .get(passenger_id);
        if (existing) {
            throw new Error("Passenger ID already exists");
        }

        this.passenger_id = passenger_id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.phone = phone;

        const result = this.db.query(`
            INSERT INTO passengers (passenger_id, first_name, last_name, email, phone)
            VALUES (?, ?, ?, ?, ?)
        `).run(passenger_id, first_name, last_name, email, phone);

        this.id = result.lastInsertRowid as number;

        return this.getPassengerInfo();
    }

    public setname(
        passenger_id?: string,
        first_name?: string,
        last_name?: string,
        email?: string,
        phone?: string
    ) {
        if (passenger_id) this.passenger_id = passenger_id;
        if (first_name) this.first_name = first_name;
        if (last_name) this.last_name = last_name;
        if (email) {
            if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
                throw new Error("Invalid email format");
            }
            this.email = email;
        }
        if (phone) {
            if (!/^\d{10}$/.test(phone)) {
                throw new Error("Invalid phone number format");
            }
            this.phone = phone;
        }

        this.updatePassengerInfo();
        return this.getPassengerInfo();
    }

    public getBookingHistory() {
        return this.db.query(`
            SELECT 
                b.id as booking_id,
                b.flight_id,
                b.booking_date,
                b.status,
                b.price,
                s.seat_number,
                s.class_name
            FROM bookings b
            JOIN seats s ON b.seat_id = s.id
            WHERE b.passenger_id = ?
            ORDER BY b.booking_date DESC
        `).all(this.id);
    }

    private loadPassenger(id: number) {
        const passenger = this.db.query('SELECT * FROM passengers WHERE id = ?')
            .get(id) as {
                id: number;
                passenger_id: string;
                first_name: string;
                last_name: string;
                email: string;
                phone: string;
            };

        if (!passenger) {
            throw new Error(`Passenger with ID ${id} not found`);
        }

        this.id = passenger.id;
        this.passenger_id = passenger.passenger_id;
        this.first_name = passenger.first_name;
        this.last_name = passenger.last_name;
        this.email = passenger.email;
        this.phone = passenger.phone;
    }

    private updatePassengerInfo() {
        this.db.query(`
            UPDATE passengers 
            SET first_name = ?, last_name = ?, email = ?, phone = ?
            WHERE passenger_id = ?
        `).run(
            this.first_name,
            this.last_name,
            this.email,
            this.phone,
            this.passenger_id
        );
    }

    public getPassengerInfo() {
        return {
            passenger_id: this.passenger_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone
        };
    }
}