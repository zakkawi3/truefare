'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import usePaymentModal from '@/app/hooks/usePaymentModal';
import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import { BACKEND_URL } from '../../config/config';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

const PaymentModal: React.FC<{ pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }> = ({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
}) => {
  const paymentModal = usePaymentModal();
  const searchingModal = useSearchingModal();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionInProgress = useRef(false);

  const fetchClientSecret = useCallback(async (): Promise<void> => {
    if (sessionInProgress.current || clientSecret) return;

    sessionInProgress.current = true;

    try {
        const res = await fetch(
            `${BACKEND_URL}/riders/calculatePrice?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}`
          );
          const data = await res.json();
    
          if (!res.ok) {
            throw new Error(data.message || 'Failed to calculate price');
          }
    
          const calculatedCost = data.price * 100; // Convert to cents
    
      const response = await fetch(`${BACKEND_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: calculatedCost }),
      });

      const responseData = await response.json();
      setClientSecret(responseData.clientSecret);
      setSessionId(responseData.sessionId);
    } catch (error) {
      console.error('Error fetching session ID:', error);
    } finally {
      sessionInProgress.current = false;
    }
  }, [clientSecret]);

  useEffect(() => {
    console.log('PaymentModal isOpen:', paymentModal.isOpen);
    console.log('clientSecret:', clientSecret);
    if (paymentModal.isOpen && !clientSecret) {
      fetchClientSecret();
    }
  }, [paymentModal.isOpen, clientSecret, fetchClientSecret]);
  

  const handleCloseModal = () => {
    setClientSecret(null);
    setSessionId(null);
    paymentModal.onClose();
    searchingModal.onOpen();
  };

  return (
    <Modal
      isOpen={paymentModal.isOpen}
      title="Payment"
      actionLabel="Close" // Only for the Close button
      onSubmit={handleCloseModal}
      style={{maxHeight: '100vh', // Fixed max height for the modal
        maxWidth: '100%',}}
    >
      {clientSecret && (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </Modal>
  );
  
};

export default React.memo(PaymentModal);
