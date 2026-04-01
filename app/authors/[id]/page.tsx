'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthorForm, { AuthorFormValues } from '@/components/authors/AuthorForm';
import { getAuthors, updateAuthor } from '@/services/authorApi';
import { getDepartments } from '@/services/departmentApi';
import { getFaculties } from '@/services/facultyApi';
import type { Department } from '@/types/department';
import type { Faculty } from '@/types/faculty';
import type { Author } from '@/types/author';

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id ?? '', [params]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [initialValues, setInitialValues] = useState<AuthorFormValues | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setError('');

      try {
        const [authorsData, facultiesData, departmentsData] = await Promise.all([
          getAuthors(),
          getFaculties(),
          getDepartments(),
        ]);

        const author = authorsData.find((item: Author) => item.id === id);
        if (!author) {
          setError('No se encontró el autor solicitado.');
          setInitialValues(null);
          return;
        }

        setFaculties(facultiesData);
        setDepartments(departmentsData);
        setInitialValues({
          nombres: author.nombres,
          apellidos: author.apellidos,
          titulo: author.titulo || '',
          cargo: author.cargo || '',
          facultad: author.facultad || '',
          departamento: author.departamento || '',
          scopus_ids: author.scopus_ids || '',
        });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el autor.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (values: AuthorFormValues) => {
    setLoading(true);
    try {
      await updateAuthor(id, values);
      router.push('/authors');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-20 text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando datos del autor...
      </div>
    );
  }

  if (error || !initialValues) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || 'No se pudo cargar el autor.'}
      </div>
    );
  }

  return (
    <AuthorForm
      title="Editar Autor"
      backHref="/authors"
      submitLabel="Actualizar Autor"
      loading={loading}
      initialValues={initialValues}
      faculties={faculties}
      departments={departments}
      onSubmit={handleSubmit}
    />
  );
}
