'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useRidePriceModal from '@/app/hooks/useRidePriceModal';
import useSearchingModal from '@/app/hooks/useSearchingModal'; // Import SearchingModal hook
import Modal from './Modal';
import toast from 'react-hot-toast';

const RidePriceModal = () => {
  const ridePriceModal = useRidePriceModal();
  const searchingModal = useSearchingModal(); // Initialize SearchingModal
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      distance: '',
      pay: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // Close RidePriceModal and open SearchingModal
    ridePriceModal.onClose();
    searchingModal.onOpen();
    
    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Distance:</label>
        <p>{}</p>
      </div>
      <div id="time" className="text-lg">
        <label className="font-medium">Time:</label>
        <p>{}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Price:</label>
        <p>{}</p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={ridePriceModal.isOpen}
      title="Ride Information"
      actionLabel="Continue"
      onClose={ridePriceModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default RidePriceModal;
