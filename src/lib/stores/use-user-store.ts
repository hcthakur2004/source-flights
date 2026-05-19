import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import type { BookingWithDetails } from "@/lib/types";

type UserStore = {
  session: Session | null;
  cachedBookings: BookingWithDetails[];
  setSession: (session: Session | null) => void;
  setCachedBookings: (bookings: BookingWithDetails[]) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      cachedBookings: [],
      setSession: (session) => set({ session }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      resetUser: () => set({ session: null, cachedBookings: [] }),
    }),
    {
      name: "source-asia-user-store",
      partialize: (state) => ({
        session: state.session
          ? {
              access_token: state.session.access_token,
              refresh_token: state.session.refresh_token,
              expires_at: state.session.expires_at,
              token_type: state.session.token_type,
              user: state.session.user,
            }
          : null,
      }),
    },
  ),
);
