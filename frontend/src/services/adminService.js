import api from './api';

export const adminService = {
  async getRoles() {
    const res = await api.get('/admin/roles');
    return res.data;
  },

  async createRole(roleData) {
    const res = await api.post('/admin/roles', roleData);
    return res.data;
  },

  async updateRole(id, roleData) {
    const res = await api.put(`/admin/roles/${id}`, roleData);
    return res.data;
  },

  async deleteRole(id) {
    const res = await api.delete(`/admin/roles/${id}`);
    return res.data;
  },

  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  }
};
