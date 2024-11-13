'use client';

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useDriverAssignmentModal from '@/app/hooks/useDriverAssignmentModal';
import Modal from './Modal';

// Define the form data interface
interface DriverAssignmentFormData {
  distance: string;
  pay: string;
}

const DriverAssignment = () => {
  const driverAssignmentModal = useDriverAssignmentModal();
  const [isLoading, setIsLoading] = useState(false);

  // Use the DriverAssignmentFormData interface for form data
  const { handleSubmit } = useForm<DriverAssignmentFormData>({
    defaultValues: {
      distance: '',
      pay: '',
    },
  });

  // Update the onSubmit handler to use DriverAssignmentFormData
  const onSubmit: SubmitHandler<DriverAssignmentFormData> = (data) => {
    setIsLoading(true);

    // Close RidePriceModal and open SearchingModal
    driverAssignmentModal.onClose();

    setIsLoading(false);
  };

  // Modal content body
  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Name:</label>
        <p>{/* Name goes here */}</p>
      </div>
      <div id="time" className="text-lg">
        <label className="font-medium">Estimated Dropoff Time:</label>
        <p>{/* Estimated dropoff time goes here */}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Car Make:</label>
        <p>{/* Car make goes here */}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Car Model:</label>
        <p>{/* Car model goes here */}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">License Plate:</label>
        <p>{/* License plate goes here */}</p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={driverAssignmentModal.isOpen}
      title="Driver Information"
      actionLabel="Cancel"
      onClose={driverAssignmentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      actionClassName="bg-red-500 text-white hover:bg-red-600 border-red-500"
    />
  );
};

export default DriverAssignment;
