import React from 'react';
import Container from './Container'; // Assuming Container is in the same directory or adjust the import path as needed

const ContactUs = () => {
  return (
    <Container>
      <div className="text-center p-5" style={{ paddingTop: '100px' }}>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-lg">
            If you have any questions or concerns, please reach out to us here
        </p>
      </div>
    </Container>
  );
}

export default ContactUs;
