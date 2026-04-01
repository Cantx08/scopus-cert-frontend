'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Loader2, Search } from 'lucide-react';
import { getDepartments } from '@/services/departmentApi';
import { getFaculties } from '@/services/facultyApi';
import type { Department } from '@/types/department';
import type { Faculty } from '@/types/faculty';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [departmentsData, facultiesData] = await Promise.all([getDepartments(), getFaculties()]);
        setDepartments(departmentsData);
        setFaculties(facultiesData);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los departamentos.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return departments.filter((department) => {
      const matchesFaculty = selectedFaculty === 'all' || department.facultad === selectedFaculty;
      const matchesSearch =
        !searchValue ||
        department.nombre.toLowerCase().includes(searchValue) ||
        department.codigo.toLowerCase().includes(searchValue) ||
        department.facultad.toLowerCase().includes(searchValue);
      return matchesFaculty && matchesSearch;
    });
  }, [departments, selectedFaculty, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Departamentos</h2>
            <p className="text-sm text-neutral-600">Consulta departamentos y su facultad asociada.</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_300px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o facultad"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-10 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            />
          </label>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">Todas las facultades</option>
            {faculties.map((faculty) => (
              <option key={faculty.sigla} value={faculty.sigla}>
                {faculty.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-neutral-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando departamentos...
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-200 px-6 py-3 text-sm text-neutral-600">
              Total: {filteredDepartments.length} departamento(s)
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Facultad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredDepartments.map((department) => (
                    <tr key={`${department.facultad}-${department.codigo}`} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm font-medium text-neutral-800">{department.codigo}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{department.nombre}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{department.facultad}</td>
                    </tr>
                  ))}
                  {filteredDepartments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-neutral-500">
                        No se encontraron departamentos con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
