'use client';

import { useState } from 'react';
import {
  FieldValues,
  SubmitHandler,
  useForm
} from 'react-hook-form';

import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import SearchingModal from './SearchingModal';
import useSearchingModal from '@/app/hooks/useSearchingModal';

const PaymentModal = () => {
    const paymentModal = usePaymentModal();
    const searchingModal = useSearchingModal();
    const [isLoading, setIsLoading] = useState(false);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<FieldValues>({
      defaultValues: {
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: ''
      }
    });
  
    const onSubmit: SubmitHandler<FieldValues> = (data) => {
      setIsLoading(true);
  
      //Can use this if we want to create an aritifical timeout for processing
      // Simulate API call or handle payment processing here
    //   setTimeout(() => {
    //     setIsLoading(false);
    //     toast.success('Payment Submitted');
    //     paymentModal.onClose();
    //   }, 1000);
      toast.success('Payment Submitted');
      paymentModal.onClose();
      searchingModal.onOpen();

      setIsLoading(false);
    };
  
    const bodyContent = (
      <div className="flex flex-col gap-6 items-center sm:items-stretch p-4">
        <Heading
          title="Payment Details"
          subtitle="Enter your payment information"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        </div>
      </div>
    );
  
    const footerContent = (
      <div className="text-neutral-500 text-center font-light mt-4 p-2">
        <p>Ensure your payment details are correct before submitting.</p>
      </div>
    );
  
    return (
      <Modal
        disabled={isLoading}
        isOpen={paymentModal.isOpen}
        title="Payment Information"
        actionLabel="Submit Payment"
        onClose={paymentModal.onClose}
        onSubmit={handleSubmit(onSubmit)}
        body={bodyContent}
        footer={footerContent}
      />
    );
  };




export default PaymentModal;