'use client';

import axios from 'axios';
import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import useRideModal from '@/app/hooks/useRideModal';
import Modal from './Modal';
import toast from 'react-hot-toast';
import Button from '../Button';

const RideModal = () => {
  const rideModal = useRideModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
  } = useForm<FieldValues>({
    defaultValues:{
        distance: '',
        pay: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) =>  {
    setIsLoading(true);
    
    axios.post('/api/register', data)
        .then(() => {
            rideModal.onClose();
        })
        .catch(() => {
            toast.error('Something went wrong');
        })
        .finally(() => {
            setIsLoading(false);
        });
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Distance:</label>
        <p>{}</p>
      </div>
      <div id="pay" className="text-lg">
        <label className="font-medium">Pay:</label>
        <p>{}</p>
      </div>
    </div>
  );

  const footerContent = (
    <div className='flex flex-col gap-4 mt-4'>
        <hr />
        <Button 
          label="Reject"
          onClick={() => {
            rideModal.onClose(); // Close the modal on Reject button click
          }}
          className="bg-red-500 text-white border-red-500 hover:bg-red-600"
        />
        <div
            className="
                text-neutral-500
                text-center
                mt-4
                font-light
            "
        >
        </div>
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
