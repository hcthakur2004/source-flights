export type FlightStatus = "scheduled" | "boarding" | "delayed" | "cancelled";
export type SeatClass = "economy" | "business" | "first";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";

export type Flight = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
};

export type Seat = {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
};

export type PassengerDraft = {
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
};

export type SearchQuery = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
};

export type BookingWithDetails = {
  id: string;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  flight: Flight;
  seat: Seat;
  passengers: {
    full_name: string;
    passport_no: string;
    nationality: string;
    dob: string;
  }[];
};
