import { axiosInstance } from '@/lib/axios';
import { 
  GenerateCertificateRequest, 
  GenerateCertificateResponse,
  ExtractScopusDataRequest,
  ExtractScopusDataResponse
} from '@/types/certificate';

export const extractScopusData = async (
  data: ExtractScopusDataRequest
): Promise<ExtractScopusDataResponse> => {
  const response = await axiosInstance.post<ExtractScopusDataResponse>(
    '/ExtractScopusData', 
    data
  );
  return response.data;
};

export const generateCertificate = async (
  data: GenerateCertificateRequest
): Promise<GenerateCertificateResponse> => {
  const response = await axiosInstance.post<GenerateCertificateResponse>(
    '/GenerateCertificate', 
    data
  );
  return response.data;
};