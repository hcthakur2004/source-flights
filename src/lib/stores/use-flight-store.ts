import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flight, PassengerDraft, SearchQuery, Seat } from "@/lib/types";

type FlightStore = {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  bookingStep: number;
  passenger: PassengerDraft;
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setBookingStep: (step: number) => void;
  setPassenger: (passenger: PassengerDraft) => void;
  resetBooking: () => void;
};

const initialPassenger: PassengerDraft = {
  fullName: "",
  passportNo: "",
  nationality: "Indian",
  dob: "",
};

const initialSearch: SearchQuery = {
  origin: "Delhi",
  destination: "Mumbai",
  date: "",
  passengers: 1,
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: initialSearch,
      selectedFlight: null,
      selectedSeat: null,
      bookingStep: 1,
      passenger: initialPassenger,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat, bookingStep: seat ? 3 : 2 }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassenger: (passenger) => set({ passenger }),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: 1,
          passenger: initialPassenger,
        }),
    }),
    {
      name: "source-asia-flight-store",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passenger: {
          fullName: state.passenger.fullName,
          nationality: state.passenger.nationality,
          dob: state.passenger.dob,
          passportNo: "",
        },
      }),
    },
  ),
);
