import React, { useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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
    // --- OVERLAY MODIFICADO PARA PERMITIR SCROLL DE PÁGINA ---
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 overflow-y-auto flex justify-center items-start p-4 pt-10 pb-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* --- CONTENEDOR MODIFICADO PARA TAMAÑO AUTOMÁTICO --- */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 m-auto sm:m-0 relative"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-up 0.3s ease-out' }}
      >
        {/* Encabezado y contenido (sin cambios internos) */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
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