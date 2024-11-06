import { create } from 'zustand';

interface DriverAssignmentModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useDriverAssignmentModal = create<DriverAssignmentModalStore>((set) => ({
  isOpen: false,
  
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useDriverAssignmentModal;
