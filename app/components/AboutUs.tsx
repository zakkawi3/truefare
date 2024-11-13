import React from 'react';
import Container from './Container';

const AboutUs = () => {
  return (
    <Container>
      <div className="max-w-4xl mx-auto" style={{ paddingTop: '100px' }}>
        {/* Hero Section */}
        <div className="text-center p-5 mb-12">
          <h1 className="text-3xl font-bold mb-6">About Us</h1>
          <p className="text-lg text-gray-700">
            At TrueFare, we are committed to our drivers and give them the fare they rightfully deserve.
            Remember when ridesharing was about connecting drivers with riders? So do we. 
            That&apos;s why we&apos;re bringing the sharing economy back to its roots.
          </p>
        </div>

        {/* Reality Section */}
        <div className="rounded-lg shadow-md p-6 mb-8 bg-red-50">
          <h2 className="text-2xl font-bold mb-4">The Reality of Modern Rideshare</h2>
          <div className="space-y-4">
            <p className="text-gray-700">The numbers tell the story:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Uber takes up to 45% of each fare, with drivers reporting average commission rates of 25-30%</li>
              <li>In 2023, Uber&apos;s revenue hit $37.3 billion – mostly from driver commissions</li>
              <li>72% of drivers say they&apos;re earning less than in previous years</li>
              <li>A 2023 study found that after expenses, rideshare drivers often earn below minimum wage</li>
            </ul>
            <p className="mt-4 text-gray-700">
              When you pay $20 for a ride, up to $9 goes straight to corporate profits. 
              The driver? They&apos;re left covering gas, maintenance, and depreciation out of what remains.
            </p>
          </div>
        </div>

        {/* Solution Section */}
        <div className="rounded-lg shadow-md p-6 mb-8 bg-green-50">
          <h2 className="text-2xl font-bold mb-4">Our Solution: Simple & Fair</h2>
          <p className="text-gray-700 mb-4">
            We flipped the script. No commission fees. No sneaky surcharges. No percentage cuts.
          </p>
          <p className="text-gray-700 font-semibold">
            Just a simple monthly subscription fee for drivers, and that&apos;s it. 
            Every dollar you pay for your ride goes directly to your driver. Period.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Why This Works Better</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">For Drivers</h3>
              <p className="text-gray-700">
                Keep 100% of what you earn. Based on average rideshare driver earnings of $37,500/year, 
                our model could save drivers over $11,000 annually in commission fees.
              </p>
            </div>
            <div className="rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">For Riders</h3>
              <p className="text-gray-700">
                Lower fares, happier drivers. When drivers keep their full earnings, 
                they can afford to charge you less while making more themselves. 
                With traditional services raising prices by 30% since 2019, 
                our model offers a sustainable alternative.
              </p>
            </div>
          </div>
        </div>

        {/* Promise Section */}
        <div className="rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Promise</h2>
          <p className="text-gray-700 mb-4">
            We&apos;re not here to become another tech giant. We&apos;re here to fix a broken system. 
            No venture capital feeding frenzy, no race to monopoly, no squeezing drivers until they break.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold mb-2">The math is simple:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Traditional model: $100 fare = $40-60 to driver</li>
              <li>Our model: $100 fare = $100 to driver - small monthly subscription</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Join the Revolution</h2>
          <p className="text-gray-700 mb-6">
            Whether you&apos;re a rider tired of inflated prices or a driver tired of watching 
            your earnings evaporate, you&apos;re in the right place.
          </p>
          <p className="text-gray-700 mb-8">
            Because sometimes the best disruption isn&apos;t about reinventing the wheel. 
            It&apos;s about giving it back to the people who make it turn.
          </p>
        </div>

        {/* Sources */}
        <footer className="text-sm text-gray-500 border-t pt-4 mb-8">
          <p>
            Sources: 
            Business of Apps, Uber Investor Relations, Ridester Driver Survey, 
            The Guardian, ZipRecruiter, Bloomberg
          </p>
        </footer>
      </div>
    </Container>
  );
}

export default AboutUs;
