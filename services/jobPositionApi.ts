import { axiosInstance } from '@/lib/axios';

export interface JobPosition {
  nombre: string;
}

export const getJobPositions = async (): Promise<JobPosition[]> => {
  const response = await axiosInstance.get<JobPosition[]>('/GetJobPositions');
  return response.data;
};
