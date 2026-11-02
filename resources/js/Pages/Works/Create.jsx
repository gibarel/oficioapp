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

    // Agregar un insumo o mano de obra al trabajo
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
            custom_unit_value: resource.unit_value || resource.unit_price || 0,
            allocation_type: 'direct',
            allocation_value: 0,
            is_client_provided: false,
        };

        setData('resources', [...data.resources, newResourceItem]);
        e.target.value = '';
    };

    // Actualizar campos de un insumo/mano de obra vinculado
    const handleResourceChange = (index, field, value) => {
        const updatedResources = [...data.resources];
        updatedResources[index][field] = value;
        setData('resources', updatedResources);
    };

    // Quitar recurso vinculado
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
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre del Trabajo / Servicio</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                            placeholder="ej. Colocación de Pisos Cerámicos"
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
                                className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                            >
                                <option value="simple">Simple (Precio Base Directo)</option>
                                <option value="intermediate">Intermedio (Desglose de Insumos y Mano de Obra)</option>
                                <option value="advanced">Avanzado (Con Amortización, Equipos y Costos Indirectos)</option>
                            </select>   
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Unidad de Medida (m2, m, global)</label>
                            <input
                                type="text"
                                value={data.reference_unit}
                                onChange={(e) => setData('reference_unit', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                                placeholder="ej. m2"
                            />
                        </div>
                    </div>

                    {/* SECCIÓN MÉTODO SIMPLE */}
                    {data.calculation_method === 'simple' && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Precio Base / Unitario ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                            />
                        </div>
                    )}

                    {/* SECCIÓN MÉTODO INTERMEDIO / AVANZADO */}
                    {(data.calculation_method === 'intermediate' || data.calculation_method === 'advanced') && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                        Mano de Obra, Materiales e Insumos
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Suma del esfuerzo humano (horas/jornadas) y los materiales requeridos.
                                    </p>
                                </div>
                                <select
                                    onChange={handleAddResource}
                                    defaultValue=""
                                    className="rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm py-2 px-3 bg-slate-50 font-medium text-slate-700"
                                >
                                    <option value="" disabled>+ Vincular Mano de Obra o Material</option>
                                    
                                    <optgroup label="👷 Mano de Obra">
                                        {Array.isArray(resources) && resources
                                            .filter(r => r.type === 'labor')
                                            .map((res) => (
                                                <option key={res.id} value={res.id}>
                                                    {res.name} (${Number(res.unit_value || res.unit_price || 0).toFixed(2)})
                                                </option>
                                            ))}
                                    </optgroup>

                                    <optgroup label="📦 Materiales e Insumos">
                                        {Array.isArray(resources) && resources
                                            .filter(r => r.type !== 'labor')
                                            .map((res) => (
                                                <option key={res.id} value={res.id}>
                                                    {res.name} (${Number(res.unit_value || res.unit_price || 0).toFixed(2)})
                                                </option>
                                            ))}
                                    </optgroup>
                                </select>
                            </div>

                            {data.resources.length > 0 ? (
                                <div className="space-y-3">
                                    {data.resources.map((res, index) => {
                                        const isLabor = res.type === 'labor';
                                        return (
                                            <div key={res.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                                                <div className="w-full sm:w-1/3">
                                                    <span className="font-semibold text-slate-800 text-sm block">{res.name}</span>
                                                    <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mt-1 ${isLabor ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {isLabor ? '👷 Mano de Obra' : '📦 Material'}
                                                    </span>
                                                </div>
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                                                        {isLabor ? 'Horas / Cantidad' : 'Cantidad'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={res.quantity}
                                                        onChange={(e) => handleResourceChange(index, 'quantity', e.target.value)}
                                                        className="w-full rounded-lg border-slate-200 text-sm py-1 font-mono"
                                                    />
                                                </div>
                                                <div className="w-full sm:w-1/4">
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                                                        Valor Unit. ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={res.custom_unit_value}
                                                        onChange={(e) => handleResourceChange(index, 'custom_unit_value', e.target.value)}
                                                        className="w-full rounded-lg border-slate-200 text-sm py-1 font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveResource(index)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-semibold pt-4"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                                    No hay insumos ni mano de obra vinculados a este trabajo todavía.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">% Imprevistos</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.contingency_percentage}
                                onChange={(e) => setData('contingency_percentage', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">% Margen Ganancia</label>
                            <input
                                type="number"
                                step="0.1"
                                value={data.profit_margin_percentage}
                                onChange={(e) => setData('profit_margin_percentage', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Notas / Observaciones</label>
                        <textarea
                            rows="3"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('works.