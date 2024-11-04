import { create } from 'zustand';

interface RidePriceModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useRidePriceModal = create<RidePriceModalStore>((set) => ({
  isOpen: false,
  
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useRidePriceModal;
