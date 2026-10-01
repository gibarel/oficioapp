import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, resources }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'material',
        name: '',
        use_unit: 'unidad',
        unit_value: '',
        purchase_unit: '',
        conversion_factor: 1,
        acquisition_cost: '',
        useful_life_months: '',
        estimated_monthly_use_hours: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('resources.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Insumos y Recursos</h2>}>
            <Head title="Insumos y Recursos" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Formulario de Alta */}
                <div className="p-6 bg-white shadow rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Nuevo Insumo / Herramienta</h3>
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="material">Material / Insumo</option>
                                <option value="labor">Mano de Obra</option>
                                <option value="asset">Herramienta / Equipo Propio</option>
                                <option value="service">Servicio / Indirecto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Insumo</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="Ej: Cable Unipolar 2.5mm / Taladro Perforador"
                            />
                            {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidad de Uso</label>
                            <input
                                type="text"
                                value={data.use_unit}
                                onChange={(e) => setData('use_unit', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="m, kg, hora, global"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Costo Unitario Referencia</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.unit_value}
                                onChange={(e) => setData('unit_value', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="0.00"
                            />
                            {errors.unit_value && <div className="text-red-600 text-sm">{errors.unit_value}</div>}
                        </div>

                        {data.type === 'asset' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Costo Adquisición</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.acquisition_cost}
                                        onChange={(e) => setData('acquisition_cost', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vida Útil (Meses)</label>
                                    <input
                                        type="number"
                                        value={data.useful_life_months}
                                        onChange={(e) => setData('useful_life_months', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Uso Estimado Mensual (Hs)</label>
                                    <input
                                        type="number"
                                        value={data.estimated_monthly_use_hours}
                                        onChange={(e) => setData('estimated_monthly_use_hours', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Guardar Recurso
                            </button>
                        </div>
                    </form>
                </div>

                {/* Listado */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Catálogo de Insumos</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor Base</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Depreciación / h</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {resources.map((res) => (
                                <tr key={res.id}>
                                    <td className="px-4 py-2 font-medium text-gray-900">{res.name}</td>
                                    <td className="px-4 py-2 text-gray-500 capitalize">{res.type}</td>
                                    <td className="px-4 py-2 text-gray-500">{res.use_unit}</td>
                                    <td className="px-4 py-2 text-right font-mono">${res.unit_value}</td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-500">
                                        {res.hourly_depreciation_rate ? `$${res.hourly_depreciation_rate}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}