'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useRidePriceModal from '@/app/hooks/useRidePriceModal';
import useSearchingModal from '@/app/hooks/useSearchingModal'; // Import SearchingModal hook
import Modal from './Modal';
import toast from 'react-hot-toast';
import usePaymentModal from '@/app/hooks/usePaymentModal';

const RidePriceModal = () => {
  const ridePriceModal = useRidePriceModal();
  const searchingModal = useSearchingModal(); // Initialize SearchingModal
  const paymentModal = usePaymentModal();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, distance, duration, cost } = ridePriceModal;

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
    paymentModal.onOpen();
    //searchingModal.onOpen();
    
    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-6 text-gray-800">
      <p className="text-center text-sm text-gray-500">
        Review the details of your ride below.
      </p>
      <div className="flex flex-col items-center space-y-3 bg-gray-100 p-4 rounded-lg">
        <div id="distance" className="text-xl font-medium">
          <span className="text-gray-600">Distance:</span> {distance}
        </div>
        <div id="time" className="text-xl font-medium">
          <span className="text-gray-600">Estimated Time:</span> {duration}
        </div>
        <div id="pay" className="text-xl font-medium">
          <span className="text-gray-600">Total Cost:</span> {cost}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={ridePriceModal.isOpen}
      title="Ride Information"
      actionLabel="Confirm Ride"
      onClose={ridePriceModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default RidePriceModal;