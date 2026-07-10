import React, { useState } from 'react'

export default function FaqSection() {
  const [openCardId, setOpenCardId] = useState(null);

  const toggleCard = (cardId) => {
    setOpenCardId(prev => prev === cardId ? null : cardId);
  };

  const faqItems = [
    {
      id: 'card1',
      question: 'Who is WAGER?',
      answer: (
        <>
          <p className="mb-3">
          WAGER is a next-generation online gaming platform launched in 2023. We specialize in crypto-only betting and casino gaming, offering a secure, modern, and global experience. From sports and eSports to live casino and WAGER Originals, we bring players an all-in-one entertainment hub powered by cryptocurrency.
          </p>
       
        </>
      )
    },
    {
      id: 'card2',
      question: 'Is WAGER Licensed?',
      answer: (
        <>
          <p className="mb-3">
            Yes. WAGER operates on a fully licensed platform, ensuring fairness, transparency, and player protection across all games and bets.
          </p>
      
        </>
      )
    },
    {
      id: 'card3',
      question: 'Is Betting on WAGER Safe?',
      answer: (
        <>
          <p className="mb-3">
          Absolutely. With blockchain-backed transactions, advanced encryption, and strict platform security, your funds and personal information are always protected. Crypto deposits and withdrawals add an extra layer of safety, speed, and privacy.
          </p>
        </>
      )
    },
    {
      id: 'card4',
      question: 'What Currencies Can I Bet With?',
      answer: (
        <p>
         WAGER is 100% crypto-based. We support major cryptocurrencies, giving you fast deposits, instant play, and seamless withdrawals without banks or middlemen.
        </p>
      )
    },
    
  ];

  return (
    <div className="py-8 bg-[#1a2c38]">
      <div className="container mx-auto px-4">
        {/* Section Title with Icon */}
        <div className="flex items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white">Still Have Questions?</h2>
        </div>
        
        {/* FAQ Cards */}
        {faqItems.map((item) => (
          <div className="w-full mb-3" key={item.id}>
            <div
              className="bg-[rgb(33,55,67)] rounded-lg p-4 shadow-md cursor-pointer transition-all duration-300 hover:bg-[#213d4d]"
              onClick={() => toggleCard(item.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">{item.question}</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${openCardId === item.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              
              {/* Expandable content */}
              {openCardId === item.id && (
                <div className="mt-3 text-gray-300 text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
