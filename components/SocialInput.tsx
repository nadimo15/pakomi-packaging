import React from 'react';

interface SocialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const SocialInput: React.FC<SocialInputProps> = ({ icon, ...props }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        {icon}
      </div>
      <input
        type="text"
        className="w-full ps-10 p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        {...props}
      />
    </div>
  );
};

export default SocialInput;