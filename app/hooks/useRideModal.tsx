import { create } from 'zustand';

interface RideModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useRideModal = create<RideModalStore>((set) => ({
  isOpen: false,
  
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useRideModal;
