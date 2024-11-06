'use client';

import axios from 'axios';
import { useState } from 'react';
import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SearchingModal = () => {
  const searchingModal = useSearchingModal();
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
            searchingModal.onClose();
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
      <div id="distance" className="text-lg">
        <label className="font-medium">Searching...</label>
        <p>{}</p>
      </div>
    </div>
  );
 
  return (
    <Modal
        disabled={isLoading}
        isOpen={searchingModal.isOpen}
        title="Finding Your Driver"
        actionLabel="Cancel Ride"
        onClose={searchingModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        actionClassName="bg-red-500 text-white hover:bg-red-600 border-red-500" 
    />
  );
};

export default SearchingModal;
