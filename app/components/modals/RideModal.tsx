'use client';

import axios from 'axios';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useRideModal from '@/app/hooks/useRideModal';
import Modal from './Modal';
import toast from 'react-hot-toast';
import Button from '../Button';

const RideModal = ({ driverData, onAcceptRide, onRejectRide }) => {
  const rideModal = useRideModal();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      distance: driverData?.distance || '',
      pay: driverData?.pay || ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = () => {
    setIsLoading(true);
    onAcceptRide(driverData); // Trigger accept action from parent component
    rideModal.onClose();
    setIsLoading(false);
  };

  const handleReject = () => {
    onRejectRide(driverData); // Trigger reject action from parent component
    rideModal.onClose();
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Distance:</label>
        <p>{driverData?.distance || 'N/A'}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Pay:</label>
        <p>{driverData?.pay || 'N/A'}</p>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-4">
      <hr />
      <Button
        label="Reject"
        onClick={handleReject}
        className="bg-red-500 text-white border-red-500 hover:bg-red-600"
      />
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={rideModal.isOpen}
      title="Ride"
      actionLabel="Accept"
      onClose={rideModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RideModal;
