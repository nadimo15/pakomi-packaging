import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, Role, Permission } from '../../types.ts';
import { XCircleIcon } from '../Icons.tsx';
import { AVAILABLE_PERMISSIONS } from '../../constants.ts';

interface RoleFormModalProps {
    language: Language;
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Role) => void;
    initialRole: Role | null;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ language, isOpen, onClose, onSave, initialRole }) => {
    const { t } = useLocalization(language);
    const [role, setRole] = useState<Omit<Role, 'id'>>({ name: '', permissions: [] });

    useEffect(() => {
        if (initialRole) {
            setRole({ name: initialRole.name, permissions: initialRole.permissions });
        } else {
            setRole({ name: '', permissions: [] });
        }
    }, [initialRole, isOpen]);

    if (!isOpen) return null;

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setRole(prev => ({
            ...prev,
            permissions: isChecked
                ? [...prev.permissions, permission]
                : prev.permissions.filter(p => p !== permission)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...role, id: initialRole?.id || `role-${Date.now()}` });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full" 
                onClick={e => e.stopPropagation()}
                role="dialog" aria-modal="true" aria-labelledby="role-modal-title"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 id="role-modal-title" className="text-2xl font-bold text-gray-800">{initialRole ? t('editRole') : t('addNewRole')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><XCircleIcon className="w-7 h-7" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role-name-input" className="block text-sm font-medium text-gray-700 mb-1">{t('roleName')}</label>
                        <input
                            id="role-name-input"
                            type="text" 
                            value={role.name}
                            onChange={e => setRole(p => ({...p, name: e.target.value}))}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('permissions')}</label>
                        <div className="space-y-2 p-3 border rounded-md bg-gray-50 max-h-48 overflow-y-auto">
                            {Object.keys(AVAILABLE_PERMISSIONS).map(key => {
                                const permission = key as Permission;
                                return (
                                    <label key={permission} className="flex items-center p-1 rounded hover:bg-gray-100 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={role.permissions.includes(permission)}
                                            onChange={e => handlePermissionChange(permission, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">{AVAILABLE_PERMISSIONS[permission]}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus">{t('saveChanges')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleFormModal;
