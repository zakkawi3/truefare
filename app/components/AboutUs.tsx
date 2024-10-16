import React from 'react';
import Container from './Container'; // Assuming Container is in the same directory or adjust the import path as needed

const AboutUs = () => {
  return (
    <Container>
      <div className="text-center p-5" style={{ paddingTop: '100px' }}>
        <h1 className="text-3xl font-bold">About Us</h1>
        <p className="mt-2 text-lg">
          At TrueFare, we are committed to our drivers and give them the fare they rightfully deserve
        </p>
      </div>
    </Container>
  );
}

export default AboutUs;
