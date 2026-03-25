export interface CertificateAuthor {
  nombres: string;
  apellidos: string;
  titulo: string;
  genero: string;
  departamento: string;
  cargo: string;
}

export interface CertificateMetadata {
  memorando: string;
  fecha: string;
  firmante_nombre: string;
  firmante_cargo: string;
  elaborador: string;
}

export interface Publication {
  pub_title?: string;
  titulo?: string;
  pub_year?: string | number;
  año?: string | number;
  sjr_categories?: string;
  [key: string]: any;
}

export interface ExtractScopusDataRequest {
  scopus_ids: string[];
}

export interface ExtractScopusDataResponse {
  mensaje: string;
  total_publicaciones: number;
  publications: Publication[];
  subject_areas: any[];
}

export interface GenerateCertificateRequest {
  author: CertificateAuthor;
  metadata: CertificateMetadata;
  publications: Publication[];
  subject_areas: any[];
  is_draft: boolean;
}

export interface GenerateCertificateResponse {
  mensaje: string;
  pdf_base64: string;
  nombre_archivo: string;
}
