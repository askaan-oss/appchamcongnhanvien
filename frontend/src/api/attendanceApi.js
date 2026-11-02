import axiosClient from './axiosClient'

export const attendanceApi = {
  getToday: () => axiosClient.get('/attendance/today'),
  getHistory: (params) => axiosClient.get('/attendance/history', { params }),
  manualAdjust: (data) => axiosClient.post('/attendance/manual', data),
}

export default attendanceApi

