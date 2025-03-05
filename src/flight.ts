import { Database } from "bun:sqlite";

export class Flight {
    private db: Database;
    private id: number;
    private flight_id: string;
    private airline: string;
    private departure: Date;
    private arrival: Date;
    private origin: string;
    private destination: string;

    constructor(db: Database, id?: number, flight_id?: string, airline?: string, departure?: Date, arrival?: Date, origin?: string, destination?: string) {
        this.db = db;
        this.id = 0;
        this.flight_id = "";
        this.airline = "";
        this.departure = new Date();
        this.arrival = new Date();
        this.origin = "";
        this.destination = "";

        if (id) {
            this.loadFlight(id);
        } else if (flight_id) {
            const flight = this.db.query('SELECT * FROM flights WHERE flight_id = ?')
                .get(flight_id) as any;

            if (!flight) {
                throw new Error(`Flight ${flight_id} not found`);
            }

            this.id = flight.id;
            this.flight_id = flight.flight_id;
            this.airline = flight.airline;
            this.departure = new Date(flight.departure);
            this.arrival = new Date(flight.arrival);
            this.origin = flight.origin;
            this.destination = flight.destination;
        }
    }

    public getFlightDetails() {
        return {
            flight_id: this.flight_id,
            airline: this.airline,
            departure: this.departure,
            arrival: this.arrival,
            origin: this.origin,
            destination: this.destination
        };
    }

    public getAvailableSeats() {
        return this.db.query(`
            SELECT 
                class_name,
                COUNT(*) as total,
                SUM(CASE WHEN is_available = 1 THEN 1 ELSE 0 END) as available
            FROM seats
            WHERE flight_id = ?
            GROUP BY class_name
        `).all(this.id);
    }

    public getId(): number {
        return this.id;
    }

    private loadFlight(id: number) {
        const flight = this.db.query('SELECT * FROM flights WHERE id = ?')
            .get(id) as any;

        if (!flight) {
            throw new Error(`Flight with ID ${id} not found`);
        }

        this.id = flight.id;
        this.flight_id = flight.flight_id;
        this.airline = flight.airline;
        this.departure = new Date(flight.departure);
        this.arrival = new Date(flight.arrival);
        this.origin = flight.origin;
        this.destination = flight.destination;
    }
}