import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'

export default function Overview() {
  const location = useLocation();
    const navigate = useNavigate();
  const { user } = useContext(AuthContext)
  const [copied, setCopied] = useState(false)
  
  // Generate affiliate link based on username
  const baseUrl = window.location.origin; // Gets the current origin (e.g., http://localhost:3000 or https://azabets.com)
  const affiliateLink = user ? `${baseUrl}/?tab=register&modal=auth&ref=${user.affiliateCode || user.email.split('@')[0]}` : ''
  
  // Function to copy affiliate link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink)
      .then(() => {
        setCopied(true)
        toast.success('Affiliate link copied to clipboard!')
        setTimeout(() => setCopied(false), 3000)
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
        toast.error('Failed to copy link')
      })
  }

   // Handle register button click
  const handleRegisterClick = () => {
    navigate(`${location.pathname}?tab=register&modal=auth`);
  };

  // Handle login link click
  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate(`${location.pathname}?tab=login&modal=auth`);
  };


  return (
    <div className="flex-1">
            <div
              id="affiliate-hero-banner"
              className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg"
            >
              <div className="w-full flex flex-row p-4 justify-between gap-6">
                <div className="flex flex-col gap-6 max-w-[33.125rem]">
                  <div className="flex flex-col flex-2 gap-2">
                    <h2 className="text-white font-bold text-lg">
                      Refer and Earn Big With Our Affiliate Program
                    </h2>
                    <span className="text-[rgb(177,186,211)] text-sm">
                      Earn commission for all bets placed by your referrals across Casino and Sportsbook.
                    </span>
                  </div>
                  <div className="flex flex-row justify-between w-full gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold text-lg">
                        28.2M
                      </span>
                      <span className="text-[rgb(177,186,211)] text-sm">
                        Worldwide Customers
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold text-lg">
                        33
                      </span>
                      <span className="text-[rgb(177,186,211)] text-sm">
                        Payment Methods
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold text-lg">
                        16
                      </span>
                      <span className="text-[rgb(177,186,211)] text-sm">
                        Languages Supported
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex items-center min-w-[14rem] max-w-[14rem]">
                    <img
                      src="/assets/affiliate-icons/hero-image.webp"
                      alt="treasure box"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional rendering based on user authentication */}
            {!user ? (
              // Show login/register card for unauthenticated users
              <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <p className="text-[rgb(177,186,211)] text-sm max-w-[50rem]">
                    To register your interest in becoming a WAGER Affiliate, please login to your WAGER account. Don't have a WAGER account yet? Tap the 'Register' button below to get started.
                  </p>
                  <div className="flex gap-4">
                    {/* Login Button */}
                    <button onClick={handleLoginClick} className="bg-[#2f4553] text-white py-2 px-4 rounded shadow-lg hover:bg-gray-500">
                      Login
                    </button>
                    {/* Register Button */}
                    <button onClick={handleRegisterClick} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 whitespace-nowrap">
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Show affiliate link card for authenticated users
              <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-white font-bold text-lg">Your Affiliate Link</h3>
                  <p className="text-[rgb(177,186,211)] text-sm">
                    Share this link with friends and earn commission on their bets. You'll receive 25% of the house edge on all bets placed by your referrals.
                  </p>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <input 
                        type="text" 
                        value={affiliateLink}
                        readOnly
                        className="w-full bg-[#1a2c38] text-white py-2 px-4 rounded border border-[#2f4553] focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className={`${copied ? 'bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-6 rounded whitespace-nowrap transition-colors duration-300 flex items-center gap-2`}
                    >
                      {copied ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-[rgb(177,186,211)] text-xs">
                      <span className="text-yellow-400">Tip:</span> You can track the performance of your affiliate link in the "Campaigns" tab.
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* New Section Below */}
            <div className="w-full mt-8">
              {/* Section Title */}
              <h2 className="text-white font-bold text-2xl mb-4">
                Exclusive Advantages
              </h2>

              {/* Cards in a Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">Instant Payout</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      Skip the wait. See earnings instantly in your account.
                    </p>
                  </div>
                </div>

                {/* Second Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-3-3v6m9-6a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">Lifetime Commission</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      If the people you refer keep playing, you keep getting paid.
                    </p>
                  </div>
                </div>

                {/* Third Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h11M9 21V3m12 7h-3m0 0l-3 3m3-3l-3-3"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">Market Leading Player Value</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      Grow your earnings with some of the highest returns offered to players.
                    </p>
                  </div>
                </div>

                {/* Fourth Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 12v4m4-4h4m-12 0H4"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">Customise Your Commission</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      Tailor your commission plan to fit your unique business needs.
                    </p>
                  </div>
                </div>

                {/* Fifth Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 12v4m4-4h4m-12 0H4"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">Crypto & Local Currencies</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      Earn your way with support for both cryptocurrency and local currencies.
                    </p>
                  </div>
                </div>

                {/* Sixth Card */}
                <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg flex items-center gap-6">
                  {/* SVG Icon on the Left */}
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 12v4m4-4h4m-12 0H4"
                      />
                    </svg>
                  </div>

                  {/* Title and Details on the Right */}
                  <div>
                    <h3 className="text-white font-bold text-lg">24x7 Multi Language Support</h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      Get the help you want in your preferred language all day, everyday.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Section Below */}
            <div className="w-full mt-8">
              {/* Section Title */}
              <h2 className="text-white font-bold text-2xl mb-4">
                Commission Rules
              </h2>

              {/* Section Details */}
              <p className="text-[rgb(177,186,211)] text-sm">
                Our default commission rate is 10% but you can calculate specific rates for our products using the formulas below.
              </p>

              {/* New Card Below */}
              <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-600">
                  {/* First Section */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 64 64"
                        className="svg-icon"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <path d="M12.265 47.726.21 14.603a3.574 3.574 0 0 1 2.108-4.553l.024-.007 19.282-7.015a3.55 3.55 0 0 1 4.553 2.082l.008.024.694 1.92L12.69 46.073a9 9 0 0 0-.418 1.598zM63.79 15.511 48.002 58.93a3.53 3.53 0 0 1-4.558 2.1l.024.009-21.948-8.001a3.58 3.58 0 0 1-2.124-4.585l-.008.024 15.787-43.39a3.555 3.555 0 0 1 4.559-2.126l-.024-.008 21.948 8a3.58 3.58 0 0 1 2.124 4.585l.008-.024zM50.457 32.685l-1.386-3.254a1.79 1.79 0 0 0-2.333-.956l.012-.004-2.666 1.174a1.787 1.787 0 0 1-2.316-.948l-.004-.012-1.146-2.667a1.764 1.764 0 0 0-2.332-.93l.012-.004-3.28 1.386a1.74 1.74 0 0 0-.929 2.33l-.004-.01 3.92 9.255a1.816 1.816 0 0 0 2.359.928l-.012.005 9.227-3.947a1.737 1.737 0 0 0 .794-2.356l.004.01z"></path>
                      </svg>
                      Casino
                    </h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      All of our games have a different house edge. You can derive your commission using the following formula:
                    </p>
                    <div className="bg-[#1a2c38] text-[rgb(177,186,211)] text-sm p-3 mt-4 rounded">
                      (Edge as decimal * wagered / 2) * commission rate
                    </div>
                  </div>

                  {/* Second Section */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 96 96"
                        className="svg-icon"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <g fillRule="evenodd" clipRule="evenodd">
                          <path d="M86.68 76.32a48.2 48.2 0 0 0 7.96-17.16c-5.64.88-10.88 3-15.4 6.12 2.64 3.56 5.12 7.28 7.44 11.04m-23.56 17.2c6.84-2.28 12.96-6.04 18.04-10.88-2.48-4.16-5.12-8.24-8-12.12-5.72 6.12-9.44 14.12-10 23zm8.72-76.96c0 11.04-3.6 21.24-9.68 29.56 4.28 4.08 8.32 8.36 12.08 12.92 6.24-4.4 13.6-7.24 21.6-8.04.08-1 .16-1.96.16-3 0-18.32-10.28-34.24-25.36-42.32.76 3.52 1.2 7.16 1.2 10.88m-58.32-1.88c15.68 6.36 30.12 15.16 42.72 26.04 4.8-6.84 7.6-15.16 7.6-24.16 0-5.16-.96-10.12-2.68-14.68C56.96.68 52.56 0 48 0 34.44 0 22.24 5.64 13.52 14.68m8 52.24c-6.76 0-13.16-1.36-19.04-3.76C8.84 82.24 26.8 96.04 48 96.04c2.4 0 4.72-.24 7.04-.56.16-12.16 5.12-23.2 13.12-31.28-3.48-4.2-7.2-8.16-11.12-11.92-9.12 9.08-21.64 14.68-35.48 14.68z"></path>
                          <path d="M51.08 46.84A145.9 145.9 0 0 0 8.24 21.16C3.04 28.8 0 38.04 0 48c0 1.72.12 3.44.28 5.12 6.24 3.64 13.48 5.76 21.24 5.76 11.48 0 21.92-4.6 29.56-12.08z"></path>
                        </g>
                      </svg>
                      SportBook
                    </h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      All sports bets are applied at a 3% theoretical house edge. You can derive your commission using the following formula:
                    </p>
                    <div className="bg-[#1a2c38] text-[rgb(177,186,211)] text-sm p-3 mt-4 rounded">
                      (0.03 * wagered / 2) * commission rate
                    </div>
                  </div>

                  {/* Third Section */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 96 96"
                        className="svg-icon"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M47.55 3.327 89.72 45.5l-.003.003.01.01A19.82 19.82 0 0 1 96 60.004c0 10.98-8.899 19.878-19.878 19.878-5.713 0-10.866-2.412-14.5-6.282L47.548 59.527 33.488 73.59a19.82 19.82 0 0 1-13.61 5.388C8.898 78.977 0 70.077 0 59.098A19.8 19.8 0 0 1 5.377 45.5zm-.002 70.584L66.31 92.673H28.785z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Poker
                    </h3>
                    <p className="text-[rgb(177,186,211)] text-sm">
                      We collect a small percentage of each pot (known as Rake) as a fee for hosting the game. Your commission is calculated using Rake. You can use the formula below to derive your commission:
                    </p>
                    <div className="bg-[#1a2c38] text-[rgb(177,186,211)] text-sm p-3 mt-4 rounded">
                      Rake * commission rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Section Below */}
            <div className="w-full mt-8">
              {/* Section Title */}
              <h2 className="text-white font-bold text-2xl mb-4">
                Templates to Help Your Campaign Stand Out
              </h2>

              {/* Section Details */}
              <p className="text-[rgb(177,186,211)] text-sm">
                We’ve created digital banner templates to make it easier for you to promote your campaigns online.
              </p>

              {/* New Card Below */}
              <div className="w-full bg-[#213743] rounded-[0.5rem] p-2 mt-6">
                <img
                  src="/assets/affiliate-icons/WAGER-affiliate-overview-templates-en.avif"
                  alt="WAGER Affiliate Overview Templates"
                  className="w-full rounded-[0.5rem]"
                />
              </div>
            </div>
          </div>
  )
}
