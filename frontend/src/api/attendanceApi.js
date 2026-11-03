import axiosClient from './axiosClient'

export const attendanceApi = {
  getToday: (params) => axiosClient.get('/attendance/today', { params }),
  getHistory: (params) => axiosClient.get('/attendance/history', { params }),
  manualAdjust: (data) => axiosClient.post('/attendance/manual', data),
}

export default attendanceApi

