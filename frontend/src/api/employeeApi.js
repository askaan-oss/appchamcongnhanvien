import axiosClient from './axiosClient'

export const employeeApi = {
  getAll: (params) => axiosClient.get('/employees', { params }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  getQrCode: (id) => axiosClient.get(`/employees/${id}/qr`),
  regenerateQrCode: (id) => axiosClient.post(`/employees/${id}/qr`),
}

export default employeeApi

