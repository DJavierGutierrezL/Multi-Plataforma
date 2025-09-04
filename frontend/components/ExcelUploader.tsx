import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { UploadIcon } from './icons/UploadIcon';
import { FrenchBulldogIcon } from './icons/FrenchBulldogIcon';
import { processExcelWithAI } from '../services/geminiService';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ExcelUploaderProps {
  onDataUploaded: (data: any[]) => void;
  serviceList: string[];
}


const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataUploaded, serviceList }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
      setFileName(null);
      setCsvData(null);
      setProcessedData(null);
      setError(null);
      setIsLoading(false);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    resetState();
    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dataBuffer = e.target?.result;
        const workbook = xlsx.read(dataBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(worksheet);
        setCsvData(csv);
        setError(null);
      } catch (err) {
        console.error("Error processing file:", err);
        setError("Hubo un error al procesar el archivo. Asegúrate de que tenga el formato correcto.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("No se pudo leer el archivo.");
        setIsLoading(false);
    }
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };
  
  const handleProcessWithAI = async () => {
      if (!csvData || !fileName) {
          setError("No hay datos de archivo para procesar.");
          return;
      }
      setIsLoading(true);
      setError(null);
      setProcessedData(null);

      try {
          const result = await processExcelWithAI(csvData, fileName, serviceList);
          setProcessedData(result);
      } catch (err: any) {
          setError(err.message || "Un error desconocido ocurrió durante el procesamiento de la IA.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveToApp = () => {
    if (!processedData || processedData.length === 0) {
      alert("No hay datos procesados para guardar.");
      return;
    }
    onDataUploaded(processedData);
    resetState();
  };

  return (
    <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Asistente de Importación con IA</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Transforma tablas de Excel en citas estructuradas. Sube un archivo con columnas como: Fecha, Cliente, Servicio, Costo.
        </p>
        
        {!processedData && (
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <label className="w-full md:w-auto cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors flex items-center justify-center">
                <UploadIcon className="w-5 h-5 mr-2" />
                {fileName ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
                <input
                    type="file"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                </label>
                {fileName && !isLoading && <span className="text-gray-600 dark:text-gray-300 truncate">{fileName}</span>}
            </div>
        )}

        {isLoading && <p className="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">Procesando...</p>}
        {error && <div className="mt-4 flex items-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"><AlertTriangleIcon className="w-5 h-5 mr-2" /> {error}</div>}
        
        {csvData && !processedData && !isLoading && (
            <div className="mt-6">
                 <button
                    onClick={handleProcessWithAI}
                    className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow hover:shadow-lg transition-all flex items-center justify-center"
                    >
                    <FrenchBulldogIcon className="w-5 h-5 mr-2" />
                    Procesar con Kandy AI
                </button>
            </div>
        )}

        {processedData && (
            <div className="mt-6">
                <div className="flex items-center text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mb-4">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <p className="font-semibold">{processedData.length} citas han sido procesadas y están listas para importar.</p>
                </div>
                
                <div className="max-h-60 overflow-y-auto responsive-table border border-gray-200 dark:border-gray-700 rounded-lg">
                     <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="py-2 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                                <th className="py-2 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                                <th className="py-2 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Servicios</th>
                                <th className="py-2 px-4 text-right font-semibold text-gray-600 dark:text-gray-300">Costo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                        {processedData.slice(0, 10).map((item, index) => ( // Preview first 10
                            <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                <td data-label="Cliente" className="py-2 px-4 text-gray-800 dark:text-gray-200">{item.cliente}</td>
                                <td data-label="Fecha" className="py-2 px-4 text-gray-600 dark:text-gray-400">{item.fecha}</td>
                                <td data-label="Servicios" className="py-2 px-4 text-gray-600 dark:text-gray-400">{item.servicios.join(', ')}</td>
                                <td data-label="Costo" className="py-2 px-4 text-right text-gray-800 dark:text-gray-200 font-medium">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.costo)}</td>
                            </tr>
                        ))}
                        </tbody>
                     </table>
                </div>
                 {processedData.length > 10 && <p className="text-xs text-center text-gray-500 mt-2">Mostrando los primeros 10 de {processedData.length} registros.</p>}

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleSaveToApp}
                        className="w-full sm:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600 transition-colors"
                    >
                        Guardar Citas en la Aplicación
                    </button>
                    <button
                        onClick={resetState}
                        className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                    >
                        Empezar de Nuevo
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ExcelUploader;
