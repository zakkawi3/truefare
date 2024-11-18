'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';
import useSearchingModal from '@/app/hooks/useSearchingModal';
import { Lekton } from 'next/font/google';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

const PaymentModal: React.FC<{ pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number }> = ({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
}) => {
  const paymentModal = usePaymentModal();
  const searchingModal = useSearchingModal();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Fetch client secret for the Checkout Session
  const fetchClientSecret = useCallback(async (): Promise<void> => {
    if (clientSecret) {
      // Prevent multiple session creations
      console.log('Session already exists:', sessionId);
      return;
    }

    try {
      const res = await fetch(
        `https://octopus-app-agn55.ondigitalocean.app/riders/calculatePrice?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to calculate price');
      }

      const calculatedCost = data.price * 100; // Convert to cents
      console.log('Calculated cost FE:', calculatedCost);

      const response = await fetch('http://localhost:3000/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculatedCost,
        }),
      });

      const responseData = await response.json();
      console.log('Received client secret:', responseData.clientSecret);

      setClientSecret(responseData.clientSecret);
      setSessionId(responseData.sessionId);
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, sessionId]);

  // Fetch client secret only when the modal opens
  useEffect(() => {
    if (paymentModal.isOpen && !sessionId) {
      fetchClientSecret();
    }
  }, [paymentModal.isOpen, sessionId, fetchClientSecret]);

  // Handle payment success
  const handlePaymentSuccess = () => {
    console.log('Payment successful');
    searchingModal.onOpen();
    setSessionId(null); // Clear session ID for the next session
  };

  // Handle payment error
  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    toast.error(`Payment failed: ${error.message}`);
    setSessionId(null); // Clear session ID
  };

  // Polling function to check payment status
  const pollPaymentStatus = useCallback(async () => {
    try {
      if (!sessionId) return; // Check if sessionId is available

      const response = await fetch(`http://localhost:3000/payments/check-payment-status?sessionId=${sessionId}`);
      const data = await response.json();
      console.log('Received payment status:', data);

      if (data.paymentStatus === 'paid') {
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [sessionId, handlePaymentSuccess]);

  useEffect(() => {
    if (clientSecret) {
      const interval = setInterval(pollPaymentStatus, 3000); // Poll every 3 seconds
      return () => {
        clearInterval(interval); // Clear interval on unmount
        setClientSecret(null); // Clear clientSecret
        setSessionId(null); // Clear sessionId
      };
    }
  }, [clientSecret, pollPaymentStatus]);
  
  const handleCloseModal = () => {
    setClientSecret(null); // Clear clientSecret
    setSessionId(null); // Clear sessionId
    paymentModal.onClose(); // Close the modal
  };
  

  return (
<Modal
  isOpen={paymentModal.isOpen}
  title="Payment"
  onSubmit={paymentModal.onClose}
  onClose={handleCloseModal}
  actionLabel="Close"
>
  {clientSecret && paymentModal.isOpen && (
    <div className="flex flex-col gap-6 items-center sm:items-stretch p-4">
      <div className="w-full max-w-sm sm:max-w-xs mx-auto p-4">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout className="mx-auto" />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  )}
</Modal>

  );
};

export default PaymentModal;
