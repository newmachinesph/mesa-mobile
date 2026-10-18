import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  seedState,
  depositRequired,
  depositAmount,
  type MesaState,
  type Reservation,
  type Guest,
  type Restaurant,
  type Schedule,
  type Occasion,
  type PaymentMethod,
  type Deposit,
} from '@/core';

// The signed-in diner. Maria Santos is a VIP with an active pending booking
// (party of 14, deposit awaiting proof) — a useful default for demos.
const DEFAULT_GUEST_ID = 'g-maria';

export interface CreateReservationInput {
  restaurantId: string;
  partySize: number;
  dateISO: string;
  time: string;
  occasion?: Occasion;
  notes?: string;
  method?: PaymentMethod;
}

interface MesaStore extends MesaState {
  currentGuestId: string;
  setGuest: (id: string) => void;
  createReservation: (input: CreateReservationInput) => Reservation;
  cancelReservation: (id: string) => void;
  uploadProof: (reservationId: string, uri: string, reference: string) => void;
}

export const useMesaStore = create<MesaStore>((set, get) => ({
  ...seedState(),
  currentGuestId: DEFAULT_GUEST_ID,

  setGuest: (id) => set({ currentGuestId: id }),

  createReservation: (input) => {
    const state = get();
    const guest = state.guests.find((g) => g.id === state.currentGuestId);
    const restaurant = state.restaurants.find((r) => r.id === input.restaurantId);
    if (!restaurant) throw new Error(`Unknown restaurant: ${input.restaurantId}`);
    if (!guest) throw new Error('No signed-in guest');

    const policy = restaurant.depositPolicy;
    const needsDeposit = depositRequired(policy, input.partySize);
    const deposit: Deposit | undefined = needsDeposit
      ? {
          id: `dep-${Date.now()}`,
          amount: depositAmount(policy, input.partySize),
          method: input.method ?? policy.methods[0] ?? 'gcash',
          status: 'awaiting_proof',
        }
      : undefined;

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      restaurantId: input.restaurantId,
      guestId: guest.id,
      name: guest.name,
      phone: guest.phone,
      partySize: input.partySize,
      dateISO: input.dateISO,
      time: input.time,
      occasion: input.occasion,
      notes: input.notes ?? '',
      status: 'pending',
      tableIds: [], // a host assigns tables later — the diner never picks one.
      deposit,
      source: 'online',
      createdAt: new Date().toISOString(),
    };

    set({ reservations: [reservation, ...state.reservations] });
    return reservation;
  },

  cancelReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        // Guard: a diner can only cancel their own booking.
        r.id === id && r.guestId === state.currentGuestId
          ? { ...r, status: 'cancelled' }
          : r,
      ),
    })),

  uploadProof: (reservationId, uri, reference) =>
    set((state) => ({
      reservations: state.reservations.map((r) => {
        if (r.id !== reservationId || r.guestId !== state.currentGuestId) return r;
        const base: Deposit = r.deposit ?? {
          id: `dep-${Date.now()}`,
          amount: 0,
          method: 'gcash',
          status: 'awaiting_proof',
        };
        return {
          ...r,
          deposit: {
            ...base,
            proofUri: uri,
            reference,
            status: 'pending_review',
            uploadedAt: new Date().toISOString(),
          },
        };
      }),
    })),
}));

// --- Selectors --------------------------------------------------------------

export function useCurrentGuest(): Guest | undefined {
  return useMesaStore((s) => s.guests.find((g) => g.id === s.currentGuestId));
}

export function useMyReservations(): Reservation[] {
  return useMesaStore(
    useShallow((s) => s.reservations.filter((r) => r.guestId === s.currentGuestId)),
  );
}

export function useRestaurant(id: string): Restaurant | undefined {
  return useMesaStore((s) => s.restaurants.find((r) => r.id === id));
}

export function useScheduleFor(restaurantId: string): Schedule | undefined {
  return useMesaStore((s) => s.schedules.find((sc) => sc.restaurantId === restaurantId));
}
