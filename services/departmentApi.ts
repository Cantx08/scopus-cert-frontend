import { axiosInstance } from '@/lib/axios';
import type { Department } from '@/types/department';

export const getDepartments = async (facultad?: string): Promise<Department[]> => {
  const params = new URLSearchParams();
  if (facultad) {
    params.append('facultad', facultad);
  }

  const url = `/GetDepartments${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axiosInstance.get<Department[]>(url);
  return response.data;
};
