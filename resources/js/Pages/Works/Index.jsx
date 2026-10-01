import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, works }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 tracking-tight">Trabajos y Servicios</h2>
                    <Link
                        href={route('works.create')}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition"
                    >
                        + Nuevo Trabajo
                    </Link>
                </div>
            }
        >
            <Head title="Trabajos" />

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

                            <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                <span className="text-xs text-slate-400">
                                    {work.resources ? work.resources.length : 0} insumos vinculados
                                </span>
                                <span className="text-xs font-semibold text-slate-900 hover:underline">
                                    Ver detalle →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}