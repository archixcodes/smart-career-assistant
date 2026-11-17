import api from './api';

export const interviewService = {
  async startInterview(config) {
    const res = await api.post('/interview/start', config);
    return res.data;
  },

  async getSession(id) {
    const res = await api.get(`/interview/${id}`);
    return res.data;
  },

  async getNextQuestion(id) {
    const res = await api.get(`/interview/${id}/next-question`);
    return res.data;
  },

  async submitAnswer(id, questionIndex, answer) {
    const res = await api.post(`/interview/${id}/answer`, { questionIndex, answer });
    return res.data;
  },

  async finishInterview(id) {
    const res = await api.post(`/interview/${id}/finish`);
    return res.data;
  },

  async getHistory() {
    const res = await api.get('/interview/history');
    return res.data;
  }
};
