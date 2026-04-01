'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { Download, Loader2, Search, FileText, ChevronRight, ChevronLeft, BarChart3, CheckCircle2, Users } from 'lucide-react';
import { extractScopusData, generateCertificate } from '@/services/certificateApi';
import type { GenerateCertificateRequest, ExtractScopusDataRequest, Publication, SubjectArea } from '@/types/certificate';
import type { Author } from '@/types/author';
import departamentosList from '@/departments.json';
import cargosList from '@/positions.json';
import { getAuthors } from '@/services/authorApi';
import { getDepartments } from '@/services/departmentApi';

interface ApiErrorPayload {
  error?: string;
}

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

function getErrorMessage(requestError: unknown, fallbackMessage: string) {
  const axiosError = requestError as AxiosError<ApiErrorPayload>;
  return axiosError.response?.data?.error || (requestError instanceof Error ? requestError.message : fallbackMessage);
}

export default function HomePage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [step, setStep] = useState(1);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [departments, setDepartments] = useState<string[]>(departamentosList);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');

  // Estados de interfaz
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [error, setError] = useState('');
  
  const [extractedData, setExtractedData] = useState<{ publications: Publication[], subject_areas: SubjectArea[] } | null>(null);

  // Formulario para la generación de certificados
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

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoadingAuthors(true);
      const data = await getAuthors();
      setAuthors(data);
      setLoadingAuthors(false);
    };

    const fetchDepartments = async () => {
      try {
        const departmentsData = await getDepartments();
        if (departmentsData.length > 0) {
          setDepartments(departmentsData.map((department) => department.nombre));
        }
      } catch {
        setDepartments(departamentosList);
      }
    };

    fetchAuthors();
    fetchDepartments();
  }, []);

  const handleAuthorSelect = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setError('');
    
    const author = authors.find(a => a.id === authorId);
    if (author) {
      // Autocompletamos todo el formulario con los datos de la base de datos
      setForm(prev => ({
        ...prev,
        scopusIds: author.scopus_ids || '',
        nombres: author.nombres || '',
        apellidos: author.apellidos || '',
        titulo: author.titulo || '',
        genero: author.genero || 'M',
        departamento: author.departamento || '',
        cargo: author.cargo || '',
      }));
    } else {
      // Si deselecciona, limpiamos
      setForm(prev => ({
        ...prev, scopusIds: '', nombres: '', apellidos: '', titulo: '', genero: 'M', departamento: '', cargo: ''
      }));
    }
  };

  // --- 1. LÓGICA DE EXTRACCIÓN ---
  const handleExtract = async () => {
    setError('');
    setResultMessage('');
    setExtractedData(null);

    if (!form.scopusIds.trim()) {
      setError('El docente seleccionado no tiene Scopus IDs registrados.');
      return;
    }

    const parsedIds = form.scopusIds.split(',').map((id) => id.trim()).filter(Boolean);

    const payload: ExtractScopusDataRequest = { scopus_ids: parsedIds };

    try {
      setLoadingExtract(true);
      const response = await extractScopusData(payload);
      setExtractedData({
        publications: response.publications,
        subject_areas: response.subject_areas
      });
      setResultMessage(`${response.mensaje}. Publicaciones detectadas: ${response.total_publicaciones}.`);
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'No se pudieron extraer los datos.'));
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
      
      // Opcional: Reiniciar el flujo al terminar exitosamente
      // setStep(1);
      // setExtractedData(null);
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, 'No se pudo generar el certificado.'));
    } finally {
      setLoadingGenerate(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Encabezado Principal */}
      <section className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-primary-500 text-3xl font-bold mb-2">SISTEMA DE CERTIFICADOS SCOPUS</h2>
            <p className="text-neutral-600">Escuela Politécnica Nacional</p>
          </div>
          <div className="text-right px-6 py-2">
            <div className="text-primary-500 text-center text-2xl font-bold">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </section>

      {/* Stepper / Indicador de Pasos */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary-600' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step >= 1 ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100'}`}>1</div>
          <span className="font-medium">Extracción de Datos</span>
        </div>
        <div className={`h-1 w-16 rounded ${step >= 2 ? 'bg-primary-500' : 'bg-neutral-200'}`}></div>
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary-600' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${step >= 2 ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100'}`}>2</div>
          <span className="font-medium">Generación de Certificado</span>
        </div>
      </div>

      {/* Alertas Globales */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {resultMessage && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{resultMessage}</div>}

      {/* Extracción de Publicaciones */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Seleccionar Docente</h3>
              </div>
              {loadingAuthors && <Loader2 className="h-5 w-5 animate-spin text-primary-500" />}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <label className="space-y-1.5 flex-1 w-full">
                <span className="text-sm font-medium text-neutral-700">Lista de Docentes</span>
                <select
                  value={selectedAuthorId}
                  onChange={(e) => handleAuthorSelect(e.target.value)}
                  disabled={loadingAuthors}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white disabled:bg-neutral-50"
                >
                  <option value=""> Seleccione un docente... </option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.apellidos} {author.nombres}
                    </option>
                  ))}
                </select>
              </label>
              
              <button
                onClick={handleExtract}
                disabled={loadingExtract || !selectedAuthorId}
                className="w-full md:w-auto inline-flex justify-center items-center gap-2 rounded-lg bg-primary-500 px-8 py-2.5 text-white font-medium hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors h-[46px]"
              >
                {loadingExtract ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-4 w-4" />}
                {loadingExtract ? 'Buscando...' : 'Extraer Publicaciones'}
              </button>
            </div>
            
            {/* Indicador de Scopus IDs correspondientes al autor */}
            {selectedAuthorId && form.scopusIds && (
               <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                 <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                 Scopus IDs: {form.scopusIds}
               </div>
            )}
          </div>

          {/* Resultados de extracción de publicaciones y áreas temáticas */}
          {extractedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lista de Publicaciones */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <h3 className="font-semibold">{extractedData.publications.length} Publicaciones encontradas</h3>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
                  {extractedData.publications.map((pub, index) => (
                    <div key={index} className="border border-neutral-100 rounded-lg p-3 hover:border-primary-200 transition-colors bg-neutral-50/50">
                      <h4 className="font-medium text-neutral-800 text-sm mb-1.5 line-clamp-2" title={pub.pub_title || pub.titulo}>
                        {pub.pub_title || pub.titulo || "Sin título"}
                      </h4>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Año: {pub.pub_year || pub.año}</span>
                        <span className={pub.source_title !== "N/A" ? "text-primary-600 font-medium" : ""}>
                          Fuente: {pub.source_title !== "N/A" ? pub.source_title : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de áreas temáticas */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3 text-primary-600">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="font-semibold text-neutral-800">Áreas Temáticas</h3>
                </div>
                
                {extractedData.subject_areas && extractedData.subject_areas.length > 0 ? (
                  <div className="space-y-4 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
                    {extractedData.subject_areas.map((area, index) => {
                      const areaName = area.name || `Área ${index + 1}`;
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-neutral-700">
                            <span className="truncate pr-4">{areaName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-neutral-500 italic">
                    No se encontraron áreas temáticas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón Siguiente */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setResultMessage('');
                setError('');
                setStep(2);
              }}
              disabled={!extractedData || extractedData.publications.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: GENERACIÓN DEL CERTIFICADO */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
          <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-neutral-800">Datos del Certificado</h3>
              </div>
              <div className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full font-medium">
                {extractedData?.publications?.length} publicaciones
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleGenerate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Nombres</span>
                  <input required type="text" value={form.nombres} onChange={(e) => updateField('nombres', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-300 outline-none transition-shadow" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Apellidos</span>
                  <input required type="text" value={form.apellidos} onChange={(e) => updateField('apellidos', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-300 outline-none transition-shadow" />
                </label>
                
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Título</span>
                  <input required type="text" value={form.titulo} onChange={(e) => updateField('titulo', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-300 outline-none transition-shadow" placeholder="PhD." />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Género</span>
                  <select value={form.genero} onChange={(e) => updateField('genero', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-300 outline-none bg-white">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-neutral-700">Departamento</span>
                  <select
                    value={form.departamento}
                    onChange={(e) => updateField('departamento', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                    required
                  >
                    <option value="" disabled>Seleccione un departamento...</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Cargo</span>
                  <select
                    value={form.cargo}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                    required
                  >
                    <option value="" disabled>Seleccione un cargo...</option>
                    {cargosList.map((position, index) => (
                      <option key={index} value={position}>{position}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Fecha del Certificado</span>
                  <input required type="date" value={form.fecha} onChange={(e) => updateField('fecha', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-300 outline-none" />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-neutral-700">Memorando (Opcional)</span>
                  <input type="text" value={form.memorando} onChange={(e) => updateField('memorando', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none" placeholder="Memo-2026-001" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Autoridad Firmante</span>
                  <input required type="text" value={form.firmante} onChange={(e) => updateField('firmante', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-neutral-700">Cargo de la Autoridad</span>
                  <input required type="text" value={form.firmanteCargo} onChange={(e) => updateField('firmanteCargo', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none" />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-neutral-700">Elaborado por</span>
                  <input required type="text" value={form.elaborador} onChange={(e) => updateField('elaborador', e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none" />
                </label>
              </div>

              <div className="flex items-center justify-between pt-6 mt-8 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Atrás
                </button>

                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={form.isDraft} onChange={(e) => updateField('isDraft', e.target.checked)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer" />
                    Generar como borrador
                  </label>

                  <button
                    type="submit"
                    disabled={loadingGenerate}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-3 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {loadingGenerate ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                    {loadingGenerate ? 'Generando PDF...' : 'Generar Certificado'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}