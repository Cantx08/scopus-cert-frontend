'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import cargosList from '@/positions.json';
import type { Department } from '@/types/department';
import type { Faculty } from '@/types/faculty';

export interface AuthorFormValues {
  nombres: string;
  apellidos: string;
  titulo: string;
  cargo: string;
  facultad: string;
  departamento: string;
  scopus_ids: string;
}

interface AuthorFormProps {
  title: string;
  backHref: string;
  submitLabel: string;
  loading: boolean;
  initialValues: AuthorFormValues;
  faculties: Faculty[];
  departments: Department[];
  onSubmit: (values: AuthorFormValues) => Promise<void>;
}

export default function AuthorForm({
  title,
  backHref,
  submitLabel,
  loading,
  initialValues,
  faculties,
  departments,
  onSubmit,
}: AuthorFormProps) {
  const [formData, setFormData] = useState<AuthorFormValues>(initialValues);
  const [error, setError] = useState('');

  const availableDepartments = useMemo(() => {
    if (!formData.facultad) {
      return departments;
    }
    return departments.filter((dept) => dept.facultad === formData.facultad);
  }, [departments, formData.facultad]);

  const handleChange = (name: keyof AuthorFormValues, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'facultad') {
        const departmentIsValid = departments.some(
          (dept) => dept.facultad === value && dept.nombre === prev.departamento
        );
        if (!departmentIsValid) {
          next.departamento = '';
        }
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      setError('Nombres y apellidos son obligatorios.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el autor.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Título</span>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
              placeholder="PhD., MSc., Ing."
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Nombres</span>
            <input
              required
              type="text"
              value={formData.nombres}
              onChange={(e) => handleChange('nombres', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Apellidos</span>
            <input
              required
              type="text"
              value={formData.apellidos}
              onChange={(e) => handleChange('apellidos', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Facultad</span>
            <select
              value={formData.facultad}
              onChange={(e) => handleChange('facultad', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Seleccione una facultad...</option>
              {faculties.map((faculty) => (
                <option key={faculty.sigla} value={faculty.sigla}>
                  {faculty.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Departamento</span>
            <select
              value={formData.departamento}
              onChange={(e) => handleChange('departamento', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Seleccione un departamento...</option>
              {availableDepartments.map((department) => (
                <option key={department.codigo} value={department.nombre}>
                  {department.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Cargo</span>
            <select
              value={formData.cargo}
              onChange={(e) => handleChange('cargo', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Seleccione un cargo...</option>
              {cargosList.map((position, index) => (
                <option key={index} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-neutral-700">Scopus IDs</span>
            <input
              type="text"
              value={formData.scopus_ids}
              onChange={(e) => handleChange('scopus_ids', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-primary-300"
              placeholder="57202652584, 55227013700"
            />
          </label>
        </div>

        <div className="flex justify-end border-t border-neutral-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
