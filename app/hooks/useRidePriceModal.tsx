import { create } from 'zustand';

interface RidePriceModalStore {
  isOpen: boolean;
  distance: string;
  duration: string;
  cost: string;
  onOpen: (distance: string, duration: string, cost: string) => void;
  onClose: () => void;
}

const useRidePriceModal = create<RidePriceModalStore>((set) => ({
  isOpen: false,
  distance: '',
  duration: '',
  cost: '',

  onOpen: (distance, duration, cost) =>
    set({ isOpen: true, distance, duration, cost }),

  onClose: () => set({ isOpen: false, distance: '', duration: '', cost: '' }),
}));

export default useRidePriceModal;
