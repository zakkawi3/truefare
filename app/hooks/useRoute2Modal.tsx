import { create } from 'zustand';

interface Route2ModalStore {
  isOpen: boolean;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  onOpen: (pickupLocation: string, dropoffLocation: string) => void;
  onClose: () => void;
}

const useRoute2Modal = create<Route2ModalStore>((set) => ({
  isOpen: false,
  pickupLocation: null,
  dropoffLocation: null,
  onOpen: (pickupLocation, dropoffLocation) =>
    set({ isOpen: true, pickupLocation, dropoffLocation }),
  onClose: () =>
    set({ isOpen: false, pickupLocation: null, dropoffLocation: null }),
}));

export default useRoute2Modal;
