import axiosClient from './axiosClient'

export const reportApi = {
  getSummary: (date) => axiosClient.get('/reports/summary', { params: date ? { date } : {} }),
  exportExcel: (month, year) =>
    axiosClient.get('/reports/export/excel', {
      params: { month, year },
      responseType: 'blob',
    }),
  exportPdf: (month, year) =>
    axiosClient.get('/reports/export/pdf', {
      params: { month, year },
      responseType: 'blob',
    }),
}

export default reportApi

