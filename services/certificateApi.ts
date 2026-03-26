import { axiosInstance } from '@/lib/axios';
import { 
  GenerateCertificateRequest, 
  GenerateCertificateResponse,
  ExtractScopusDataRequest,
  ExtractScopusDataResponse,
  SubjectArea
} from '@/types/certificate';

const toSafeNumber = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeSubjectArea = (area: unknown, index: number): SubjectArea => {
  if (!area || typeof area !== 'object') {
    const fallbackName = `Area ${index + 1}`;
    return {
      name: fallbackName,
      count: 0,
      subject_area: fallbackName,
      documents: 0,
    };
  }

  const rawArea = area as Record<string, unknown>;
  const rawName =
    rawArea.subject_area ?? rawArea.name ?? rawArea.area ?? rawArea.nombre ?? rawArea.abbrev;
  const normalizedName =
    typeof rawName === 'string' && rawName.trim() ? rawName.trim() : `Area ${index + 1}`;

  const rawCount = rawArea.documents ?? rawArea.count ?? rawArea.cantidad ?? rawArea.value ?? 0;
  const normalizedCount = toSafeNumber(rawCount);

  return {
    ...rawArea,
    name: normalizedName,
    count: normalizedCount,
    subject_area: normalizedName,
    documents: normalizedCount,
    abbrev: typeof rawArea.abbrev === 'string' ? rawArea.abbrev : undefined,
  };
};

export const extractScopusData = async (
  data: ExtractScopusDataRequest
): Promise<ExtractScopusDataResponse> => {
  const response = await axiosInstance.post<ExtractScopusDataResponse>(
    '/ExtractScopusData', 
    data
  );

  return {
    ...response.data,
    subject_areas: Array.isArray(response.data.subject_areas)
      ? response.data.subject_areas.map(normalizeSubjectArea)
      : [],
  };
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