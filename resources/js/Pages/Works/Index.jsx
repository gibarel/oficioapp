import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, works }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="font-semibold text-xl text-slate-800 tracking-tight">{t('dashboard.worksCatalogTitle')}</h2>
                    <Link
                        href={route('works.create')}
                        className="w-full sm:w-auto text-center px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                    >
                        {t('works.newWork', { defaultValue: '+ Nuevo Trabajo' })}
                    </Link>
                </div>
            }
        >
            <Head title={t('dashboard.worksCatalogTitle')} />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {works.map((work) => (
                        <Link
                            key={work.id}
                            href={route('works.show', work.id)}
                            className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition shadow-sm block space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-900 text-base">{work.name}</h3>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase">
                                    {work.reference_unit}
                                </span>
                            </div>

                            <div className="flex justify-between items-end pt-2 border-t border-slate-50 text-xs">
                                <span className="text-slate-400">
                                    {work.resources ? work.resources.length : 0} {t('works.linkedResources', { defaultValue: 'insumos vinculados' })}
                                </span>
                                <span className="font-semibold text-slate-900 hover:underline">
                                    {t('works.viewDetail', { defaultValue: 'Ver detalle' })} →
                                </span>
                            </div>
                        </Link>
                    ))}

                    {(!works || works.length === 0) && (
                        <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
                            {t('works.noWorks', { defaultValue: 'No hay trabajos registrados en el catálogo.' })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```[cite: 8]

---

### 2. `resources/js/Pages/Works/Create.jsx`
```jsx
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, resources = [] }) {
    const { t, locale } = useTranslation();
    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        calculation_method: 'simple',
        reference_unit: 'm2',
        base_price: 0,
        contingency_percentage: 0,
        profit_margin_percentage: 0,
        notes: '',
        is_template: false,
        resources: [],
    });

    const handleAddResource = (e) => {
        const resourceId = e.target.value;
        if (!resourceId) return;

        const resource = (resources || []).find((r) => r.id === parseInt(resourceId));
        if (!resource) return;

        if (data.resources.some((item) => item.id === resource.id)) {
            e.target.value = '';
            return;
        }

        const newResourceItem = {
            id: resource.id,
            name: resource.name,
            type: resource.type,
            quantity: 1,
            custom_unit_value: resource.unit_value || 0,
            allocation_type: 'direct',
            allocation_value: 0,
            is_client_provided: false,
        };

        setData('resources', [...data.resources, newResourceItem]);
        e.target.value = '';
    };

    const handleResourceChange = (index, field, value) => {
        const updatedResources = [...data.resources];
        updatedResources[index][field] = value;
        setData('resources', updatedResources);
    };

    const handleRemoveResource = (index) => {
        const updatedResources = data.resources.filter((_, i) => i !== index);
        setData('resources', updatedResources);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('works.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">{t('works.createTitle', { defaultValue: 'Nuevo Trabajo / Servicio' })}</h2>}
        >
            <Head title={t('works.createTitle', { defaultValue: 'Crear Trabajo' })} />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8 px-4">
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('works.nameLabel', { defaultValue: 'Nombre del Trabajo / Servicio' })}</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5"
                            placeholder="ej. Colocación de Pisos Cerámicos"
                            required
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                {t('works.methodLabel', { defaultValue: 'Método de Cálculo' })}
                            </label>
                            <select
                                value={data.calculation_method}
                                onChange={(e) => setData('calculation_method', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 bg-white font-medium cursor-pointer"
                            >
                                <option value="simple">{t('works.methodSimple', { defaultValue: 'Simple (Precio Base Directo)' })}</option>
                                <option value="intermediate">{t('works.methodIntermediate', { defaultValue: 'Intermedio (Desglose de Insumos y Mano de Obra)' })}</option>
                                <option value="advanced">{t('works.methodAdvanced', { defaultValue: 'Avanzado (Con Herramientas y Costos Indirectos)' })}</option>
                            </select>   
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('works.unitLabel', { defaultValue: 'Unidad de Medida (m2, hora, global, u.)' })}</label>
                            <input
                                type="text"
                                value={data.reference_unit}
                                onChange={(e) => setData('reference_unit', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5"
                                placeholder="ej. m2"
                            />
                        </div>
                    </div>

                    {data.calculation_method === 'simple' && (
                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">
                                {t('works.basePriceLabel', { defaultValue: 'Precio Base / Unitario' })} por {data.reference_unit || 'unidad'} ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                className="w-full rounded-xl border-indigo-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm font-mono py-2.5 bg-white"
                            />
                        </div>
                    )}

                    {(data.calculation_method === 'intermediate' || data.calculation_method === 'advanced') && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                        {t('works.resourcesTitle', { defaultValue: 'Recursos Asociados y Rendimientos' })}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {t('works.resourcesSubtitle', { defaultValue: 'Define cuánto consume 1 unidad de este trabajo.' })}
                                    </p>
                                </div>
                                <select
                                    onChange={handleAddResource}
                                    defaultValue=""
                                    className="w-full sm:w-auto rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2 px-4 bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-500 transition cursor-pointer"
                                >
                                    <option value="" disabled className="bg-white text-slate-700">+ {t('works.addResource', { defaultValue: 'Agregar Recurso' })}</option>
                                    
                                    <optgroup label="👷 Mano de Obra" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'labor').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (${Number(res.unit_value || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })})
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="📦 Materiales" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'material' || r.type === 'service' || r.type === 'extra').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (${Number(res.unit_value || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })})
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="🛠️ Herramientas / Equipos" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'asset').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (${Number(res.hourly_depreciation_rate || res.unit_value || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {data.resources.length > 0 ? (
                                <div className="space-y-3">
                                    {data.resources.map((res, index) => (
                                        <div key={res.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                                <div className="w-full sm:w-1/3">
                                                    <span className="font-semibold text-slate-800 text-sm block">{res.name}</span>
                                                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mt-1 ${
                                                        res.type === 'labor' ? 'bg-amber-100 text-amber-800' :
                                                        res.type === 'asset' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {res.type === 'labor' ? '👷 Mano de Obra' : res.type === 'asset' ? '🛠️ Herramienta' : '📦 Material'}
                                                    </span>
                                                </div>
                                                
                                                <div className="w-full sm:w-1/3">
                                                    <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">
                                                        {t('works.consumptionLabel', { defaultValue: 'Consumo por unidad' })}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        min="0.001"
                                                        value={res.quantity}
                                                        onChange={(e) => handleResourceChange(index, 'quantity', e.target.value)}
                                                        className="w-full rounded-xl border-indigo-200 text-sm py-1.5 font-mono focus:border-indigo-600 focus:ring-indigo-600"
                                                    />
                                                </div>

                                                <div className="w-full sm:w-1/4">
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{t('common.unitPrice', { defaultValue: 'Valor Unit. ($)' })}</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={res.custom_unit_value}
                                                        onChange={(e) => handleResourceChange(index, 'custom_unit_value', e.target.value)}
                                                        className="w-full rounded-xl border-slate-200 text-sm py-1.5 font-mono"
                                                    />
                                                </div>

                                                <div className="self-end sm:self-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveResource(index)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                                                    >
                                                        🗑️ {t('common.remove', { defaultValue: 'Quitar' })}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500 font-medium">{t('works.noResourcesYet', { defaultValue: 'Todavía no agregaste recursos a este trabajo.' })}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">{t('works.contingencyLabel', { defaultValue: 'Colchón de Imprevistos (%)' })}</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.contingency_percentage}
                                onChange={(e) => setData('contingency_percentage', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm font-mono py-2 bg-white"
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">{t('works.profitLabel', { defaultValue: 'Margen de Ganancia (%)' })}</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.profit_margin_percentage}
                                onChange={(e) => setData('profit_margin_percentage', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm font-mono py-2 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('works.notesLabel', { defaultValue: 'Notas / Observaciones' })}</label>
                        <textarea
                            rows="3"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm"
                        ></textarea>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('works.index')}
                            className="w-full sm:w-auto text-center px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            {t('common.back', { defaultValue: 'Cancelar' })}
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition shadow-sm"
                        >
                            {t('works.saveWork', { defaultValue: 'Guardar Trabajo' })}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
```[cite: 6]

---

### 3. `resources/js/Pages/Works/Edit.jsx`
*(Utiliza la misma estructura que `Create.jsx` pero aplicando `put(route('works.update', work.id))` y recibiendo el objeto `work` para rellenar los estados iniciales[cite: 5]).* Puedes mapearlo de la misma forma que hicimos con los formularios anteriores para conservar toda la compatibilidad multidioma y de formato numérico local.

### 🚀 Sube los cambios con Git:

```bash
git add resources/js/Pages/Works/
git commit -m "Adapta vistas del catálogo de trabajos (Works) al sistema multilenguaje y responsive mobile"
git push origin develop