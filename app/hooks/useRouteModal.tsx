import { create } from 'zustand';

interface RouteModalStore {
  isOpen: boolean;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  driverID: string | null;
  onOpen: (pickupLocation: string, dropoffLocation: string, driverID: string) => void;
  onClose: () => void;
}

const useRouteModal = create<RouteModalStore>((set) => ({
  isOpen: false,
  pickupLocation: null,
  dropoffLocation: null,
  driverID: null,
  onOpen: (pickupLocation, dropoffLocation, driverID) =>
    set({ isOpen: true, pickupLocation, dropoffLocation, driverID }),
  onClose: () =>
    set({ isOpen: false, pickupLocation: null, dropoffLocation: null, driverID: null }),
}));

export default useRouteModal;
