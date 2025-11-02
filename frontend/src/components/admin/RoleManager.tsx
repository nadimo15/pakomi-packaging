import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, Role } from '../../types.ts';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons.tsx';
import RoleFormModal from './RoleFormModal.tsx';

interface RoleManagerProps {
    language: Language;
    roles: Role[];
    onRoleUpdate: (role: Role) => void;
    onRoleDelete: (roleId: string) => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ language, roles, onRoleUpdate, onRoleDelete }) => {
    const { t } = useLocalization(language);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const handleOpenModal = (role: Role | null = null) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleSaveRole = (role: Role) => {
        const trimmedName = role.name.trim();
        if (!trimmedName) {
            alert("Role name cannot be empty.");
            return;
        }

        // Validation: Check for duplicate role names (case-insensitive)
        const isDuplicate = roles.some(
            r => r.name.trim().toLowerCase() === trimmedName.toLowerCase() && r.id !== role.id
        );

        if (isDuplicate) {
            alert(`A role with the name "${trimmedName}" already exists. Please use a different name.`);
            return; // Prevent saving
        }
        
        onRoleUpdate({ ...role, name: trimmedName });
        setIsModalOpen(false);
        setEditingRole(null);
    };

    return (
        <div>
            {isModalOpen && (
                <RoleFormModal 
                    language={language}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRole}
                    initialRole={editingRole}
                />
            )}
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-focus shadow-sm">
                    <PlusIcon className="w-5 h-5" />
                    {t('addNewRole')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 hidden md:table-header-group">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('roleName')}</th>
                            <th scope="col" className="px-6 py-3">{t('permissions')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(role => (
                            <tr key={role.id} className="bg-white block mb-4 p-4 rounded-lg border md:table-row md:p-0 md:border-b md:rounded-none">
                                <td className="font-medium text-gray-900 block md:table-cell md:px-6 md:py-4">
                                     <span className="font-bold md:hidden">{t('roleName')}: </span>
                                     {role.name}
                                </td>
                                <td className="block md:table-cell md:px-6 md:py-4 py-2">
                                     <span className="font-bold md:hidden">{t('permissions')}: </span>
                                    <div className="flex flex-wrap gap-1 mt-1 md:mt-0">
                                        {role.permissions.length > 0 ? role.permissions.map(p => (
                                            <span key={p} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">{p}</span>
                                        )) : <span className="text-xs text-gray-400">No permissions</span>}
                                    </div>
                                </td>
                                <td className="block md:table-cell md:px-6 md:py-4 text-right border-t mt-2 pt-2 md:border-none md:mt-0 md:pt-0">
                                    <button onClick={() => handleOpenModal(role)} className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100" aria-label={`${t('edit')} ${role.name}`}>
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onRoleDelete(role.id)} 
                                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                                        aria-label={`${t('delete')} ${role.name}`}
                                        disabled={['Admin', 'Customer'].includes(role.name)}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManager;
