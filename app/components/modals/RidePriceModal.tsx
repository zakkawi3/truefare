'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useRidePriceModal from '@/app/hooks/useRidePriceModal';
import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';

const RidePriceModal = () => {
  const ridePriceModal = useRidePriceModal();
  const paymentModal = usePaymentModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
  } = useForm<FieldValues>({
    defaultValues: {
      distance: '',
      pay: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = () => {
    setIsLoading(true);

    // Close RidePriceModal and open PaymentModal
    ridePriceModal.onClose();
    paymentModal.onOpen();

    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-6 text-gray-800">
      <p className="text-center text-sm text-gray-500">
        Review the details of your ride below.
      </p>
      <div className="flex flex-col items-center space-y-3 bg-gray-100 p-4 rounded-lg">
        <div id="distance" className="text-xl font-medium">
          <span className="text-gray-600">Distance:</span> {ridePriceModal.distance}
        </div>
        <div id="time" className="text-xl font-medium">
          <span className="text-gray-600">Estimated Time:</span> {ridePriceModal.duration}
        </div>
        <div id="pay" className="text-xl font-medium">
          <span className="text-gray-600">Total Cost:</span> {ridePriceModal.cost}
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
