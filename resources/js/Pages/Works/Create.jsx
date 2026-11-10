import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create({ auth, resources = [] }) {
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
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Nuevo Trabajo / Servicio</h2>}
        >
            <Head title="Crear Trabajo" />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre del Trabajo / Servicio</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5"
                            placeholder="ej. Colocación de Pisos Cerámicos o Pintura de Paredes"
                            required
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Método de Cálculo
                            </label>
                            <select
                                value={data.calculation_method}
                                onChange={(e) => setData('calculation_method', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 bg-white font-medium"
                            >
                                <option value="simple">Simple (Precio Base Directo)</option>
                                <option value="intermediate">Intermedio (Desglose de Insumos y Mano de Obra)</option>
                                <option value="advanced">Avanzado (Con Herramientas, Amortización y Costos Indirectos)</option>
                            </select>   
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Unidad de Medida (m2, hora, global, u.)</label>
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
                            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">Precio Base / Unitario por {data.reference_unit || 'unidad'} ($)</label>
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
                                        Recursos Asociados y Rendimientos
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Define cuánto consume 1 {data.reference_unit || 'unidad'} de este trabajo (ej. si 1 lata rinde 10 m2, ingresa 0.1).
                                    </p>
                                </div>
                                <select
                                    onChange={handleAddResource}
                                    defaultValue=""
                                    className="rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2 px-4 bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-500 transition cursor-pointer"
                                >
                                    <option value="" disabled className="bg-white text-slate-700">+ Agregar Recurso</option>
                                    
                                    <optgroup label="👷 Mano de Obra" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'labor').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (${Number(res.unit_value || 0).toFixed(2)})
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="📦 Materiales" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'material' || r.type === 'service' || r.type === 'extra').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (${Number(res.unit_value || 0).toFixed(2)})
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="🛠️ Herramientas / Equipos (Depreciación)" className="bg-white text-slate-700">
                                        {resources.filter(r => r.type === 'asset').map((res) => (
                                            <option key={res.id} value={res.id} className="text-slate-800">
                                                {res.name} (Deprec. hora: ${Number(res.hourly_depreciation_rate || res.unit_value || 0).toFixed(2)})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {data.resources.length > 0 ? (
                                <div className="space-y-3">
                                    {data.resources.map((res, index) => {
                                        return (
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
                                                            Consumo por 1 {data.reference_unit || 'u.'}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            min="0.001"
                                                            value={res.quantity}
                                                            onChange={(e) => handleResourceChange(index, 'quantity', e.target.value)}
                                                            className="w-full rounded-xl border-indigo-200 text-sm py-1.5 font-mono focus:border-indigo-600 focus:ring-indigo-600"
                                                        />
                                                        <span className="text-[10px] text-slate-400 block mt-0.5">Fracción o unidades gastadas por cada 1 {data.reference_unit || 'u.'}</span>
                                                    </div>

                                                    <div className="w-full sm:w-1/4">
                                                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Valor Unit. ($)</label>
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
                                                            🗑️ Quitar
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60 text-xs">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={res.is_client_provided}
                                                            onChange={(e) => handleResourceChange(index, 'is_client_provided', e.target.checked)}
                                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="font-medium text-slate-600">Material provisto por el cliente (Costo $0)</span>
                                                    </label>

                                                    <div className="flex items-center gap-2 ml-auto">
                                                        <span className="text-slate-400 font-bold uppercase text-[10px]">Tipo de Imputación:</span>
                                                        <select
                                                            value={res.allocation_type}
                                                            onChange={(e) => handleResourceChange(index, 'allocation_type', e.target.value)}
                                                            className="rounded-lg border-slate-200 text-xs py-1 bg-white font-medium"
                                                        >
                                                            <option value="direct">Directo (Cant. × Valor)</option>
                                                            <option value="percentage_share">Porcentaje Indirecto (%)</option>
                                                            <option value="fixed_estimate">Monto Fijo Global</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500 font-medium">Todavía no agregaste recursos a este trabajo.</p>
                                    <p className="text-xs text-slate-400 mt-1">Usa el selector superior para incorporar materiales, mano de obra o herramientas.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Colchón de Imprevistos (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.contingency_percentage}
                                onChange={(e) => setData('contingency_percentage', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm font-mono py-2 bg-white"
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Margen de Ganancia (%)</label>
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Notas / Observaciones</label>
                        <textarea
                            rows="3"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm"
                            placeholder="Detalles sobre herramientas necesarias, especificaciones técnicas, etc."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('works.index')}
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition shadow-sm"
                        >
                            Guardar Trabajo
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}