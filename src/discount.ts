import { Database } from "bun:sqlite";

export class Discount {
  constructor(private db: Database) { }

  public calculateTimeBasedDiscount(bookingDate: Date, departureDate: Date): number {
    const booking = bookingDate;
    const departure = departureDate;

    const daysBeforeDeparture = Math.floor(
      (departure.getTime() - booking.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    console.log(`Booking date: ${booking}`);
    console.log(`Departure date: ${departure}`);
    console.log(`Days before departure: ${daysBeforeDeparture}`);

    if (daysBeforeDeparture >= 30) {
      return -0.10;
    } else if (daysBeforeDeparture <= 7) {
      return 0.20;
    }
    return 0;
  }

  public calculateOccupancySurcharge(flight_id: number, class_name: string): number {
    const query = `SELECT COUNT(*) as booked,(SELECT COUNT(*) FROM seats WHERE flight_id = $flight_id AND class_name = $class_name) as total FROM seats WHERE flight_id = $flight_id AND class_name = $class_name AND is_available = FALSE`;
    const result = this.db.query(query)
      .get({ $flight_id: flight_id, $class_name: class_name }) as { booked: number, total: number };

    const occupancyRate = result.booked / result.total;

    if (occupancyRate >= 0.8) return 0.2;
    if (occupancyRate >= 0.6) return 0.1;
    return 0;
  }

  public calculateFrequentFlyerDiscount(passengerId: string): number {
    const query = `
          SELECT COUNT(*) as flight_count 
          FROM bookings b
          JOIN passengers p ON b.passenger_id = p.id
          WHERE p.passenger_id = ?
          AND b.status = 'Confirmed'
          AND b.booking_date >= date('now', '-1 year')
        `;

    const result = this.db.query(query)
      .get(passengerId) as { flight_count: number };

    if (result.flight_count >= 10) return -0.15;
    if (result.flight_count >= 5) return -0.10;
    return 0;
  }

  public calculateFinalPrice(
    basePrice: number,
    bookingDate: Date,
    departureDate: Date,
    flight_id: number,
    class_name: string,
    passengerId: string
  ): { finalPrice: number; appliedDiscounts: Array<{ type: string; amount: number }> } {
    const bookingDateObj = new Date(bookingDate);
    const departureDateObj = new Date(departureDate);

    const discounts = [];
    let finalPrice = basePrice;

    try {
      const timeDiscount = this.calculateTimeBasedDiscount(bookingDateObj, departureDateObj);
      if (timeDiscount !== 0) {
        discounts.push({
          type: timeDiscount < 0 ? 'Early Booking Discount' : 'Last Minute Surcharge',
          amount: timeDiscount * basePrice
        });
      }

      const occupancySurcharge = this.calculateOccupancySurcharge(flight_id, class_name);
      if (occupancySurcharge > 0) {
        discounts.push({
          type: 'High Occupancy Surcharge',
          amount: occupancySurcharge * basePrice
        });
      }

      const flyerDiscount = this.calculateFrequentFlyerDiscount(passengerId);
      if (flyerDiscount !== 0) {
        discounts.push({
          type: 'Frequent Flyer Discount',
          amount: flyerDiscount * basePrice
        });
      }

      for (const discount of discounts) {
        finalPrice += discount.amount;
      }

      return {
        finalPrice: Math.max(finalPrice, basePrice * 0.5),
        appliedDiscounts: discounts
      };
    } catch (error) {
      throw error;
    }
  }
}