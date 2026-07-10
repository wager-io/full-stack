import React from 'react'

export default function Privacy() {
  
  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    height: '90vh',
    maxHeight: "90vh",
    overflowY: "scroll",
  };

  const headingStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '30px',
    marginBottom: '10px',
    color: 'white',
    textAlign: 'center'
  };

  const subHeadingStyle = {
    fontSize: '17px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px',
    color: 'white',
  };

  const emailStyle = {
    color: '#0066cc',
    textDecoration: 'underline',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Privacy Policy</h2>
      <p>This is the privacy policy of Medium Rare N.V. (owner and operator of Stake.) ...</p>

      <h3 style={subHeadingStyle}>1. Website Use</h3>
      <p>In using the website, you agree to be bound by the terms of this Privacy Policy. Stake.com may review ...</p>

      <h3 style={subHeadingStyle}>2. Personal Information</h3>
      <p>The kinds of Personal Information that Stake.com may process about you is:</p>
      <ul>
        <li>Name</li>
        <li>Email Address</li>
        <li>Personally Submitted Preferences</li>
        <li>Date of Birth</li>
        <li>Country of Citizenship</li>
        <li>Physical Address</li>
        <li>Identification Number</li>
        <li>Government Issued Identification</li>
        <li>Location Data</li>
        <li>Device Information</li>
        <li>IP Address</li>
        <li>And more...</li>
      </ul>

      <h3 style={subHeadingStyle}>3. Data Processing Purposes</h3>
      <p>Stake.com will process your Personal Information only by lawful and fair means...</p>

      <h3 style={subHeadingStyle}>4. Direct Marketing and Opting Out</h3>
      <p>From time to time we may use your Personal Information to inform you about our products...</p>

      <h3 style={subHeadingStyle}>5. Management and Sharing of your Personal Information</h3>
      <p>Stake.com will take all reasonable steps to ensure that the Personal Information...</p>

      <h3 style={subHeadingStyle}>6. Security of Personal Information</h3>
      <p>You acknowledge that no data transmission over the Internet is totally secure...</p>

      <h3 style={subHeadingStyle}>7. Access to Personal Information</h3>
      <p>You may access the Personal Information collected by Stake.com by contacting us at <a style={emailStyle} href="mailto:support@stake.com">support@stake.com</a>.</p>

      <h3 style={subHeadingStyle}>8. Delete Personal Data</h3>
      <p>You can request to have your personal data deleted...</p>

      <h3 style={subHeadingStyle}>9. Contact Details</h3>
      <p>If you have any queries, contact us at <a style={emailStyle} href="mailto:support@stake.com">support@stake.com</a>.</p>

      <h3 style={subHeadingStyle}>10. International Data Transfers</h3>
      <p>All information processed by us may be transferred, processed, and stored anywhere in the world...</p>

      <h3 style={subHeadingStyle}>11. Legal Basis for Processing</h3>
      <p>For purposes of the EU General Data Protection Regulation...</p>

      <h3 style={subHeadingStyle}>12. Supervisor Authority</h3>
      <p>If you are located in the European Economic Area, you have the right to lodge a complaint...</p>

      <h3 style={subHeadingStyle}>13. Updates to this Privacy Policy</h3>
      <p>Stake.com may review, change and update this Privacy Policy from time to time...</p>
    </div>
  );
}

