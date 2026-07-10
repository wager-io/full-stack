import React from 'react';
import './styles/Home.css';
import { IoSearch } from "react-icons/io5";

export default function Home({ onClose }) {
    
  return (
    <div className="home-container">
      <div className="home-bg-container">
        <img
          src="/6aef330c08558c4347f0d23ce04307cc.png"
          alt="Background"
          className="home-bg-image"
        />
      </div>

      <div className="home-header">
        <img
          src="https://res.cloudinary.com/dxwhz3r81/image/upload/v1714511848/Wager__wshh2r.png"
          className="home-logo"
          alt="Wager Logo"
        />
        <div className="home-right-header">
          <button className="home-close" onClick={onClose}>&times;</button>
        </div>
      </div>

     
      <div className="home-title">Hey there <span role="img" aria-label="wave">👋</span></div>
      <div className="home-subtitle">How can we help?</div>

      
      <div className="home-cards">
        <div className="home-card">
          <button className="home-card-title-button">
            What to do if you are unable to access your Two-Factor Authentication (2FA)?
          </button>
          <div className="home-card-desc">
            If you are unable to access your two-factor authentication...
          </div>
        </div>

        <div className="home-card">
          <button className="home-card-title-button">
            How to reset your password?
          </button>
          <div className="home-card-desc">
            1. If you've forgotten your password but have linked an email...
          </div>
        </div>
      </div>

     
      <div className="home-search">
        <input type="text" placeholder="Search for help" />
        <button className="home-search-btn">
          <IoSearch />
        </button>
      </div>
      
    </div>
  );
}
