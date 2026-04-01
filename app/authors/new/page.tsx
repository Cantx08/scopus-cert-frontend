'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthorForm, { AuthorFormValues } from '@/components/authors/AuthorForm';
import cargosList from '@/positions.json';
import { createAuthor } from '@/services/authorApi';
import { getDepartments } from '@/services/departmentApi';
import { getFaculties } from '@/services/facultyApi';
import { getJobPositions } from '@/services/jobPositionApi';
import type { Department } from '@/types/department';
import type { Faculty } from '@/types/faculty';

const initialValues: AuthorFormValues = {
  nombres: '',
  apellidos: '',
  titulo: '',
  genero: 'M',
  cargo: '',
  facultad: '',
  departamento: '',
  scopus_ids: '',
};

export default function NewAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobPositions, setJobPositions] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [facultiesData, departmentsData] = await Promise.all([
        getFaculties(),
        getDepartments(),
      ]);
      setFaculties(facultiesData);
      setDepartments(departmentsData);

      try {
        const jobPositionsData = await getJobPositions();
        setJobPositions(jobPositionsData.map((jobPosition) => jobPosition.nombre));
      } catch {
        setJobPositions(cargosList);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (values: AuthorFormValues) => {
    setLoading(true);
    try {
      await createAuthor(values);
      router.push('/authors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthorForm
      title="Nuevo Autor"
      backHref="/authors"
      submitLabel="Guardar Autor"
      loading={loading}
      initialValues={initialValues}
      faculties={faculties}
      departments={departments}
      jobPositions={jobPositions}
      onSubmit={handleSubmit}
    />
  );
}
