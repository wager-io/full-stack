import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import sportsAPI from './api';

// Create the context
const SportContext = createContext();

// Custom hook to use the sport context
export const useSportContext = () => useContext(SportContext);

export const SportProvider = ({ children }) => {
  // Sports data states
  const [allSports, setAllSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [games, setGames] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  
  // UI states
  const [activeTab, setActiveTab] = useState('lobby');
  const [loading, setLoading] = useState({
    sports: false,
    leagues: false,
    games: false,
    liveGames: false,
    upcomingGames: false
  });
  const [error, setError] = useState({
    sports: null,
    leagues: null,
    games: null,
    liveGames: null,
    upcomingGames: null
  });
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sport: null,
    league: null,
    timeRange: 'all' // 'today', 'tomorrow', 'week', 'all'
  });

  // Fetch all sports
  const fetchAllSports = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, sports: true }));
      setError(prev => ({ ...prev, sports: null }));
      const data = await sportsAPI.getAllSports();
      setAllSports(data?.data);
    } catch (err) {
      console.error('Error fetching sports:', err);
      setError(prev => ({ ...prev, sports: err.message || 'Failed to load sports' }));
    } finally {
      setLoading(prev => ({ ...prev, sports: false }));
    }
  }, []);

  // Fetch leagues for a sport
  const fetchLeaguesBySport = useCallback(async (sportId) => {
    if (!sportId) return;
    try {
      const data = await sportsAPI.getLeaguesBySport(sportId);
      setLeagues(data?.data);
    } catch (err) {
      console.error(`Error fetching leagues for sport ${sportId}:`, err);
      setError(prev => ({ ...prev, leagues: err.message || 'Failed to load leagues' }));
    } finally {
      setLoading(prev => ({ ...prev, leagues: false }));
    }
  }, []);

  // Fetch games for a sport
  const fetchGamesBySport = useCallback(async (leagueID) => {
    if (!leagueID) return;
    
    try {
      setLoading(prev => ({ ...prev, games: true }));
      setError(prev => ({ ...prev, games: null }));
      
      const data = await sportsAPI.getEventGame(leagueID);
      setGames(data);
    } catch (err) {
      console.error(`Error fetching games for sport ${leagueID}:`, err);
      setError(prev => ({ ...prev, games: err.message || 'Failed to load games' }));
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, []);

  // Fetch games for a league
  const fetchGamesByLeague = useCallback(async (leagueId) => {
    if (!leagueId) return;
    
    try {
      setLoading(prev => ({ ...prev, games: true }));
      setError(prev => ({ ...prev, games: null }));
      
      const data = await sportsAPI.getGamesByLeague(leagueId);
      setGames(data);
    } catch (err) {
      console.error(`Error fetching games for league ${leagueId}:`, err);
      setError(prev => ({ ...prev, games: err.message || 'Failed to load games' }));
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, []);

  // Fetch live games
  const fetchLiveGames = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, liveGames: true }));
      setError(prev => ({ ...prev, liveGames: null }));
      
      const data = await sportsAPI.getLiveGames();
      setLiveGames(data);
    } catch (err) {
      console.error('Error fetching live games:', err);
      setError(prev => ({ ...prev, liveGames: err.message || 'Failed to load live games' }));
    } finally {
      setLoading(prev => ({ ...prev, liveGames: false }));
    }
  }, []);

  // Fetch upcoming games
  const fetchUpcomingGames = useCallback(async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, upcomingGames: true }));
      setError(prev => ({ ...prev, upcomingGames: null }));
      
      const data = await sportsAPI.getUpcomingGames(params);
      setUpcomingGames(data);
    } catch (err) {
      console.error('Error fetching upcoming games:', err);
      setError(prev => ({ ...prev, upcomingGames: err.message || 'Failed to load upcoming games' }));
    } finally {
      setLoading(prev => ({ ...prev, upcomingGames: false }));
    }
  }, []);

  // Select a sport and load its data
  const selectSport = useCallback((sport) => {
  }, [fetchLeaguesBySport, fetchGamesBySport]);

  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Apply filters to fetch appropriate data
    const params = {};
    if (newFilters.sport) params.sport = newFilters.sport;
    if (newFilters.league) params.league = newFilters.league;
    
    fetchUpcomingGames(params);
  }, [fetchUpcomingGames]);

  // Search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    // Implement search logic here if needed
  }, []);

  // Context value
  const contextValue = {
    // Data
    allSports,
    selectedSport,
    leagues,
    games,
    liveGames,
    upcomingGames,
    
    // UI state
    activeTab,
    setActiveTab,
    loading,
    error,
    
    // Search and filters
    searchQuery,
    filters,
    
    // Actions
    fetchAllSports,
    fetchLeaguesBySport,
    fetchGamesBySport,
    fetchGamesByLeague,
    fetchLiveGames,
    fetchUpcomingGames,
    selectSport,
    applyFilters,
    handleSearch,
    setSearchQuery
  };

  return (
    <SportContext.Provider value={contextValue}>
      {children}
    </SportContext.Provider>
  );
};

export default SportContext;