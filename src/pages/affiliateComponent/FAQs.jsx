import React from 'react'

export default function FAQs() {
  return (
    <div className="flex-1">
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg">
        <h2 className="text-white font-bold text-xl mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">How does the affiliate program work?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Our affiliate program allows you to earn a commission for referring new users to our platform. You'll receive 25% of the house edge on all bets placed by your referred users, for as long as they continue to play.
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">How is my commission calculated?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Your commission is calculated as 25% of the house edge on all bets placed by your referred users. The house edge varies by game, but typically ranges from 1% to 5%. For example, if a referred user places a $100 bet on a game with a 2% house edge, you would earn $0.50 (25% of $2).
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">When can I withdraw my commission?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              You can withdraw your commission at any time, as long as you have at least $10 in your affiliate balance. Withdrawals are processed instantly to your main wallet.
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">Can I have multiple affiliate campaigns?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              Yes, you can create multiple campaigns to track the performance of different marketing channels or strategies. Each campaign will have its own unique referral link.
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">What promotional materials are available?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              We provide a variety of promotional materials including banners, logos, and text links. You can find these in the "Marketing Tools" section of your affiliate dashboard.
            </p>
          </div>
          
          <div className="bg-[#1a2c38] p-4 rounded-lg">
            <h3 className="text-white font-bold text-lg mb-2">Is there a limit to how much I can earn?</h3>
            <p className="text-[rgb(177,186,211)] text-sm">
              No, there is no limit to how much you can earn through our affiliate program. Your earnings are directly proportional to the activity of your referred users.
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-[#213743] rounded-[0.5rem] p-6 shadow-lg mt-6">
        <h2 className="text-white font-bold text-xl mb-4">Still Have Questions?</h2>
        
        <p className="text-[rgb(177,186,211)] text-sm mb-4">
          If you couldn't find the answer to your question in our FAQ, please contact our support team. We're available 24/7 to assist you with any inquiries about our affiliate program.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Contact Support
          </button>
          <button className="bg-[#2f4553] text-white py-2 px-4 rounded shadow-lg hover:bg-gray-500">
            View Affiliate Terms
          </button>
        </div>
      </div>
    </div>
  )
}