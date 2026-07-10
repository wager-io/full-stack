import React from 'react'

export default function PromotionSection() {
  // Sample promotion data
  const promotions = [
    {
      id: 1,
      title: "Welcome Bonus",
      description: "Get up to $1000 on your first deposit",
      image: "/assets/trending-games/pro1.avif"
    },
    {
      id: 2,
      title: "Weekly Cashback",
      description: "10% cashback on all your losses",
      image: "/assets/trending-games/pro2.avif"
    },
    {
      id: 3,
      title: "VIP Program",
      description: "Exclusive rewards for our loyal players",
      image: "/assets/trending-games/pro3.avif"
    }
  ];

  return (
    <div className="pb-8 bg-[var(--card-bg-11)]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <svg fill="currentColor" viewBox="0 0 64 64" className="w-4 h-4 text mr-2">
              <path d="M28.652 60.5H11.883c-1.85 0-3.347-1.5-3.347-3.348V37.036c-1.85 0-3.348-1.5-3.348-3.348v-6.722c0-1.85 1.5-3.348 3.348-3.348h20.116zm26.812-36.884H35.347V60.5h16.768c1.85 0 3.349-1.5 3.349-3.348V37.036c1.85 0 3.348-1.5 3.348-3.348v-6.722c0-1.85-1.5-3.348-3.348-3.348zM45.417 3.5C38.006 3.5 32 9.508 32 16.918h13.417c1.85 0 3.349-1.5 3.349-3.348V6.848c0-1.85-1.5-3.348-3.349-3.348m-26.836 0c-1.85 0-3.347 1.5-3.347 3.348v6.722c0 1.85 1.5 3.348 3.347 3.348H32C32 9.506 25.99 3.5 18.58 3.5"></path>
            </svg>
            <h2 className="text-sm font-bold text-white">Promotions</h2>
          </div>
        </div>

        {/* Promotion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {promotions.map(promo => (
            <div 
              key={promo.id} 
              className="bg-[rgb(33,55,67)] rounded-[8px] shadow-md min-h-[150px] h-auto transform transition-all duration-300 hover:-translate-y-2 cursor-pointer flex overflow-hidden"
              style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)" }}
            >
              {/* Left side content */}
              <div className="flex-1 p-3 flex flex-col justify-center">
                <button className="bg-white text-[rgb(33,55,67)] text-[11px] font-bold py-[2px] px-2 rounded-[4px] w-fit mb-3">
                  PROMO
                </button>
                <h3 className="text-white font-bold text-lg mb-1">{promo.title}</h3>
                <p className="text-gray-300 text-sm mb-2">{promo.description}</p>
                {/* <a href="#" className="text-blue-400 text-sm font-bold hover:text-blue-300 transition-colors">
                  Read more
                </a> */}
              </div>
              
              {/* Right side image */}
              <div className="w-[120px] h-[120px] self-center mr-3">
                <img 
                  src={promo.image || "https://via.placeholder.com/120x120?text=Promotion"} 
                  alt={promo.title} 
                  className="w-full h-full object-cover rounded-[8px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
