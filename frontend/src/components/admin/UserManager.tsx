import React from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, User, Role } from '../../types.ts';
import { TrashIcon } from '../Icons.tsx';

interface UserManagerProps {
    language: Language;
    users: User[];
    roles: Role[];
    onUserUpdate: (user: User) => void;
    onUserDelete: (userId: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ language, users, roles, onUserUpdate, onUserDelete }) => {
    const { t } = useLocalization(language);

    const handleRoleChange = (userId: string, newRoleId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            onUserUpdate({ ...user, roleId: newRoleId });
        }
    };

    if (users.length === 0) {
        return <p className="text-gray-500 text-sm">No users in this category.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 hidden md:table-header-group">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('fullName')}</th>
                        <th scope="col" className="px-6 py-3">{t('emailAddress')}</th>
                        <th scope="col" className="px-6 py-3">{t('role')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        return (
                            <tr key={user.id} className="bg-white block mb-4 p-4 rounded-lg border md:table-row md:p-0 md:border-b md:rounded-none">
                                <td className="font-medium text-gray-900 block md:table-cell md:px-6 md:py-4">
                                     <span className="font-bold md:hidden">{t('fullName')}: </span>{user.name}
                                </td>
                                <td className="block text-gray-600 md:table-cell md:px-6 md:py-4 pt-1 md:pt-0">
                                     <span className="font-bold md:hidden">{t('emailAddress')}: </span>{user.email}
                                </td>
                                <td className="block md:table-cell md:px-6 md:py-4 py-2">
                                     <label className="font-bold md:hidden pr-2">{t('role')}: </label>
                                    <select 
                                        value={user.roleId || ''} 
                                        onChange={e => handleRoleChange(user.id, e.target.value)}
                                        className="p-1.5 border rounded-md bg-white text-xs border-gray-300 focus:ring-primary focus:border-primary inline-block"
                                        aria-label={`${t('role')} for ${user.name}`}
                                    >
                                        <option value="">{t('customers')}</option>
                                        {roles.filter(r => r.name !== 'Customer').map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="block md:table-cell md:px-6 md:py-4 text-right border-t mt-2 pt-2 md:border-none md:mt-0 md:pt-0">
                                    <button 
                                        onClick={() => onUserDelete(user.id)} 
                                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
                                        aria-label={`${t('delete')} ${user.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserManager;
