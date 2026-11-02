import axiosClient from './axiosClient'

export const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  refreshToken: (data) => axiosClient.post('/auth/refresh', data),
  getMe: () => axiosClient.get('/auth/me'),
}

export default authApi

