import axiosClient from './axiosClient'

export const reportApi = {
  getSummary: (params) => axiosClient.get('/reports/summary', { params: typeof params === 'string' ? { date: params } : params }),
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

