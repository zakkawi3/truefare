'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';
import Heading from '../Heading';
import useSearchingModal from '@/app/hooks/useSearchingModal';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

const PaymentModal: React.FC<{ pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number }> = ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
  const paymentModal = usePaymentModal();
  const searchingModal = useSearchingModal();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // New state for session ID

  // Fetch client secret for the Checkout Session
  const fetchClientSecret = useCallback(async (): Promise<void> => {
    try {
      // Get the calculated amount from the backend
      const res = await fetch(`https://octopus-app-agn55.ondigitalocean.app/riders/calculatePrice?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to calculate price');
      }

      const calculatedCost = data.price * 100; // Convert to cents
      console.log('Calculated cost:', calculatedCost);

      const response = await fetch('http://localhost:3000/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculatedCost, // Use the calculated amount in cents
        }),
      });

      const responseData = await response.json();
      console.log('Received client secret:', responseData.clientSecret);
      setClientSecret(responseData.clientSecret);
      setSessionId(responseData.sessionId); // Store session ID
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Fetch client secret on component mount
  useEffect(() => {
    fetchClientSecret();
  }, [fetchClientSecret]);

  // Handle payment success
  const handlePaymentSuccess = () => {
    toast.success('Payment successful');
    console.log('Payment successful');
    paymentModal.onClose();
    searchingModal.onOpen();
    setSessionId(null); // Clear session ID
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
      return () => clearInterval(interval); // Clear the interval when component unmounts
    }
  }, [clientSecret, pollPaymentStatus]);

  return (
    <Modal
      isOpen={paymentModal.isOpen}
      onClose={paymentModal.onClose}
      title="Payment"
      onSubmit={paymentModal.onClose} // Close the modal on submit
      actionLabel="Close" // Provide a label for the action button
    >
      <div className="flex flex-col gap-6 items-center sm:items-stretch p-4">
        <Heading
          title="Complete Your Payment"
          subtitle="Please complete your payment below"
        />
        {clientSecret && (
          <div className="w-full max-w-sm sm:max-w-xs mx-auto p-4"> {/* Updated max-width and responsive adjustments */}
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
              onComplete={handlePaymentSuccess}
              onError={handlePaymentError}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;