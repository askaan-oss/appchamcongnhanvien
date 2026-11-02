import axiosClient from './axiosClient'

export const leaveApi = {
  getAll: (params) => axiosClient.get('/leave-requests', { params }),
  create: (data) => axiosClient.post('/leave-requests', data),
  updateStatus: (id, data) => axiosClient.patch(`/leave-requests/${id}/status`, data),
}

export default leaveApi

