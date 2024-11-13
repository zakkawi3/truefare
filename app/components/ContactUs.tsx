import React from 'react';
import Image from 'next/image';  // Import Next.js Image component
import Container from './Container';

const ContactUs = () => {
  const team = [
    {
      name: "Nikhil Vyas",
      email: "nvyas30@gatech.edu",
      role: "Co-founder",
      image: "/images/nikhilvyas.png"
    },
    {
      name: "Arpan Banerjee",
      email: "abanerjee312@gatech.edu",
      linkedin: "https://www.linkedin.com/in/arpan-banerjee-945086284/",
      role: "Co-founder",
      image: "/images/arpanbanerjee.png"
    },
    {
      name: "Majd Khawaldeh",
      email: "majd@gatech.edu",
      linkedin: "https://www.linkedin.com/in/majdkhawaldeh/",
      role: "Co-founder",
      image: "/images/majdkhawaldeh.png"
    },
    {
      name: "Muqadar Sarwary",
      email: "msarwary3@gatech.edu",
      linkedin: "https://www.linkedin.com/in/muqadar/",
      role: "Co-founder",
      image: "/images/muqadarsarwary.png"
    },
    {
      name: "Zaid Akkawi",
      email: "zakkawi3@gatech.edu",
      role: "Co-founder",
      image: "/images/zaidakkawi.png"
    },
    {
      name: "Rohit George",
      email: "rgeorge62@gatech.edu",
      role: "Co-founder",
      image: "/images/rohitgeorge.png"
    },
    {
      name: "Nimai Patel",
      email: "npatel642@gatech.edu",
      role: "Co-founder",
      image: "/images/nimaipatel.png"
    }
  ];

  return (
    <Container>
      <div className="max-w-6xl mx-auto" style={{ paddingTop: '100px' }}>
        {/* Header Section */}
        <div className="text-center p-5 mb-12">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-700">
            If you have any questions or concerns, please reach out to us here
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {team.map((member, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image Container */}
              <div className="w-full h-auto">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={400}     // Specify width for the Image component
                  height={400}    // Specify height for the Image component
                  className="w-full max-h-[400px] object-contain"
                />
              </div>

              {/* Content Container */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-600 mb-4">{member.role}</p>
                
                {/* Contact Links */}
                <div className="space-y-3">
                  <a 
                    href={`mailto:${member.email}`}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {member.email}
                  </a>
                  
                  {member.linkedin && (
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* General Contact Section */}
        <div className="mt-16 mb-8 text-center px-4">
          <div className="bg-blue-50 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
            <p className="text-gray-700 mb-6">
              Have questions about our platform or interested in becoming a driver? 
              We&apos;d love to hear from you!
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Send Us a Message
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default ContactUs;
