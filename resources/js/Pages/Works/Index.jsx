import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, works }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Trabajos y Servicios</h2>}>
            <Head title="Trabajos" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Catalogo de Plantillas y Trabajos</h3>
                    <Link
                        href={route('works.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        + Nuevo Trabajo
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {works.map((work) => (
                        <div key={work.id} className="bg-white shadow rounded-lg p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <h4 className="text-md font-bold text-gray-900">{work.name}</h4>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">{work.calculation_method}</span>
                            </div>
                            <p className="text-sm text-gray-500">Unidad de referencia: <span className="font-semibold">{work.reference_unit}</span></p>
                            <div className="text-xs text-gray-400">
                                Insumos asociados: {work.resources ? work.resources.length : 0}
                            </div>
                            <div className="pt-2 border-t flex justify-end">
                                <Link href={route('works.show', work.id)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                    Ver Desglose Económico →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}