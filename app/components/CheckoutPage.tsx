'use client';

import React, { useEffect, useState } from "react";
import {
    useStripe,
    useElements,
    PaymentElement,
} from "@stripe/react-stripe-js";

const CheckoutPage = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" // Fix content type
            },
            body: JSON.stringify({ amount: Math.round(amount * 100) }),
        })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }, [amount]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) return;

        const {error: submitError} = await elements.submit();

        if (submitError) {
            setErrorMessage(submitError.message);
            setLoading(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: "http://localhost:3000/ride", // Add query parameter for payment status
            },
        });

        if (error) {
            console.error("Payment failed:", error.message);
        }

        setLoading(false);
    };

    if (!clientSecret || !stripe || !elements) {
        return (
            <div className="flex items-center justify-center">
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                    role="status"
                >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }
    

    return (
        <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
            {clientSecret && <PaymentElement />}
            <button
                disabled={!stripe || loading}
                className="w-full mt-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
            >
                {!loading ? `Pay $${amount}` : "Processing..."}
            </button>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </form>
    );
};

export default CheckoutPage;
