import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, title, children, onClose, actionButton }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-center">
          {children}
        </div>
        {actionButton && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };
