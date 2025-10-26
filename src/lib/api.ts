import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getDate = async () => {
  const response = await apiClient.get<string>('/date');
  return response.data;
};

export const downloadNseReports = async (dates: string[]) => {
  const response = await apiClient.post('/nse/download', { dates });
  return response.data;
};

export const getSectorPerformance = async (date: string) => {
  const response = await apiClient.get(`/sectors/performance/${date}`);
  return response.data;
};

export const getSectorVolumeRatio = async (startDate: string, endDate: string) => {
  const response = await apiClient.get(`/sectors/volume-ratio`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getTopGainersLosers = async (date?: string) => {
  const response = await apiClient.get('/performance/top-gainers-losers', {
    params: { date },
  });
  return response.data;
};

export const getStockVolumeDifferences = async (dates: string[]) => {
  const response = await apiClient.post('/volume/differences', { dates });
  return response.data;
};
