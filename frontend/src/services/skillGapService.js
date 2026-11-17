import api from './api';

export const skillGapService = {
  async getAnalysis(roleTitle) {
    const params = roleTitle ? { role: roleTitle } : {};
    const res = await api.get('/gap-analysis', { params });
    return res.data;
  },

  async getAvailableRoles() {
    const res = await api.get('/gap-analysis/roles');
    return res.data;
  },

  async simulateRole(roleTitle) {
    const res = await api.post('/gap-analysis/simulate', { roleTitle });
    return res.data;
  }
};
