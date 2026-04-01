import { axiosInstance } from '@/lib/axios';
import type { Faculty } from '@/types/faculty';

export const getFaculties = async (): Promise<Faculty[]> => {
  const response = await axiosInstance.get<Faculty[]>('/GetFaculties');
  return response.data;
};
