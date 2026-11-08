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

    // Agregar un recurso (material, mano de obra o herramienta) al trabajo
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

    // Actualizar campos de un recurso vinculado
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
                <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre del Trabajo / Servicio</label>
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

                    {/* SECCIÓN MÉTODO SIMPLE */}
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

                    {/* SECCIÓN MÉTODO INTERMEDIO / AVANZADO */}
                    {(data.calculation_method === 'intermediate' || data.calculation_method === 'advanced') && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                        Recursos Asociados (Materiales, Mano de Obra y Herramientas)
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Suma de insumos, esfuerzo humano y activos requeridos por cada {data.reference_unit || 'unidad'}.
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
                                                        <span className="font-semibold text-slate-800 text-sm block">{res.