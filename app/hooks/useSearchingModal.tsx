import { create } from 'zustand';

interface SearchingModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useSearchingModal = create<SearchingModalStore>((set) => ({
  isOpen: false,
  
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useSearchingModal;
