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
      <div className="flex flex-col gap-4">
        <Heading 
          title="Enter Payment Details"
          subtitle="Complete your payment information"
        />
        <Input 
          id="cardNumber"
          label="Card Number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input 
          id="expMonth"
          label="Expiration Month"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input 
          id="expYear"
          label="Expiration Year"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Input 
          id="cvc"
          label="CVC"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  
    const footerContent = (
      <div className="flex flex-col gap-4 mt-4">
        <div className="text-neutral-500 text-center mt-4 font-light">
          <div>Make sure your payment details are correct before submitting.</div>
        </div>
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