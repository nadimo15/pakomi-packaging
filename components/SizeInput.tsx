import React from 'react';
import Tooltip from './Tooltip';
import { InfoIcon } from './Icons';

interface SizeInputProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipText?: string;
  step?: number;
  min?: number;
  required?: boolean;
}

const SizeInput: React.FC<SizeInputProps> = ({ label, value, onChange, tooltipText, step = 1, min = 0.1, required = false }) => {
  return (
    <div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse mb-1">
        <label className="block text-sm font-medium text-gray-600">{label}{required && <span className="text-red-500">*</span>}</label>
        {tooltipText && (
          <Tooltip text={tooltipText}>
            <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          value={value === 0 ? '' : value}
          onChange={onChange}
          min={min}
          step={step}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="0"
          required={required}
        />
         <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 text-sm">cm</span>
      </div>
    </div>
  );
};

export default SizeInput;