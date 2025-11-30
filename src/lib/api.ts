import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getDate = async () => {
  const response = await apiClient.get<string>('/date');
  return response.data;
};

export const getLastDate = async () => {
  const response = await apiClient.get<string>('/nse/last-date');
  return response.data;
}

export const downloadNseReports = async (dates: string[]) => {
  const response = await apiClient.post('/nse/download', { dates });
  return response.data;
};

export const getSectorPerformance = async (date: string) => {
  const response = await apiClient.get(`/sectors/performance/${date}`);
  return response.data;
};

export const getSectorVolumeRatio = async (previousDate: string, currentDate: string) => {
  const response = await apiClient.get(`/sectors/volume-ratio/${currentDate}/${previousDate}`);
  return response.data;
};


export const getTopGainersLosers = async (date?: string) => {
  try {
    // Update endpoint to match backend route
    const response = await apiClient.get(`/performance/top-gainers-losers`, { params: { date } });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      console.warn(`No data available for date: ${date}`);
      return { topGainers: [], topLosers: [] };
    }
    throw error;
  }
};

export const getStockVolumeDifferences = async (dates: string[]) => {
  const response = await apiClient.post('/volume/differences', { dates });
  return response.data;
};

export const getBhavcopy = async (date: string, page: number, pageSize: number) => {
  const response = await apiClient.get('/bhavcopy', {
    params: { date, page, pageSize },
  });
  return response.data;
};

export const searchBhavcopy = async (query: string, date: string, page: number, pageSize: number) => {
  const response = await apiClient.get('/bhavcopy/search', {
    params: { query, date, page, pageSize },
  });
  return response.data;
};
