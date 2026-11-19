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
                        + Nuevo Trabajo
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
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-slate-900 text-base">{work.name}</h3>
                                <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md uppercase">
                                    {work.reference_unit}
                                </span>
                            </div>

                            {work.resources && work.resources.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {work.resources.slice(0, 3).map((res) => (
                                        <span
                                            key={res.id}
                                            className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200/70 px-2 py-0.5 rounded-md"
                                        >
                                            {res.name} ({Number(res.pivot?.quantity || 0)} {res.pivot?.unit || 'u'})
                                        </span>
                                    ))}
                                    {work.resources.length > 3 && (
                                        <span className="text-[11px] text-slate-400 px-1 py-0.5">
                                            +{work.resources.length - 3} más
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-2 border-t border-slate-50 text-xs">
                                <span className="text-slate-400">
                                    {work.resources ? work.resources.length : 0} insumos vinculados
                                </span>
                                <span className="font-semibold text-slate-900 hover:underline">
                                    Ver detalle →
                                </span>
                            </div>
                        </Link>
                    ))}

                    {(!works || works.length === 0) && (
                        <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
                            No hay trabajos registrados en el catálogo.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}