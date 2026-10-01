import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, availableResources }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        calculation_method: 'simple',
        reference_unit: 'm2',
        base_price: '',
        contingency_percentage: 5,
        profit_margin_percentage: 20,
        notes: '',
        resources: [],
    });

    const addResource = (resourceId) => {
        if (!resourceId) return;
        const res = availableResources.find((r) => r.id === parseInt(resourceId));
        if (!res || data.resources.some((r) => r.id === res.id)) return;

        setData('resources', [
            ...data.resources,
            {
                id: res.id,
                name: res.name,
                quantity: 1,
                custom_unit_value: res.unit_value,
                allocation_type: 'direct',
                allocation_value: 0,
                is_client_provided: false,
            },
        ]);
    };

    const updateResourceRow = (index, field, value) => {
        const updated = [...data.resources];
        updated[index][field] = value;
        setData('resources', updated);
    };

    const removeResourceRow = (index) => {
        setData('resources', data.resources.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('works.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Nuevo Trabajo / Estructura de Costo</h2>}>
            <Head title="Crear Trabajo" />

            <form onSubmit={submit} className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="bg-white p-6 shadow rounded-lg space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Datos Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Tarea/Servicio</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="Ej: Colocación de Cerámicos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Método de Cálculo</label>
                            <select
                                value={data.calculation_method}
                                onChange={(e) => setData('calculation_method', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="simple">Simple (Global / Precio Base)</option>
                                <option value="intermediate">Intermedio (Recursos + Margen)</option>
                                <option value="advanced">Avanzado (Indirectos + Amortización)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidad de Referencia</label>
                            <input
                                type="text"
                                value={data.reference_unit}
                                onChange={(e) => setData('reference_unit', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="m2, ml, hora, punto"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {data.calculation_method === 'simple' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio Base ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.base_price}
                                    onChange={(e) => setData('base_price', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">% Imprevistos / Contingencia</label>
                            <input
                                type="number"
                                value={data.contingency_percentage}
                                onChange={(e) => setData('contingency_percentage', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">% Margen de Ganancia</label>
                            <input
                                type="number"
                                value={data.profit_margin_percentage}
                                onChange={(e) => setData('profit_margin_percentage', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Selección e Imputación de Recursos */}
                {data.calculation_method !== 'simple' && (
                    <div className="bg-white p-6 shadow rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Insumos y Recursos Atribuidos</h3>
                            <select
                                onChange={(e) => {
                                    addResource(e.target.value);
                                    e.target.value = '';
                                }}
                                className="border-gray-300 rounded-md text-sm"
                            >
                                <option value="">+ Agregar Insumo desde Catálogo</option>
                                {availableResources.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} (${r.unit_value})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Recurso</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Tipo Asignación</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Costo Custom</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500">Provisto p/ Cliente</th>
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.resources.map((res, index) => (
                                    <tr key={res.id}>
                                        <td className="px-2 py-2 font-medium text-sm">{res.name}</td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={res.quantity}
                                                onChange={(e) => updateResourceRow(index, 'quantity', e.target.value)}
                                                className="w-24 border-gray-300 rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <select
                                                value={res.allocation_type}
                                                onChange={(e) => updateResourceRow(index, 'allocation_type', e.target.value)}
                                                className="border-gray-300 rounded text-sm"
                                            >
                                                <option value="direct">Directo</option>
                                                <option value="hourly_rate">Tarifa Horaria</option>
                                                <option value="percentage_share">% Imputación</option>
                                                <option value="fixed_estimate">Monto Fijo</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={res.custom_unit_value}
                                                onChange={(e) => updateResourceRow(index, 'custom_unit_value', e.target.value)}
                                                className="w-28 border-gray-300 rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={res.is_client_provided}
                                                onChange={(e) => updateResourceRow(index, 'is_client_provided', e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeResourceRow(index)}
                                                className="text-red-600 hover:text-red-800 text-xs"
                                            >
                                                Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Guardar Trabajo
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}