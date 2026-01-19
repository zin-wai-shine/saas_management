import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger", // danger, success, info
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return "bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/30";
      case 'success':
        return "bg-green-500/20 border-green-500/30 text-white hover:bg-green-500/30";
      default:
        return "bg-teal-glass/20 border-teal-glass/30 text-white hover:bg-teal-glass/30";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center space-y-5 py-6 px-4">
        {/* Icon Container */}
        <div>
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium disabled:opacity-50 min-w-[100px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2 border backdrop-blur-md transition-all text-sm font-medium disabled:opacity-50 rounded min-w-[100px] ${getConfirmButtonClass()}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "The action was completed successfully.", 
  buttonText = "Awesome" 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center space-y-5 py-6 px-4">
        {/* Icon Container */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="w-full pt-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-glass/20 border border-teal-glass/30 text-white rounded backdrop-blur-md hover:bg-teal-glass/30 transition-all text-sm font-medium min-w-[120px]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};



