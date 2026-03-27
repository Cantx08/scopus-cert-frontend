import { axiosInstance } from '@/lib/axios';
import { Author } from '@/types/certificate';

export const getAuthors = async (departamento?: string, facultad?: string): Promise<Author[]> => {
  try {
    const params = new URLSearchParams();
    if (departamento) params.append('departamento', departamento);
    if (facultad) params.append('facultad', facultad);

    const url = `/ManageAuthors${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get<Author[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo autores:", error);
    return [];
  }
};