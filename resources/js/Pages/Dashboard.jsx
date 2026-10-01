import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Badge from '@/Components/Badge';

export default function Dashboard({ auth, stats, recentBudgets }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">
                            Hola, {auth.user.name} 👋
                        </h2>
                        <p className="text-xs text-slate-500">Resumen general de tu actividad</p>
                    </div>
                    <Link
                        href={route('budgets.create')}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition shadow-sm"
                    >
                        + Nuevo Presupuesto
                    </Link>
                </div>
            }
        >
            <Head title="Panel Principal" />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* Métricas Principales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs font-medium text-slate-400">Total Facturable</span>
                        <p className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900">
                            ${stats.totalAmountSum}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs font-medium text-slate-400">Emitidos</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
                            {stats.totalIssued}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs font-medium text-slate-400">Aprobados</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                            {stats.totalApproved}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs font-medium text-slate-400">Borradores</span>
                        <p className="text-xl sm:text-2xl font-extrabold text-slate-500">
                            {stats.totalDrafts}
                        </p>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href={route('budgets.create')}
                        className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between hover:bg-slate-800 transition"
                    >
                        <div>
                            <p className="font-semibold text-sm">Crear Presupuesto</p>
                            <p className="text-xs text-slate-400">Calcular y emitir a cliente</p>
                        </div>
                        <span className="text-lg">→</span>
                    </Link>

                    <Link
                        href={route('works.index')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition shadow-sm"
                    >
                        <div>
                            <p className="font-semibold text-sm text-slate-900">Catálogo de Trabajos</p>
                            <p className="text-xs text-slate-400">Plantillas y métodos de cálculo</p>
                        </div>
                        <span className="text-lg text-slate-400">→</span>
                    </Link>

                    <Link
                        href={route('resources.index')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition shadow-sm"
                    >
                        <div>
                            <p className="font-semibold text-sm text-slate-900">Insumos y Materiales</p>
                            <p className="text-xs text-slate-400">Precios base y herramientas</p>
                        </div>
                        <span className="text-lg text-slate-400">→</span>
                    </Link>
                </div>

                {/* Presupuestos Recientes */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                            Presupuestos Recientes
                        </h3>
                        <Link href={route('budgets.index')} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                            Ver todos →
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentBudgets.map((b) => (
                            <Link
                                key={b.id}
                                href={route('budgets.show', b.id)}
                                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition block text-sm"
                            >
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-slate-400">#{b.budget_number}</span>
                                        <p className="font-semibold text-slate-900">{b.client_name}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {new Date(b.issued_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="text-right space-y-1">
                                    <p className="font-mono font-bold text-slate-900">${b.total_price}</p>
                                    <Badge variant={b.status === 'accepted' ? 'success' : 'default'}>
                                        {b.status}
                                    </Badge>
                                </div>
                            </Link>
                        ))}

                        {recentBudgets.length === 0 && (
                            <div className="p-8 text-center text-xs text-slate-400">
                                No tenés presupuestos recientes registrados.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}