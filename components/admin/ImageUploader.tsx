import React, { useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language } from '../../types';
import { UploadIcon, TrashIcon } from '../Icons';

interface ImageUploaderProps {
    language: Language;
    label: string;
    imageB64: string | null;
    onImageUpload: (b64: string | null) => void;
    helpText?: string;
}

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ language, label, imageB64, onImageUpload, helpText }) => {
    const { t } = useLocalization(language);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (file) {
            const b64 = await fileToB64(file);
            onImageUpload(b64);
        }
    };

    const handleRemoveImage = () => {
        onImageUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
            />
            {!imageB64 ? (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                    <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="font-semibold text-primary">{t('uploadImage')}</span>
                    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
                </button>
            ) : (
                <div className="flex items-center space-x-4 rtl:space-x-reverse p-3 border rounded-lg">
                    <img src={imageB64} alt="Preview" className="w-16 h-16 object-contain rounded-md bg-gray-100" />
                    <div className="flex-grow">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            {t('changeImage')}
                        </button>
                        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label={t('removeImage')}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;