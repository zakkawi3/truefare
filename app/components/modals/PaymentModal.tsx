// 'use client';

// import { useState } from 'react';
// import {
//   FieldValues,
//   SubmitHandler,
//   useForm
// } from 'react-hook-form';

// import usePaymentModal from '@/app/hooks/usePaymentModal';
// import Modal from './Modal';
// import Heading from '../Heading';
// import Input from '../inputs/Input';
// import toast from 'react-hot-toast';
// import useSearchingModal from '@/app/hooks/useSearchingModal';

// const PaymentModal = () => {
//     const paymentModal = usePaymentModal();
//     const searchingModal = useSearchingModal();
//     const [isLoading, setIsLoading] = useState(false);
  
//     const {
//       register,
//       handleSubmit,
//       formState: { errors },
//     } = useForm<FieldValues>({
//       defaultValues: {
//         cardNumber: '',
//         expMonth: '',
//         expYear: '',
//         cvc: ''
//       }
//     });
  
//     const onSubmit: SubmitHandler<FieldValues> = () => {
//       setIsLoading(true);
  
//       // Display a success toast message and close the PaymentModal, then open the SearchingModal.
//       toast.success('Payment Submitted');
//       paymentModal.onClose();
//       searchingModal.onOpen();

//       setIsLoading(false);
//     };
  
//     const bodyContent = (
//       <div className="flex flex-col gap-6 items-center sm:items-stretch p-4">
//         <Heading
//           title="Payment Details"
//           subtitle="Enter your payment information"
//         />
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
//           <Input
//             id="cardNumber"
//             label="Card Number"
//             disabled={isLoading}
//             register={register}
//             errors={errors}
//             required
//           />
//           <Input
//             id="expMonth"
//             label="Exp Month"
//             disabled={isLoading}
//             register={register}
//             errors={errors}
//             required
//           />
//           <Input
//             id="expYear"
//             label="Exp Year"
//             disabled={isLoading}
//             register={register}
//             errors={errors}
//             required
//           />
//           <Input
//             id="cvc"
//             label="CVC"
//             disabled={isLoading}
//             register={register}
//             errors={errors}
//             required
//           />
//         </div>
//       </div>
//     );
  
//     const footerContent = (
//       <div className="text-neutral-500 text-center font-light mt-4 p-2">
//         <p>Ensure your payment details are correct before submitting.</p>
//       </div>
//     );
  
//     return (
//       <Modal
//         disabled={isLoading}
//         isOpen={paymentModal.isOpen}
//         title="Payment Information"
//         actionLabel="Submit Payment"
//         onClose={paymentModal.onClose}
//         onSubmit={handleSubmit(onSubmit)}
//         body={bodyContent}
//         footer={footerContent}
//       />
//     );
// };

// export default PaymentModal;

'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

import { toast } from 'react-hot-toast';
import usePaymentModal from '@/app/hooks/usePaymentModal';
import Modal from './Modal';
import Heading from '../Heading';
import useSearchingModal from '@/app/hooks/useSearchingModal';

const stripePromise = loadStripe(process.env.STRIPE_SECRET_KEY as string);


const PaymentModal = () => {
    const paymentModal = usePaymentModal();
    const searchingModal = useSearchingModal();
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // Fetch the Payment Intent client secret from the backend
            const response = await fetch('http://localhost:3000/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 2000, // Specify the amount in cents
                }),
            });

            const data = await response.json();
            const clientSecret = data.clientSecret;

            if (!clientSecret) {
                throw new Error('Failed to retrieve payment intent.');
            }

            // Load Stripe.js
            const stripe = await stripePromise;

            // Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret);

            if (result.error) {
                // Show error to the customer
                toast.error(`Payment failed: ${result.error.message}`);
            } else if (result.paymentIntent.status === 'succeeded') {
                // Show success message and close the PaymentModal, then open the SearchingModal
                toast.success('Payment successful');
                paymentModal.onClose();
                searchingModal.onOpen();
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-6 items-center sm:items-stretch p-4">
            <Heading
                title="Complete Your Payment"
                subtitle="Click below to pay securely with Stripe"
            />
            <button
                className="px-6 py-3 bg-blue-600 text-white rounded"
                onClick={handlePayment}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Pay with Stripe'}
            </button>
        </div>
    );

    return (
        <Modal
            disabled={isLoading}
            isOpen={paymentModal.isOpen}
            title="Payment"
            onClose={paymentModal.onClose}
            body={bodyContent}
        />
    );
};

export default PaymentModal;

