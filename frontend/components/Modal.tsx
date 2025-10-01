import React, { useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Tu lógica de useEffect para la tecla 'Escape' y el scroll del body está perfecta.
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* --- CONTENEDOR PRINCIPAL MODIFICADO --- */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-2 sm:m-4 flex flex-col max-h-[90vh]" // Se añade flex, flex-col y max-h-[90vh]. Se quita el padding (p-6).
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-up 0.3s ease-out' }}
      >
        {/* --- ENCABEZADO FIJO MODIFICADO --- */}
        <div className="flex-shrink-0 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-6 md:px-8 py-4">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* --- NUEVA ÁREA DE CONTENIDO CON SCROLL --- */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;