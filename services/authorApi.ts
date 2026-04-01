import { axiosInstance } from '@/lib/axios';
import type {
  Author,
  AuthorUpsertPayload,
  AuthorUpsertResponse,
  BulkUploadAuthorsResponse,
  DeleteAuthorResponse,
} from '@/types/author';

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

export const createAuthor = async (payload: AuthorUpsertPayload): Promise<AuthorUpsertResponse> => {
  const response = await axiosInstance.post<AuthorUpsertResponse>('/ManageAuthors', payload);
  return response.data;
};

export const updateAuthor = async (
  id: string,
  payload: AuthorUpsertPayload
): Promise<AuthorUpsertResponse> => {
  const response = await axiosInstance.put<AuthorUpsertResponse>('/ManageAuthors', {
    ...payload,
    id,
  });
  return response.data;
};

export const bulkUploadAuthors = async (file: File): Promise<BulkUploadAuthorsResponse> => {
  const csvContent = await file.text();
  const response = await axiosInstance.post<BulkUploadAuthorsResponse>('/ManageAuthors', csvContent, {
    headers: {
      'Content-Type': 'text/csv',
    },
  });
  return response.data;
};

export const deleteAuthor = async (id: string): Promise<DeleteAuthorResponse> => {
  const encodedId = encodeURIComponent(id);
  const response = await axiosInstance.delete<DeleteAuthorResponse>(`/ManageAuthors?id=${encodedId}`);
  return response.data;
};
