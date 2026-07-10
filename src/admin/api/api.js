import api from './axios';
import {toast} from 'sonner';

class ApiService {
constructor(apiInstance) {
    this.api = apiInstance;
}
 async getUserById(userId) {
    try {
      const response = await api.get(`/api/admin/get-user-by-id/${userId}`);
      return response;
    } catch (error) {
      toast.error( error);
      throw error;
    }
  }
  async getAllUsers(page = 1, limit = 10) {
        try {
        const response = await api.get(`/api/admin/get-all-users?limit=${limit}&page=${page}`);
        return response;
        } catch (error) {
        console.error( error);
        throw error;
    }
  }

  async getTasks(page = 1, limit = 10) {
    try {
      const response = await api.get(`/api/admin/get-tasks?limit=${limit}&page=${page}`);
      return response;
    } catch (error) {
      console.error( error);
      throw error;
    }
  }
  async createTask(data) {
    try {
      const response = await api.post(`/api/admin/create-task`, data);
      return response;
    } catch (error) {
      console.error( error);
      throw error;
    }
  }
  async editTask(taskId, data) {
    try {
      const response = await api.patch(`/api/admin/edit-task/${taskId}`, data);
      return response;
    } catch (error) {
      console.error( error);
      throw error;
    }
  }
   async deleteTask(taskId) {
    try {
      const response = await api.delete(`/api/admin/delete-task/${taskId}`);
      return response;
    } catch (error) {
      console.error( error);
      throw error;
    }
  }
  
}

export default ApiService;