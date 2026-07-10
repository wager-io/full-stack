import React, { useState } from 'react';

const FairnessModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const renderOverview = () => (
    <div className="text-sm space-y-4 text-gray-300 p-6">
      <h3 className="text-base font-bold text-white">
        Solving the Trust Issue with Online Gambling
      </h3>
      <p>
        The underlying concept of provable fairness is that players have the
        ability to prove and verify that their results are fair and
        unmanipulated. This is achieved through the use of a{' '}
        <span className="font-bold text-white">commitment scheme</span>, along with
        cryptographic hashing.
      </p>
      <p>
        The commitment scheme is used to ensure that the player has an influence
        on all results generated. Cryptographic hashing is used to ensure that
        the casino also remains honest to this commitment scheme. Both concepts
        combined create a trust-less environment when gambling online.
      </p>

      <pre className="bg-[#111827] border border-[#374151] text-center text-white font-bold rounded-md py-3 px-4 overflow-x-auto">
        fair result = operators input (hashed) + customers input
      </pre>

      <button className="block mx-auto bg-[#374151] hover:bg-[#4b5563] text-white py-2 px-5 rounded-md transition text-sm font-medium">
        Learn More
      </button>
    </div>
  );

  const renderSeeds = () => (
    <div className="text-sm text-gray-300 p-6 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-white font-semibold block mb-1">Active Client Seed</label>
          <input
            type="text"
            value="db3b75fba7ec7489"
            readOnly
            className="w-full bg-[#111827] border border-[#374151] rounded-md px-3 py-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="text-white font-semibold block mb-1">Active Server Seed (Hashed)</label>
          <input
            type="text"
            value="8cd4903a0a072e8f705968bffb6efadb557cfb710a97390f0068b"
            readOnly
            className="w-full bg-[#111827] border border-[#374151] rounded-md px-3 py-2 text-white text-sm"
          />
        </div>

        <div>
          <label className="text-white font-semibold block mb-1">Total bets made with pair</label>
          <input
            type="text"
            value="1"
            readOnly
            className="w-full bg-[#111827] border border-[#374151] rounded-md px-3 py-2 text-white text-sm"
          />
        </div>
      </div>

      <div className="border-t border-[#374151] pt-4">
        <h4 className="text-white font-bold mb-2">Rotate Seed Pair</h4>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value="CKqCWYJ8N8"
            className="flex-1 bg-[#111827] border border-[#374151] rounded-md px-3 py-2 text-white text-sm"
            readOnly={false}
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium">
            Change
          </button>
        </div>

        <div className="mt-3">
          <label className="text-white font-semibold block mb-1">Next Server Seed (Hashed)</label>
          <input
            type="text"
            value="0c17203a748a3cd98a6a08f349f895d9e09b3788eed0c98bf454"
            readOnly
            className="w-full bg-[#111827] border border-[#374151] rounded-md px-3 py-2 text-white text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="text-sm space-y-4 text-gray-300 p-6">
      <div className="text-center text-gray-400 py-4">
        More inputs are required to verify result
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game
          </label>
          <select className="w-full bg-[#1a232e] border border-[#374151] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="keno">Keno</option>
            <option value="dice">Dice</option>
            <option value="plinko">Plinko</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Client Seed
          </label>
          <input
            type="text"
            className="w-full bg-[#1a232e] border border-[#374151] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter client seed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Server Seed
          </label>
          <input
            type="text"
            className="w-full bg-[#1a232e] border border-[#374151] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter server seed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nonce
          </label>
          <div className="relative">
            <input
              type="number"
              defaultValue="0"
              className="w-full bg-[#1a232e] border border-[#374151] rounded-md px-3 py-2 pr-16 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-0 top-0 h-full flex flex-col border-l border-[#374151]">
              <button className="flex-1 px-3 text-gray-400 hover:text-white hover:bg-[#374151] transition-colors rounded-tr-md">
                ▲
              </button>
              <button className="flex-1 px-3 text-gray-400 hover:text-white hover:bg-[#374151] transition-colors rounded-br-md border-t border-[#374151]">
                ▼
              </button>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#374151] hover:bg-[#4b5563] text-white py-3 rounded-md font-medium text-sm transition-colors">
          View Calculation Breakdown
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#1f2a37] text-white w-[500px] max-h-[90vh] rounded-xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <span className="text-xl font-bold flex items-center gap-2">⚖️ Fairness</span>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-gray-300 leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex bg-[#111827] rounded-full p-1 mx-6 mt-4 mb-5">
          {['overview', 'seeds', 'verify'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 text-sm font-semibold rounded-full transition ${
                activeTab === tab
                  ? 'bg-[#1e3a8a] text-white'
                  : 'hover:bg-[#374151] text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'seeds' && renderSeeds()}
          {activeTab === 'verify' && renderVerify()}
        </div>
      </div>
    </div>
  );
};

export default FairnessModal;
