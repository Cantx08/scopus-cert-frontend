'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Upload, Loader2, UserRoundPen } from 'lucide-react';
import { bulkUploadAuthors, getAuthors } from '@/services/authorApi';
import { getFaculties } from '@/services/facultyApi';
import { getDepartments } from '@/services/departmentApi';
import type { Author } from '@/types/author';
import type { Faculty } from '@/types/faculty';
import type { Department } from '@/types/department';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [authorsData, facultiesData, departmentsData] = await Promise.all([
        getAuthors(),
        getFaculties(),
        getDepartments(),
      ]);
      setAuthors(authorsData);
      setFaculties(facultiesData);
      setDepartments(departmentsData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (selectedFaculty === 'all') {
      return departments;
    }
    return departments.filter((department) => department.facultad === selectedFaculty);
  }, [departments, selectedFaculty]);

  const filteredAuthors = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return authors.filter((author) => {
      const matchesSearch =
        !searchValue ||
        author.nombres.toLowerCase().includes(searchValue) ||
        author.apellidos.toLowerCase().includes(searchValue) ||
        author.cargo.toLowerCase().includes(searchValue) ||
        author.departamento.toLowerCase().includes(searchValue);

      const matchesFaculty = selectedFaculty === 'all' || author.facultad === selectedFaculty;
      const matchesDepartment = selectedDepartment === 'all' || author.departamento === selectedDepartment;

      return matchesSearch && matchesFaculty && matchesDepartment;
    });
  }, [authors, search, selectedFaculty, selectedDepartment]);

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Debe seleccionar un archivo CSV.');
      event.target.value = '';
      return;
    }

    setImporting(true);
    setError('');
    setMessage('');

    try {
      const result = await bulkUploadAuthors(file);
      setMessage(result.mensaje);
      await fetchData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo importar el archivo.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Gestión de Autores</h2>
            <p className="mt-1 text-sm text-neutral-600">Listado, edición e importación masiva de autores.</p>
          </div>
          <div className="flex gap-3">
            <input
              id="authors-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvImport}
            />
            <label
              htmlFor="authors-csv-input"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {importing ? 'Importando...' : 'Importar CSV'}
            </label>

            <Link
              href="/authors/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo Autor
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_280px_280px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo o departamento"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-10 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            />
          </label>

          <select
            value={selectedFaculty}
            onChange={(e) => {
              setSelectedFaculty(e.target.value);
              setSelectedDepartment('all');
            }}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">Todas las facultades</option>
            {faculties.map((faculty) => (
              <option key={faculty.sigla} value={faculty.sigla}>
                {faculty.nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">Todos los departamentos</option>
            {filteredDepartments.map((department) => (
              <option key={`${department.facultad}-${department.codigo}`} value={department.nombre}>
                {department.nombre}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-neutral-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando autores...
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-200 px-6 py-3 text-sm text-neutral-600">
              Total: {filteredAuthors.length} autor(es)
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Autor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Facultad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Departamento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">Scopus IDs</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredAuthors.map((author) => (
                    <tr key={author.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-800">
                        {author.apellidos} {author.nombres}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{author.facultad || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{author.departamento || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{author.cargo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{author.scopus_ids || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Link
                            href={`/authors/${author.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                          >
                            <UserRoundPen className="h-3.5 w-3.5" />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAuthors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-500">
                        No se encontraron autores con los filtros actuales.
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
