'use client';

import { useMemo, useState } from 'react';
import { Download, Loader2, Search, FileText, CheckCircle2 } from 'lucide-react';
import { extractScopusData, generateCertificate } from '@/services/certificateApi';
import type { GenerateCertificateRequest, ExtractScopusDataRequest, Publication } from '@/types/certificate';
import departamentosList from '@/departments.json';
import cargosList from '@/positions.json';

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
  
  // Estados de interfaz
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [error, setError] = useState('');
  
  const [extractedData, setExtractedData] = useState<{ publications: Publication[], subject_areas: any[] } | null>(null);

  // Estado unificado del formulario
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

  // --- 1. LÓGICA DE EXTRACCIÓN ---
  const handleExtract = async () => {
    setError('');
    setResultMessage('');
    setExtractedData(null);

    const parsedIds = form.scopusIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (parsedIds.length === 0) {
      setError('Debes ingresar al menos un Scopus ID.');
      return;
    }

    const payload: ExtractScopusDataRequest = {
      scopus_ids: parsedIds,
    };

    try {
      setLoadingExtract(true);
      const response = await extractScopusData(payload);
      setExtractedData({
        publications: response.publications,
        subject_areas: response.subject_areas
      });
      setResultMessage(`${response.mensaje}. Publicaciones detectadas: ${response.total_publicaciones}.`);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudieron extraer los datos.');
    } finally {
      setLoadingExtract(false);
    }
  };

  // --- 2. LÓGICA DE GENERACIÓN ---
  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResultMessage('');

    if (!extractedData) {
      setError('Debes extraer las publicaciones primero.');
      return;
    }

    const payload: GenerateCertificateRequest = {
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
      publications: extractedData.publications,
      subject_areas: extractedData.subject_areas,
      is_draft: form.isDraft,
    };

    try {
      setLoadingGenerate(true);
      const response = await generateCertificate(payload);
      downloadBase64Pdf(response.pdf_base64, response.nombre_archivo);
      setResultMessage(response.mensaje);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.message || 'No se pudo generar el certificado.');
    } finally {
      setLoadingGenerate(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-primary-500 text-4xl font-bold mb-2">SISTEMA DE CERTIFICADOS SCOPUS</h2>
            <p className="text-neutral-600 text-lg">Escuela Politécnica Nacional</p>
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

      {/* Alertas Globales */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {resultMessage && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{resultMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA: Extracción y Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-neutral-800">1. Buscar Publicaciones</h3>
            </div>
            
            <label className="space-y-1 block">
              <span className="text-sm text-neutral-700">Scopus IDs (separados por coma)</span>
              <input
                type="text"
                value={form.scopusIds}
                onChange={(e) => updateField('scopusIds', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="57225982800, 57201692331"
              />
            </label>

            <button
              onClick={handleExtract}
              disabled={loadingExtract || !form.scopusIds.trim()}
              className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-neutral-800 px-6 py-2.5 text-white font-medium hover:bg-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loadingExtract ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {loadingExtract ? 'Buscando en Scopus...' : 'Extraer Publicaciones'}
            </button>
          </div>

          {/* Previsualización de Publicaciones */}
          {extractedData && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Publicaciones Encontradas</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {extractedData.publications.length} items
                </span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {extractedData.publications.map((pub, index) => (
                  <div key={index} className="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors bg-neutral-50">
                    <h4 className="font-semibold text-neutral-900 text-sm mb-2 line-clamp-2">
                      {pub.pub_title || pub.titulo || "Sin título"}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                      <div><span className="font-medium text-neutral-800">Año:</span> {pub.pub_year || pub.año}</div>
                      <div>
                        <span className="font-medium text-neutral-800">Q:</span>{' '}
                        <span className={pub.sjr_categories !== "N/A" ? "text-emerald-600 font-medium" : "text-neutral-500"}>
                          {pub.sjr_categories !== "N/A" ? "Indexado" : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Formulario de Generación */}
        <div className="lg:col-span-7">
          <section className={`bg-white rounded-xl shadow-sm border border-neutral-200 p-8 transition-all duration-300 ${!extractedData ? 'opacity-60 grayscale-[50%] pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <FileText className="h-5 w-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-neutral-800">2. Datos del Certificado</h3>
            </div>

            <form className="space-y-6" onSubmit={handleGenerate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Nombres</span>
                  <input required type="text" value={form.nombres} onChange={(e) => updateField('nombres', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Apellidos</span>
                  <input required type="text" value={form.apellidos} onChange={(e) => updateField('apellidos', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>
                
                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Título</span>
                  <input required type="text" value={form.titulo} onChange={(e) => updateField('titulo', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" placeholder="PhD." />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Género</span>
                  <select value={form.genero} onChange={(e) => updateField('genero', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-neutral-700">Departamento</span>
                  <select
                    value={form.departamento}
                    onChange={(e) => updateField('departamento', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    required
                  >
                    <option value="" disabled>Seleccione un departamento...</option>
                    {departamentosList.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Cargo</span>
                  <select
                    value={form.cargo}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    required
                  >
                    <option value="" disabled>Seleccione un cargo...</option>
                    {cargosList.map((position, index) => (
                      <option key={index} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Fecha del Certificado</span>
                  <input required type="date" value={form.fecha} onChange={(e) => updateField('fecha', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-neutral-700">Memorando (Opcional)</span>
                  <input type="text" value={form.memorando} onChange={(e) => updateField('memorando', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" placeholder="Memo-2026-001" />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Autoridad Firmante</span>
                  <input required type="text" value={form.firmante} onChange={(e) => updateField('firmante', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>

                <label className="space-y-1">
                  <span className="text-sm text-neutral-700">Cargo de la Autoridad</span>
                  <input required type="text" value={form.firmanteCargo} onChange={(e) => updateField('firmanteCargo', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>

                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm text-neutral-700">Elaborado por</span>
                  <input required type="text" value={form.elaborador} onChange={(e) => updateField('elaborador', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300" />
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 mt-6 border-t border-neutral-100">
                <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                  <input type="checkbox" checked={form.isDraft} onChange={(e) => updateField('isDraft', e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  Generar como borrador
                </label>

                <button
                  type="submit"
                  disabled={loadingGenerate || !extractedData}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-white font-medium hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingGenerate ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  {loadingGenerate ? 'Generando PDF...' : 'Generar Certificado'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}