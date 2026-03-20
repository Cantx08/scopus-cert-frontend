export interface CertificateAuthor {
  nombres: string;
  apellidos: string;
  genero: string;
  departamento: string;
  cargo: string;
}

export interface CertificateMetadata {
  memorando: string;
  fecha: string;
  firmante: string;
  firmante_cargo: string;
  elaborador: string;
}

export interface GenerateCertificateRequest {
  scopus_ids: string[];
  author: CertificateAuthor;
  metadata: CertificateMetadata;
  is_draft: boolean;
}

export interface GenerateCertificateResponse {
  mensaje: string;
  total_publicaciones: number;
  pdf_base64: string;
  nombre_archivo: string;
}
