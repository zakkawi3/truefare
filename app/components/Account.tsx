'use client';

import React, { useState } from 'react';
import Container from './Container';

const Account = () => {
  const [selectedPlan, setSelectedPlan] = useState(null); // No plan selected initially
  const monthlyPrice = 100;
  const annualPrice = (monthlyPrice * 12) * 0.85; // 15% discount

  // Function to handle plan selection
  const handlePlanSelection = (plan) => setSelectedPlan(plan);

  // Function to reset the selection
  const handleChangeSubscription = () => setSelectedPlan(null);

  return (
    <Container>
      <div className="max-w-4xl mx-auto" style={{ paddingTop: '100px' }}>
        {/* Hero Section */}
        <div className="text-center p-5 mb-12">
          <h1 className="text-3xl font-bold mb-6">Account</h1>
          <h2 className="text-xl mb-6">Choose Your Subscription Plan</h2>
          
          {/* Subscription Options */}
          <div className="flex flex-col items-center gap-4">
            {/* Only show options if no plan is selected */}
            {!selectedPlan && (
              <>
                {/* Monthly Plan */}
                <div 
                  className="p-6 border rounded-lg w-full max-w-md bg-gray-100 cursor-pointer"
                  onClick={() => handlePlanSelection('monthly')}
                >
                  <h3 className="text-2xl font-semibold">Monthly</h3>
                  <p className="text-lg">${monthlyPrice} / month</p>
                </div>
                
                {/* Annual Plan */}
                <div 
                  className="p-6 border rounded-lg w-full max-w-md bg-gray-100 cursor-pointer"
                  onClick={() => handlePlanSelection('annual')}
                >
                  <h3 className="text-2xl font-semibold">Annual</h3>
                  <p className="text-lg">${annualPrice.toFixed(2)} / year (15% off)</p>
                </div>
              </>
            )}

            {/* Display selected plan only */}
            {selectedPlan && (
              <div 
                className="p-6 border rounded-lg w-full max-w-md bg-green-200"
              >
                <h3 className="text-2xl font-semibold">
                  {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}
                </h3>
                <p className="text-lg">
                  ${selectedPlan === 'monthly' ? monthlyPrice : annualPrice.toFixed(2)} / {selectedPlan}
                </p>
              </div>
            )}
          </div>

          {/* Display Selected Plan */}
          {selectedPlan && (
            <div className="mt-8">
              <p className="text-lg">
                Selected Plan: <span className="font-semibold">
                  {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'}
                </span>
              </p>
            </div>
          )}

          {/* Show "Change Subscription" button only if a plan is selected */}
          {selectedPlan && (
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleChangeSubscription}
            >
              Change Subscription
            </button>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Account;
