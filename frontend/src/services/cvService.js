import api from './api';

export const cvService = {
  async uploadCV(formData) {
    const res = await api.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/cv/profile');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await api.put('/cv/profile', profileData);
    return res.data;
  },

  async lockProfile() {
    const res = await api.post('/cv/lock');
    return res.data;
  },

  async unlockProfile() {
    const res = await api.post('/cv/unlock');
    return res.data;
  }
};
