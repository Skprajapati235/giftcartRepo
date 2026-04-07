import api from '../api/apiClient';

const userService = {
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  uploadImage: async (imageFormData) => {
    const response = await api.post('/upload', imageFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userService;
