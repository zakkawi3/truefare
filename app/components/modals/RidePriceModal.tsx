'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the hook at the top of your component
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

  // Move useRouter outside of the submit handler to avoid invalid hook call error
  const router = useRouter();

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

  // onSubmit handler remains the same, but now we use router that was defined outside
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // Close RidePriceModal and potentially open SearchingModal
    ridePriceModal.onClose();
    paymentModal.onOpen();

    // Now the router is available here and can be used safely
    // Navigate to CheckoutPage

    // Optionally, you could open the SearchingModal if you want to display a loading state
    //searchingModal.onOpen();

    // Finish loading state after navigating
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
