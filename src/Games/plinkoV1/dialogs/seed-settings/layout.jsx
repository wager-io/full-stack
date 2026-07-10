import React, { useState, useEffect, useRef } from 'react';
import Loader from '../../../../components/Loader';
import { useFetchData } from '../../../../hooks/useFetchData';
import { useAuthToken } from '../../../../store/routes';
import { useErrorMessage } from '../../store';

const SeedSettingsLayout = ({ fromDetail = false, onClose }) => {
  const [gameSeeds, setGameSeeds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [clientSeeds, setClientSeeds] = useState('');
  const authToken = useAuthToken();
  const { setErrorMessage } = useErrorMessage();
  const fetchData = useFetchData();
  
  // Generate random string for client seed
  const generateString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  
  // Initialize client seed on component mount
  useEffect(() => {
    setClientSeeds(generateString(10));
  }, []);
  
  // Handle random seed generation
  const handleRandomSeed = () => {
    if (loading) return;
    setClientSeeds(generateString(10));
  };
  
  // Handle seed update
  const handleUpdateSeeds = async () => {
    if (!clientSeeds || clientSeeds.length < 10) {
      setErrorMessage("Client seed must have at least 10 characters");
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await fetchData(
        `/user/plinko-game/update-seeds`,
        { client_seed: clientSeeds },
        "POST",
        authToken
      );
      
      if (error) {
        throw new Error(error.response?.data?.message || error.message);
      } else {
        setErrorMessage("Seeds Updated!");
      }
      
      onClose(fromDetail);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch game seeds on component mount
  useEffect(() => {
    const fetchGameSeeds = async () => {
      try {
        const { data } = await fetchData(
          `/user/plinko-game/seeds`,
          null,
          "GET",
          authToken
        );
        setGameSeeds(data.seedHistory);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    
    fetchGameSeeds();
  }, [authToken, fetchData, setErrorMessage]);
  
  if (!gameSeeds) {
    return (
      <div style={{ height: '500px' }}>
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="seed-settings-dialog scroll-view">
      <div className="warn">
        You may use this function to set a new server seed + a new client seed,
        they can be randomly generated or customized (at least 10 characters), and
        the number of bets will be reset to zero.
      </div>
      
      <div className="detail-form">
        <div className="title">Current seeds</div>
        <div className="input-wrapper">
          <div className="input-label">Server Seed (hash)</div>
          <div className="input-control">
            <input type="text" readOnly value={gameSeeds.serverSeedHash} />
          </div>
        </div>
        
        <div className="form-flex">
          <div className="input-wrapper">
            <div className="input-label">Client Seed</div>
            <div className="input-control">
              <input type="text" readOnly value={gameSeeds.clientSeed} />
            </div>
          </div>
          
          <div className="input-wrapper">
            <div className="input-label">Nonce</div>
            <div className="input-control">
              <input type="text" readOnly value={gameSeeds.maxNonce} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="divider"></div>
      
      <div className="detail-form">
        <div className="title">New seeds</div>
        <div className="input-wrapper">
          <div className="input-label">Server Seed (hash)</div>
          <div className="input-control">
            <input
              type="text"
              placeholder="The seed hasn't been revealed yet"
              readOnly
              value={gameSeeds.nxt_hash}
            />
          </div>
        </div>
        
        <div className="form-flex">
          <div className="input-wrapper">
            <div className="input-label">Client Seed</div>
            <div className={`input-control ${isFocused ? 'is-focus' : ''}`}>
              <input
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
                type="text"
                readOnly={loading}
                disabled={loading}
                onChange={(e) => setClientSeeds(e.target.value)}
                value={clientSeeds}
              />
              <svg
                onClick={handleRandomSeed}
                xmlns="http://www.w3.org/1999/xlink"
                className="icon rotate-icon"
              >
                <use xlinkHref="#icon_Refresh"></use>
              </svg>
            </div>
          </div>
          
          <div className="input-wrapper">
            <div className="input-label">Nonce</div>
            <div className="input-control">
              <input type="text" readOnly value="0" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="submit">
        <button
          disabled={!clientSeeds || clientSeeds.length < 10 || loading}
          onClick={handleUpdateSeeds}
          className="button button-normal"
        >
          <div className="button-inner">
            {loading ? <Loader /> : "Use New Seeds"}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SeedSettingsLayout;