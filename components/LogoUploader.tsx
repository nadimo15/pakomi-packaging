import React, { useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language } from '../types';
import { UploadIcon, XCircleIcon, CheckCircleIcon } from './Icons';

interface LogoUploaderProps {
  language: Language;
  hasLogo: boolean;
  onLogoUpload: (base64: string) => void;
  onLogoRemove: () => void;
}

// Helper to convert a file to a Base64 data URI
const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const LogoUploader: React.FC<LogoUploaderProps> = ({ language, hasLogo, onLogoUpload, onLogoRemove }) => {
    const { t } = useLocalization(language);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            // Basic validation for file size
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File is too large. Maximum size is 2MB.');
                return;
            }
            
            try {
                const b64 = await fileToB64(file);
                onLogoUpload(b64);
            } catch (error) {
                console.error("Error converting file to Base64:", error);
                alert("There was an error processing your file. Please try again.");
            }
        }
    };

    const handleRemove = () => {
        onLogoRemove();
        // Reset the file input so the user can re-upload the same file if they want
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">{t('uploadYourLogoOptional')}</h4>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
                accept="image/png, image/jpeg, image/svg+xml, application/pdf, .ai, .psd"
            />
            {!hasLogo ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    aria-label={t('uploadLogo')}
                >
                    <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="font-semibold text-primary">{t('uploadLogo')}</span>
                    <p className="text-xs text-gray-500 mt-1">{t('logoUploadHelpText')}</p>
                </button>
            ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-green-800">{t('logoUploaded')}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-full flex-shrink-0"
                        aria-label={t('removeLogo')}
                    >
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default LogoUploader;