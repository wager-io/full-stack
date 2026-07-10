import React from 'react'

export default function CookiesPolicy() {
  
  const containerStyle = {
    padding: '30px',
    maxWidth: '1000px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif',
   
    lineHeight: '1.6',
    fontSize: '16px',
    maxHeight: "90vh",
    overflowY: "scroll",
  };

  const headingStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: 'white',
    textAlign: 'center',
  };

  const subHeadingStyle = {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: '20px',
    marginBottom: '10px',
    color: 'white',
  };

  const paragraphStyle = {
    marginBottom: '15px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Social Media Platforms</h2>

      <p style={paragraphStyle}>
        Communication, engagement and actions taken through external social media platforms that this website and its owners participate on are custom to the terms and conditions as well as the privacy policies held with each social media platform respectively.
      </p>

      <p style={paragraphStyle}>
        Users are advised to use social media platforms wisely and communicate / engage upon them with due care and caution in regard to their own privacy and personal details. This website nor its owners will ever ask for personal or sensitive information through social media platforms and encourage users wishing to discuss sensitive details to contact them through primary communication channels such as by telephone or email.
      </p>

      <p style={paragraphStyle}>
        This website may use social sharing buttons which help share web content directly from web pages to the social media platform in question. Users are advised before using such social sharing buttons that they do so at their own discretion and note that the social media platform may track and save your request to share a web page respectively through your social media platform account.
      </p>

      <h3 style={subHeadingStyle}>Shortened Links in Social Media</h3>

      <p style={paragraphStyle}>
        This website and its owners through their social media platform accounts may share web links to relevant web pages.
      </p>

      <p style={paragraphStyle}>
        Users are advised to take caution and good judgement before clicking any shortened urls published on social media platforms by this website and its owners. Despite the best efforts to ensure only genuine urls are published, many social media platforms are prone to spam and hacking and therefore this website and its owners cannot be held liable for any damages or implications caused by visiting any shortened links.
      </p>
    </div>
  );
}

