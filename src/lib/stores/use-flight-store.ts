import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flight, PassengerDraft, SearchQuery, Seat } from "@/lib/types";

type FlightStore = {
  searchQuery: SearchQuery;
  selectedFlight: Flight | null;
  selectedSeats: Seat[];
  bookingStep: number;
  passengers: PassengerDraft[];
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  toggleSelectedSeat: (seat: Seat, maxSeats: number) => void;
  clearSelectedSeats: () => void;
  setBookingStep: (step: number) => void;
  setPassengerAt: (index: number, passenger: PassengerDraft) => void;
  syncPassengerCount: (count: number) => void;
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
      selectedSeats: [],
      bookingStep: 1,
      passengers: [initialPassenger],
      setSearchQuery: (query) =>
        set((state) => ({
          searchQuery: query,
          selectedSeats: state.selectedSeats.slice(0, query.passengers),
          passengers: normalizePassengers(state.passengers, query.passengers),
        })),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      toggleSelectedSeat: (seat, maxSeats) =>
        set((state) => {
          const exists = state.selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);
          const selectedSeats = exists
            ? state.selectedSeats.filter((selectedSeat) => selectedSeat.id !== seat.id)
            : state.selectedSeats.length < maxSeats
              ? [...state.selectedSeats, seat]
              : state.selectedSeats;

          return {
            selectedSeats,
            bookingStep: selectedSeats.length === maxSeats ? 3 : 2,
          };
        }),
      clearSelectedSeats: () => set({ selectedSeats: [], bookingStep: 2 }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerAt: (index, passenger) =>
        set((state) => {
          const passengers = normalizePassengers(state.passengers, state.searchQuery.passengers);
          passengers[index] = passenger;
          return { passengers };
        }),
      syncPassengerCount: (count) =>
        set((state) => ({
          passengers: normalizePassengers(state.passengers, count),
          selectedSeats: state.selectedSeats.slice(0, count),
        })),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeats: [],
          bookingStep: 1,
          passengers: [initialPassenger],
        }),
    }),
    {
      name: "source-asia-flight-store",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeats: state.selectedSeats,
        bookingStep: state.bookingStep,
        passengers: state.passengers.map((passenger) => ({
          fullName: passenger.fullName,
          nationality: passenger.nationality,
          dob: passenger.dob,
          passportNo: "",
        })),
      }),
    },
  ),
);

function normalizePassengers(passengers: PassengerDraft[], count: number) {
  return Array.from({ length: Math.max(1, count) }, (_, index) => passengers[index] ?? initialPassenger);
}
