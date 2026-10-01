import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';

export default function Index({ auth, resources }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'material',
        name: '',
        use_unit: 'unidad',
        unit_value: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('resources.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 tracking-tight">Insumos y Recursos</h2>}
        >
            <Head title="Insumos" />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
                
                {/* Alta Rápida - Estilo tarjeta limpia */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                        + Cargar Nuevo Recurso
                    </h3>
                    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900"
                            >
                                <option value="material">Material</option>
                                <option value="labor">Mano de obra</option>
                                <option value="asset">Herramienta</option>
                                <option value="service">Servicio</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <input
                                type="text"
                                placeholder="Nombre (ej: Bolsa de Cemento 50kg)"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Precio ($)"
                                value={data.unit_value}
                                onChange={(e) => setData('unit_value', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 font-mono"
                            />
                        </div>
                        <div className="sm:col-span-4 flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                            >
                                Guardar Insumo
                            </button>
                        </div>
                    </form>
                </div>

                {/* Listado de Insumos - Tarjeta simple sin bordes pesados */}
                <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
                    {resources.map((res) => (
                        <div key={res.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/50 transition">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-slate-900 text-sm">{res.name}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="default" className="capitalize text-[10px]">
                                        {res.type}
                                    </Badge>
                                    <span className="text-xs text-slate-400">por {res.use_unit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-base font-bold text-slate-900">
                                    ${res.unit_value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}