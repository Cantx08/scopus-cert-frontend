export interface Author {
  id: string;
  nombres: string;
  apellidos: string;
  titulo: string;
  genero: string;
  cargo: string;
  departamento: string;
  facultad: string;
  scopus_ids: string;
}

export interface AuthorUpsertPayload {
  nombres: string;
  apellidos: string;
  titulo?: string;
  genero?: string;
  cargo?: string;
  departamento?: string;
  facultad?: string;
  scopus_ids?: string;
}

export interface AuthorUpsertResponse {
  mensaje: string;
  id: string;
}

export interface BulkUploadAuthorsResponse {
  mensaje: string;
}

export interface DeleteAuthorResponse {
  mensaje?: string;
  error?: string;
}
