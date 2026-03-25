'use client';

import { useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateCertificate } from '@/services/certificateApi';
import type { GenerateCertificateRequest } from '@/types/certificate';

function downloadBase64Pdf(base64: string, filename: string) {
  const pdfBytes = atob(base64);
  const byteArray = new Uint8Array(pdfBytes.length);

  for (let i = 0; i < pdfBytes.length; i += 1) {
    byteArray[i] = pdfBytes.charCodeAt(i);
  }

  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function HomePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    scopusIds: '',
    nombres: '',
    apellidos: '',
    titulo: '',
    genero: 'M',
    departamento: '',
    cargo: '',
    memorando: '',
    fecha: today,
    firmante: '',
    firmanteCargo: '',
    elaborador: '',
    isDraft: true,
  });

  const updateField = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResultMessage('');

    const parsedIds = form.scopusIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (parsedIds.length === 0) {
      setError('Debes ingresar al menos un Scopus ID.');
      return;
    }

    const payload: GenerateCertificateRequest = {
      scopus_ids: parsedIds,
      author: {
        nombres: form.nombres,
        apellidos: form.apellidos,
        titulo: form.titulo,
        genero: form.genero,
        departamento: form.departamento,
        cargo: form.cargo,
      },
      metadata: {
        memorando: form.memorando,
        fecha: form.fecha,
        firmante_nombre: form.firmante,
        firmante_cargo: form.firmanteCargo,
        elaborador: form.elaborador,
      },
      is_draft: form.isDraft,
    };

    try {
      setLoading(true);
      const response = await generateCertificate(payload);
      downloadBase64Pdf(response.pdf_base64, response.nombre_archivo);
      setResultMessage(`${response.mensaje}. Publicaciones detectadas: ${response.total_publicaciones}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo generar el certificado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-primary-500 text-4xl font-bold mb-2">SISTEMA DE CERTIFICADOS SCOPUS</h2>
            <p className="text-neutral-600 text-lg">Escuela Politecnica Nacional</p>
          </div>
          <div className="text-right px-6 py-4">
            <div className="text-primary-500 text-center text-3xl font-bold">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric' })}
            </div>
            <div className="text-primary-400 font-medium">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm text-neutral-700">Scopus IDs (separados por coma)</span>
              <input
                type="text"
                value={form.scopusIds}
                onChange={(e) => updateField('scopusIds', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="57225982800, 57201692331"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Nombres</span>
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => updateField('nombres', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Apellidos</span>
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => updateField('apellidos', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>
            
            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Título</span>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => updateField('titulo', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Genero</span>
              <select
                value={form.genero}
                onChange={(e) => updateField('genero', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Memorando</span>
              <input
                type="text"
                value={form.memorando}
                onChange={(e) => updateField('memorando', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="Memo-2026-001"
                required
              />
            </label>
            
            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Fecha</span>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => updateField('fecha', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Departamento</span>
              <input
                type="text"
                value={form.departamento}
                onChange={(e) => updateField('departamento', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Cargo</span>
              <input
                type="text"
                value={form.cargo}
                onChange={(e) => updateField('cargo', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Firmante</span>
              <input
                type="text"
                value={form.firmante}
                onChange={(e) => updateField('firmante', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Cargo del firmante</span>
              <input
                type="text"
                value={form.firmanteCargo}
                onChange={(e) => updateField('firmanteCargo', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-neutral-700">Elaborado por</span>
              <input
                type="text"
                value={form.elaborador}
                onChange={(e) => updateField('elaborador', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                required
              />
            </label>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.isDraft}
                onChange={(e) => updateField('isDraft', e.target.checked)}
                className="h-4 w-4"
              />
              Generar como borrador
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-white font-medium hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {loading ? 'Generando...' : 'Generar y descargar PDF'}
            </button>
          </div>

          {resultMessage && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">{resultMessage}</p>}
          {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
        </form>
      </section>
    </div>
  );
}
