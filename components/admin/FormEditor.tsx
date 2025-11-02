import React, { useState, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language, FormConfig, FormSectionKey, FormField } from '../../types';
import { DragHandleIcon } from '../Icons';

interface FormEditorProps {
    language: Language;
    config: FormConfig;
    onConfigUpdate: (config: FormConfig) => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ language, config, onConfigUpdate }) => {
    const { t } = useLocalization(language);
    const [formConfig, setFormConfig] = useState<FormConfig>(config);
    const [isSaved, setIsSaved] = useState(false);

    // Section Drag and Drop state
    const sectionDragItem = useRef<number | null>(null);
    const sectionDragOverItem = useRef<number | null>(null);

    // Field Drag and Drop state
    const fieldDragItem = useRef<{section: FormSectionKey, index: number} | null>(null);
    const fieldDragOverItem = useRef<{section: FormSectionKey, index: number} | null>(null);
    
    // State to force re-render on drag end
    const [dragCounter, setDragCounter] = useState(0);

    const handleSectionToggle = (sectionKey: FormSectionKey, value: boolean) => {
        setFormConfig(prev => ({ ...prev, [sectionKey]: { ...prev[sectionKey], enabled: value } }));
        setIsSaved(false);
    };

    const handleFieldToggle = (sectionKey: FormSectionKey, fieldIndex: number, value: boolean) => {
        setFormConfig(prev => {
            const newFields = [...prev[sectionKey].fields];
            newFields[fieldIndex].enabled = value;
            return { ...prev, [sectionKey]: { ...prev[sectionKey], fields: newFields }};
        });
        setIsSaved(false);
    };
    
    const handleFieldRequiredToggle = (sectionKey: FormSectionKey, fieldIndex: number, value: boolean) => {
        setFormConfig(prev => {
            const newFields = [...prev[sectionKey].fields];
            newFields[fieldIndex].required = value;
            return { ...prev, [sectionKey]: { ...prev[sectionKey], fields: newFields }};
        });
        setIsSaved(false);
    };

    const handleSave = () => {
        onConfigUpdate(formConfig);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    // Section Drag Handlers
    const handleSectionDrop = () => {
        if (sectionDragItem.current !== null && sectionDragOverItem.current !== null) {
            const newOrder = [...formConfig.sectionOrder];
            const [draggedItem] = newOrder.splice(sectionDragItem.current, 1);
            newOrder.splice(sectionDragOverItem.current, 0, draggedItem);
            setFormConfig(prev => ({ ...prev, sectionOrder: newOrder }));
            setIsSaved(false);
        }
        sectionDragItem.current = null;
        sectionDragOverItem.current = null;
        setDragCounter(c => c + 1);
    };

    // Field Drag Handlers
    const handleFieldDrop = () => {
        if (fieldDragItem.current && fieldDragOverItem.current && fieldDragItem.current.section === fieldDragOverItem.current.section) {
            const {section, index: fromIndex} = fieldDragItem.current;
            const {index: toIndex} = fieldDragOverItem.current;

            const newFields = [...formConfig[section].fields];
            const [draggedItem] = newFields.splice(fromIndex, 1);
            newFields.splice(toIndex, 0, draggedItem);

            setFormConfig(prev => ({...prev, [section]: {...prev[section], fields: newFields}}));
            setIsSaved(false);
        }
        fieldDragItem.current = null;
        fieldDragOverItem.current = null;
        setDragCounter(c => c + 1);
    };

    const Toggle: React.FC<{id: string, label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({id, label, checked, onChange}) => (
         <label htmlFor={id} className="flex items-center cursor-pointer">
            <div className="relative">
                <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-full bg-primary' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 text-xs font-medium">{label}</div>
        </label>
    );

    return (
        <div className="max-w-4xl mx-auto" key={dragCounter}>
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{t('formEditor')}</h2>
                    <p className="text-sm text-gray-600">{t('formEditorDescription')}</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`px-6 py-2 font-semibold text-white rounded-lg transition-all ${isSaved ? 'bg-green-500' : 'bg-primary hover:bg-primary-focus'}`}
                >
                    {isSaved ? t('saved') : t('saveChanges')}
                </button>
            </div>
    
            <div className="space-y-4">
                {formConfig.sectionOrder.map((sectionKey, index) => {
                    const section = formConfig[sectionKey];
                    if (!section) return null;
    
                    return (
                        <div
                            key={sectionKey}
                            draggable
                            onDragStart={() => (sectionDragItem.current = index)}
                            onDragEnter={() => (sectionDragOverItem.current = index)}
                            onDragEnd={handleSectionDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="p-4 border rounded-lg bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-move text-gray-400" title={t('dragToReorder')}><DragHandleIcon className="w-5 h-5" /></div>
                                    <h3 className="font-bold text-lg text-gray-800">{t(sectionKey)}</h3>
                                </div>
                                <Toggle id={`section-toggle-${sectionKey}`} label={t('enabled')} checked={section.enabled} onChange={(val) => handleSectionToggle(sectionKey, val)} />
                            </div>
    
                            <div className={`space-y-2 pl-8 ${!section.enabled && 'opacity-50'}`}>
                                {section.fields.map((field, fieldIndex) => (
                                    <div
                                        key={field.id}
                                        draggable={section.enabled}
                                        onDragStart={(e) => { if(section.enabled) fieldDragItem.current = { section: sectionKey, index: fieldIndex }; else e.preventDefault(); }}
                                        onDragEnter={() => { if(section.enabled) fieldDragOverItem.current = { section: sectionKey, index: fieldIndex }; }}
                                        onDragEnd={handleFieldDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`text-gray-400 ${section.enabled ? 'cursor-move' : 'cursor-not-allowed'}`} title={t('dragToReorder')}><DragHandleIcon className="w-5 h-5" /></div>
                                            <span className="text-sm font-medium text-gray-700">{t(field.labelKey) || field.id}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Toggle id={`field-required-${sectionKey}-${fieldIndex}`} label={t('required')} checked={field.required} onChange={(val) => handleFieldRequiredToggle(sectionKey, fieldIndex, val)} />
                                            <Toggle id={`field-enabled-${sectionKey}-${fieldIndex}`} label={t('enabled')} checked={field.enabled} onChange={(val) => handleFieldToggle(sectionKey, fieldIndex, val)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormEditor;