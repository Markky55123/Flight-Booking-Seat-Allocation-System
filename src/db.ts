import { Database } from "bun:sqlite";

export function initializeDatabase(): Database {
  const db = new Database(":memory:");

  db.exec(`CREATE TABLE seat_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_name VARCHAR(20) UNIQUE,
  description TEXT,
  total_seats INT
);`);

  db.exec(`CREATE TABLE flights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id VARCHAR(10) UNIQUE NOT NULL,  
  airline VARCHAR(100) NOT NULL,      
  departure DATETIME NOT NULL,        
  arrival DATETIME NOT NULL,          
  origin VARCHAR(50) NOT NULL,        
  destination VARCHAR(50) NOT NULL    
);`);

  db.exec(`CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL
);`);

  db.exec(`CREATE TABLE seats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id INTEGER,
  class_name VARCHAR(20),
  seat_number VARCHAR(10), 
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
  FOREIGN KEY (class_name) REFERENCES seat_classes(class_name)
);`);

  db.exec(`CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passenger_id INTEGER,
  flight_id INTEGER,
  seat_id INTEGER,
  booking_date DATE,
  price DECIMAL(10,2),
  status TEXT CHECK(status IN ('Confirmed', 'Cancelled')),
  FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
);`);

  db.exec(`INSERT INTO seat_classes (class_name, description, total_seats) VALUES 
  ("Economy", "Economy Class", 36),
  ("Business", "Business Class", 12),
  ("First", "First Class", 12);`);

  db.exec(`INSERT INTO flights (flight_id, airline, departure, arrival, origin, destination) VALUES 
  ("F001", "Airline A", "2025-03-01 10:00:00", "2025-03-01 14:00:00", "City A", "City B"),
  ("F002", "Airline B", "2025-03-02 11:00:00", "2025-03-02 15:00:00", "City C", "City D"),
  ("F003", "Airline C", "2025-03-03 12:00:00", "2025-03-03 16:00:00", "City E", "City F");`);

  db.exec(`INSERT INTO passengers (passenger_id, first_name, last_name, email, phone) VALUES 
  ("P001", "Monkey", "D.Luffy", "D.Luffy@example.com", "0603252525"),
  ("P002", "Levi", "Ackerman", "Ackerman@example.com", "090999999"),
  ("P003", "Gojo", "Satoru", "Satoru@example.com", "1122334455");`);

  db.exec(`INSERT INTO seats (flight_id, class_name, seat_number) VALUES
  -- First Class (2 rows x 6 seats)
  (1, "First", "1A"), (1, "First", "1B"), (1, "First", "1C"), (1, "First", "1D"), (1, "First", "1E"), (1, "First", "1F"),
  (1, "First", "2A"), (1, "First", "2B"), (1, "First", "2C"), (1, "First", "2D"), (1, "First", "2E"), (1, "First", "2F"),
  
  -- Business Class (2 rows x 6 seats)
  (1, "Business", "3A"), (1, "Business", "3B"), (1, "Business", "3C"), (1, "Business", "3D"), (1, "Business", "3E"), (1, "Business", "3F"),
  (1, "Business", "4A"), (1, "Business", "4B"), (1, "Business", "4C"), (1, "Business", "4D"), (1, "Business", "4E"), (1, "Business", "4F"),
  
  -- Economy Class (6 rows x 6 seats)
  (1, "Economy", "5A"), (1, "Economy", "5B"), (1, "Economy", "5C"), (1, "Economy", "5D"), (1, "Economy", "5E"), (1, "Economy", "5F"),
  (1, "Economy", "6A"), (1, "Economy", "6B"), (1, "Economy", "6C"), (1, "Economy", "6D"), (1, "Economy", "6E"), (1, "Economy", "6F"),
  (1, "Economy", "7A"), (1, "Economy", "7B"), (1, "Economy", "7C"), (1, "Economy", "7D"), (1, "Economy", "7E"), (1, "Economy", "7F"),
  (1, "Economy", "8A"), (1, "Economy", "8B"), (1, "Economy", "8C"), (1, "Economy", "8D"), (1, "Economy", "8E"), (1, "Economy", "8F"),
  (1, "Economy", "9A"), (1, "Economy", "9B"), (1, "Economy", "9C"), (1, "Economy", "9D"), (1, "Economy", "9E"), (1, "Economy", "9F"),
  (1, "Economy", "10A"), (1, "Economy", "10B"), (1, "Economy", "10C"), (1, "Economy", "10D"), (1, "Economy", "10E"), (1, "Economy", "10F");`);

  db.exec(`CREATE TABLE seat_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_name VARCHAR(20),
  price DECIMAL(10,2)
);`);

  db.exec(`INSERT INTO seat_prices (class_name, price) VALUES
  ("First", 3000),
  ("Business", 1000),
  ("Economy", 300);`);

  return db;
}



