import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import { Language, Task, TaskPriority } from '../../types.ts';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons.tsx';

interface TodoManagerProps {
    language: Language;
    tasks: Task[];
    onTasksUpdate: (tasks: Task[]) => void;
}

const TodoManager: React.FC<TodoManagerProps> = ({ language, tasks, onTasksUpdate }) => {
    const { t } = useLocalization(language);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
    const [sortBy, setSortBy] = useState<'priority' | 'date'>('priority');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: Omit<Task, 'id' | 'createdAt' | 'isCompleted'> = {
            text: newTaskText.trim(),
            priority: newTaskPriority,
        };
        // Create the new task and prepend it to the list
        const updatedTasks = [
            { ...newTask, id: `task-${Date.now()}`, isCompleted: false, createdAt: new Date().toISOString() },
            ...tasks
        ];
        onTasksUpdate(updatedTasks);
        setNewTaskText('');
        setNewTaskPriority('Medium');
    };

    const handleToggleComplete = (taskId: string) => {
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        );
        onTasksUpdate(updatedTasks);
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        onTasksUpdate(updatedTasks);
    };
    
    const priorityMap: Record<TaskPriority, { value: number; color: string; labelKey: string }> = {
        High: { value: 3, color: 'bg-red-100 text-red-800', labelKey: 'high' },
        Medium: { value: 2, color: 'bg-yellow-100 text-yellow-800', labelKey: 'medium' },
        Low: { value: 1, color: 'bg-blue-100 text-blue-800', labelKey: 'low' },
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            // Completed tasks always go to the bottom
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }

            if (sortBy === 'priority') {
                const priorityA = priorityMap[a.priority].value;
                const priorityB = priorityMap[b.priority].value;
                if (priorityA !== priorityB) {
                    return sortDirection === 'desc' ? priorityB - priorityA : priorityA - priorityB;
                }
            }

            // Fallback to date sorting
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [tasks, sortBy, sortDirection, priorityMap]);

    const handleSortChange = (newSortBy: 'priority' | 'date') => {
        if (sortBy === newSortBy) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortDirection('desc');
        }
    };
    
    const SortButton: React.FC<{ labelKey: string, sortKey: 'priority' | 'date' }> = ({ labelKey, sortKey }) => (
        <button
            onClick={() => handleSortChange(sortKey)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortBy === sortKey ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {t(labelKey)}
            {sortBy === sortKey && (
                sortDirection === 'desc' ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('toDo')}</h2>
            
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder={t('newTaskPlaceholder')}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex items-center gap-3">
                    <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        aria-label={t('priority')}
                    >
                        <option value="High">{t('high')}</option>
                        <option value="Medium">{t('medium')}</option>
                        <option value="Low">{t('low')}</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus shadow-sm flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>{t('addTask')}</span>
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">{t('sortBy')}:</span>
                <div className="flex items-center gap-2">
                    <SortButton labelKey="sortByPriority" sortKey="priority" />
                    <SortButton labelKey="sortByDate" sortKey="date" />
                </div>
            </div>

            <div className="space-y-3">
                {sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <div
                            key={task.id}
                            className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${task.isCompleted ? 'bg-gray-100 opacity-60' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => handleToggleComplete(task.id)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                                aria-label={`Mark task as ${task.isCompleted ? 'incomplete' : 'complete'}`}
                            />
                            <div className="flex-grow">
                                <p className={`text-gray-800 ${task.isCompleted ? 'line-through' : ''}`}>{task.text}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${priorityMap[task.priority].color}`}>
                                {t(priorityMap[task.priority].labelKey)}
                            </span>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full flex-shrink-0"
                                aria-label="Delete task"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>{t('noTasks')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoManager;
