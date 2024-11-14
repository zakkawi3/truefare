'use client';

import CheckoutPage from '../components/CheckoutPage'; // Adjust path as needed
import { Elements } from "@stripe/react-stripe-js"; 
import { loadStripe } from "@stripe/stripe-js"

const Checkout = () => {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined){
        throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
    }

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
    
    const amount = 19.99;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {/* The outer div ensures content is centered */}
            <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
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
};

export default Checkout;
