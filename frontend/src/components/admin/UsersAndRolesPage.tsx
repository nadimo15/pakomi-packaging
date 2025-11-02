import React from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, User, Role } from '../../types.ts';
import UserManager from './UserManager.tsx';
import RoleManager from './RoleManager.tsx';

interface UsersAndRolesPageProps {
    language: Language;
    users: User[];
    roles: Role[];
    onUserUpdate: (user: User) => void;
    onUserDelete: (userId: string) => void;
    onRoleUpdate: (role: Role) => void;
    onRoleDelete: (roleId: string) => void;
}

const UsersAndRolesPage: React.FC<UsersAndRolesPageProps> = ({ 
    language, users, roles, onUserUpdate, onUserDelete, onRoleUpdate, onRoleDelete 
}) => {
    const { t } = useLocalization(language);

    const staffUsers = users.filter(u => {
        const role = roles.find(r => r.id === u.roleId);
        return role && role.name !== 'Customer';
    });
    
    const customerUsers = users.filter(u => {
        const role = roles.find(r => r.id === u.roleId);
        return !role || role.name === 'Customer';
    });

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('userManagement')}</h2>
                <div className="space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('staff')}</h3>
                        <UserManager 
                            users={staffUsers} 
                            roles={roles} 
                            onUserUpdate={onUserUpdate} 
                            onUserDelete={onUserDelete} 
                            language={language}
                        />
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('customers')}</h3>
                        <UserManager 
                            users={customerUsers} 
                            roles={roles} 
                            onUserUpdate={onUserUpdate} 
                            onUserDelete={onUserDelete} 
                            language={language}
                        />
                    </div>
                </div>
            </div>
            <div className="pt-8 border-t">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('roleManagement')}</h2>
                <RoleManager 
                    roles={roles} 
                    onRoleUpdate={onRoleUpdate} 
                    onRoleDelete={onRoleDelete} 
                    language={language}
                />
            </div>
        </div>
    );
};

export default UsersAndRolesPage;
