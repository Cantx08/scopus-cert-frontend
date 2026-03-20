import { axiosInstance } from '@/lib/axios';
import { GenerateCertificateRequest, GenerateCertificateResponse } from '@/types/certificate';

export async function generateCertificate(
  payload: GenerateCertificateRequest
): Promise<GenerateCertificateResponse> {
  const { data } = await axiosInstance.post<GenerateCertificateResponse>('/GenerateCertificate', payload);
  return data;
}
