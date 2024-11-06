'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useDriverAssignmentModal from '@/app/hooks/useDriverAssignmentModal';
import Modal from './Modal';

const DriverAssignment = () => {
  const driverAssignmentModal = useDriverAssignmentModal();
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
    driverAssignmentModal.onClose();
    
    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Name:</label>
        <p>{}</p>
      </div>
      <div id="time" className="text-lg">
        <label className="font-medium">ETA:</label>
        <p>{}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Car Make:</label>
        <p>{}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Car Model:</label>
        <p>{}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">License Plate:</label>
        <p>{}</p>
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
