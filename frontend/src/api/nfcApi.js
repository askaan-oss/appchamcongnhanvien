import axiosClient from './axiosClient'

export const nfcApi = {
  assign: (data) => axiosClient.post('/nfc/assign', data),
  revoke: (data) => axiosClient.post('/nfc/revoke', data),
  verify: (cardUid) => axiosClient.post('/nfc/verify', { cardUid }),
}

export default nfcApi

