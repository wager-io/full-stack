import React, { useState, useEffect } from 'react';
import { usePlinkoGame } from '../PlinkoContext';

// Sub-components for different dialog screens
export const DetailsScreen = ({ betID, onSetupSeeds }) => {
  const { getGameDetails } = usePlinkoGame();
  const [betDetails, setBetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const details = await getGameDetails(betID);
        setBetDetails(details);
      } catch (err) {
        setError(err.message || 'Failed to load bet details');
      } finally {
        setLoading(false);
      }
    };

    if (betID) {
      fetchDetails();
    }
  }, [betID, getGameDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!betDetails) {
    return (
      <div className="text-gray-400 p-4 text-center">
        <p>No details available for this bet.</p>
      </div>
    );
  }

  const { betLog, seedHistory } = betDetails;

  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">Bet Information</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Bet ID</p>
            <p className="text-white">{betLog.betId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Time</p>
            <p className="text-white">{new Date(betLog.betTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Player</p>
            <p className="text-white">{betLog.hidden ? 'Hidden' : betLog.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Bet Amount</p>
            <div className="flex items-center">
              <img src={betLog.currencyImage} alt="" className="h-5 w-5 mr-2" />
              <p className="text-white">{betLog.betAmount.toFixed(4)}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Multiplier</p>
            <p className="text-white">{betLog.multiplier.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Profit</p>
            <div className="flex items-center">
              <img src={betLog.currencyImage} alt="" className="h-5 w-5 mr-2" />
              <p className={betLog.won ? 'text-green-500' : 'text-red-500'}>
                {betLog.won ? '+' : ''}{betLog.profit.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-white text-lg font-bold mb-4">Fairness</h3>
        <div className="space-y-3 mb-6">
          <div>
            <p className="text-gray-400 text-sm">Server Seed</p>
            <p className="text-white break-all">
              {seedHistory.serverSeed || '****************************************'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Server Seed Hash</p>
            <p className="text-white break-all">{seedHistory.serverSeedHash}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Client Seed</p>
            <p className="text-white break-all">{seedHistory.clientSeed}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Nonce</p>
            <p className="text-white">{betLog.nonce}</p>
          </div>
        </div>

        <button 
          onClick={onSetupSeeds}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-full"
        >
          Setup Seeds
        </button>
      </div>
    </div>
  );
};

const SeedSettingScreen = ({ fromDetail, onClose }) => {
  const { updateSeeds, getUserSeeds } = usePlinkoGame();
  const [seeds, setSeeds] = useState(null);
  const [clientSeed, setClientSeed] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeeds = async () => {
      try {
        setLoading(true);
        const currentSeeds = await getUserSeeds();
        setSeeds(currentSeeds);
        setClientSeed(currentSeeds?.clientSeed || '');
      } catch (err) {
        setError(err.message || 'Failed to load seeds');
      } finally {
        setLoading(false);
      }
    };

    fetchSeeds();
  }, [getUserSeeds]);

  const handleUpdateSeeds = async () => {
    try {
      setUpdating(true);
      await updateSeeds(clientSeed);
      const updatedSeeds = await getUserSeeds();
      setSeeds(updatedSeeds);
      onClose({ detail: fromDetail });
    } catch (err) {
      setError(err.message || 'Failed to update seeds');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">Seed Settings</h3>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Server Seed Hash</p>
            <div className="bg-gray-700 p-3 rounded-lg break-all text-white">
              {seeds?.serverSeedHash || 'Not available'}
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-1">Client Seed</p>
            <input
              type="text"
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
              placeholder="Enter client seed"
            />
          </div>
          
          <div>
            <p className="text-gray-400 text-sm mb-1">Nonce</p>
            <div className="bg-gray-700 p-3 rounded-lg text-white">
              {seeds?.nonce || '0'}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => onClose({ detail: false })}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex-1"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdateSeeds}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex-1 disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Seeds'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HotKeys = () => {
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">Hot Keys</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Place Bet</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg text-white">Space</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Half Bet</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg text-white">↓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Double Bet</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg text-white">↑</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Min Bet</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg text-white">←</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Max Bet</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg text-white">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlinkoHelp = ({ onClick }) => {
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">Help</h3>
        
        <div className="space-y-3">
          <button 
            onClick={() => onClick({ detail: 'What Game Is This?' })}
            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex justify-between items-center"
          >
            <span>What Game Is This?</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={() => onClick({ detail: 'Fairness' })}
            className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex justify-between items-center"
          >
            <span>Fairness</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const PlinkoHelpAbout = () => {
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">About Plinko</h3>
        
        <div className="text-gray-300 space-y-4">
          <p>
            Plinko is a game of chance inspired by the pricing game featured on the American television game show "The Price Is Right".
          </p>
          <p>
            In our version, you drop a ball from the top of a triangle-shaped board filled with pegs. As the ball falls, it bounces off the pegs and eventually lands in one of the slots at the bottom, each with a different multiplier.
          </p>
          <p>
            You can choose between different risk levels (Low, Medium, High) which affect the potential payouts. Higher risk means higher potential rewards but lower chances of winning.
          </p>
        </div>
      </div>
    </div>
  );
};

const PlinkoHelpFairness = () => {
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-5">
        <h3 className="text-white text-lg font-bold mb-4">Fairness in Plinko</h3>
        
        <div className="text-gray-300 space-y-4">
          <p>
            Our Plinko game uses a provably fair system to ensure complete transparency and fairness in the game outcomes.
          </p>
          <p>
            Each game result is determined by a combination of:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Server Seed: A random string generated by our server</li>
            <li>Client Seed: A string that you can customize</li>
            <li>Nonce: A counter that increases with each bet</li>
          </ul>
          <p>
            These three values are combined and hashed to determine the path of the ball. You can verify any game result by checking the seeds and nonce used.
          </p>
          <p>
            The server seed is kept secret until you decide to change your seeds. At that point, the previous server seed is revealed, allowing you to verify that all your previous games were fair.
          </p>
          <p>
            Our house edge is 1%, which is built into the payout structure. This ensures that the game is sustainable while still offering competitive payouts.
          </p>
        </div>
      </div>
    </div>
  )
}       