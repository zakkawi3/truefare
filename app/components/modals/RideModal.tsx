'use client';

import axios from 'axios';
import { useState } from 'react';
import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useRideModal from '@/app/hooks/useRideModal';
import Modal from './Modal';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import Button from '../Button';
import useRegisterModal from '@/app/hooks/useRegisterModal';

const RideModal = () => {
  const registerModal = useRegisterModal();
  const rideModal = useRideModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        .catch((error) => {
            toast.error('Something went wrong');
        })
        .finally(() => {
            setIsLoading(false);
        })
  }

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input 
        id="distance"
        label="Distance"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input 
        id="pay"
        type="text"
        label="Pay"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
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
            className="bg-red-500 text-white rounded-lg hover:bg-red-600" // Optionally add classes for styling
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
  )
 
  return (
    <Modal
        disabled={isLoading}
        isOpen={rideModal.isOpen}
        title="Ride"
        actionLabel="Ride"
        onClose={rideModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        footer={footerContent}
    />
  );
};

export default RideModal;
