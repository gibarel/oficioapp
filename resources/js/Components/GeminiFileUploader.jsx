import React, { useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';

export default function GeminiFileUploader({ onAnalysisComplete, purpose = 'general' }) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // Tipos de archivo permitidos de forma genérica (Imágenes + Documentos/Planillas)
    const acceptedFormats = "image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAnalysisResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('purpose', purpose);

            // Petición real al backend de Laravel
            const response = await axios.post(route('ai.analyze'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                const result = response.data.data;
                setAnalysisResult(result);
                if (onAnalysisComplete) onAnalysisComplete(result);
            } else {
                alert('Ocurrió un error al procesar el archivo con la IA.');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error al procesar con IA:', error);
            alert('Error de conexión al procesar el archivo.');
            setLoading(false);
        }
    };

    const isImage = selectedFile && selectedFile.type.startsWith('image/');

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">
                    {purpose === 'tool' ? '🔍 Identificar Herramienta' : 
                     purpose === 'before_after' ? '📸 Registro Visual (Antes / Después)' : 
                     '📊 Importar Lista de Precios (PDF / Excel / Foto)'}
                </h4>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    Gemini AI
                </span>
            </div>

            {/* Zona de Carga Genérica */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-400 transition cursor-pointer relative bg-slate-50/50">
                <input
                    type="file"
                    accept={acceptedFormats}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {selectedFile ? (
                    <div className="space-y-2 text-center w-full">
                        {isImage ? (
                            <img src={URL.createObjectURL(selectedFile)} alt="Vista previa" className="h-28 mx-auto object-cover rounded-lg shadow-sm" />
                        ) : (
                            <div className="w-12 h-12 mx-auto bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                                📄
                            </div>
                        )}
                        <div className="truncate px-4">
                            <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <p className="text-[11px] text-indigo-600 font-medium">Hacer clic para cambiar archivo</p>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <svg className="w-9 h-9 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-slate-700">Arrastrá tu archivo o hacé clic para explorar</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Compatible con imágenes, PDFs, Excel y CSV</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Botón de Procesamiento */}
            {selectedFile && !analysisResult && (
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando archivo con Gemini...
                        </>
                    ) : (
                        'Procesar con IA 🚀'
                    )}
                </button>
            )}

            {/* Resultado */}
            {analysisResult && (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-emerald-800">✨ Datos extraídos con éxito:</p>
                    <pre className="text-emerald-700 font-mono text-[11px] overflow-x-auto max-h-40">
                        {JSON.stringify(analysisResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}