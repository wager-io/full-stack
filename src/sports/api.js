import axios from 'axios';
import { serverUrl } from '../utils/api';

class SportsAPI {
  constructor() {
    this.baseURL = `${serverUrl()}/api/sport`;
    this.axios = axios;
  }

  /**
   * Get all sports
   * @returns {Promise<Array>} List of all sports
   */
  async getAllSports() {
    try {
      const response = await this.axios.get(`${this.baseURL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all sports:', error);
      throw error;
    }
  }

  /**
   * Get specific sport by ID
   * @param {string} sportId - Sport ID
   * @returns {Promise<Object>} Sport details
   */
  async getSportById(sportId) {
    try {
      const response = await this.axios.get(`${this.baseURL}/${sportId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sport ${sportId}:`, error);
      throw error;
    }
  }

  /**
   * Get leagues for a specific sport
   * @param {string} sportId - Sport ID
   * @returns {Promise<Array>} List of leagues
   */
  async getLeaguesBySport(sportId) {
    try {
      const response = await this.axios.get(`${this.baseURL}/${sportId}/leagues`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leagues for sport ${sportId}:`, error);
      throw error;
    }
  }

  /**
   * Get games for a specific sport
   * @param {string} sportId - Sport ID
   * @returns {Promise<Array>} List of games
   */
  async getGamesBySport(sportId) {
    try {
      const response = await this.axios.get(`${this.baseURL}/${sportId}/games`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching games for sport ${sportId}:`, error);
      throw error;
    }
  }

    /**
   * Get games for a specific sport
   * @param {string} sportId - Sport ID
   * @returns {Promise<Array>} List of games
   */
  async getEventGame(leagueID) {
    try {
      const response = await this.axios.get(`${this.baseURL}/event/${leagueID}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching games for sport ${leagueID}:`, error);
      throw error;
    }
  }

  /**
   * Get games for a specific league
   * @param {string} leagueId - League ID
   * @returns {Promise<Array>} List of games
   */
  async getGamesByLeague(leagueId) {
    try {
      const response = await this.axios.get(`${this.baseURL}/league/${leagueId}/games`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching games for league ${leagueId}:`, error);
      throw error;
    }
  }

  /**
   * Get odds for a specific game
   * @param {string} gameId - Game ID
   * @returns {Promise<Object>} Game odds
   */
  async getGameOdds(gameId) {
    try {
      const response = await this.axios.get(`${this.baseURL}/game/${gameId}/odds`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching odds for game ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Get live games
   * @returns {Promise<Array>} List of live games
   */
  async getLiveGames() {
    try {
      const response = await this.axios.get(`${this.baseURL}/games/live`);
      return response.data;
    } catch (error) {
      console.error('Error fetching live games:', error);
      throw error;
    }
  }

  /**
   * Get upcoming games
   * @param {Object} params - Query parameters (sport, league, limit)
   * @returns {Promise<Array>} List of upcoming games
   */
  async getUpcomingGames(params = {}) {
    try {
      const response = await this.axios.get(`${this.baseURL}/games/upcoming`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const sportsAPI = new SportsAPI();
export default sportsAPI;