'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';
import Heading from '../Heading';
import toast from 'react-hot-toast';
import useSearchingModal from '@/app/hooks/useSearchingModal';
import CheckoutPage from '../CheckoutPage'; // Adjust path as needed
import { Elements } from "@stripe/react-stripe-js"; 
import { loadStripe } from "@stripe/stripe-js";

const PaymentModal = () => {
  const paymentModal = usePaymentModal();
  const searchingModal = useSearchingModal();
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit } = useForm<FieldValues>();

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
  }

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  const amount = 19.99;

  const onSubmit: SubmitHandler<FieldValues> = () => {
    setIsLoading(true);

    toast.success('Payment Submitted');
    paymentModal.onClose();
    searchingModal.onOpen();

    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4 items-center p-2 sm:p-4">
      <Heading
        title="Payment Details"
        subtitle="Enter your payment information"
        className="text-center"
      />
      <div className="w-full max-w-sm bg-white shadow-md rounded-md p-4">
        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: Math.round(amount * 100),
            currency: "usd",
          }}
        >
          <CheckoutPage amount={amount} />
        </Elements>
      </div>
    </div>
  );

  const footerContent = (
    <div className="text-neutral-500 text-center font-light mt-2 p-1 text-sm">
      <p>Ensure your payment details are correct before submitting.</p>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={paymentModal.isOpen}
      title="Payment Information"
      actionLabel="Continue"
      onClose={paymentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default PaymentModal;
