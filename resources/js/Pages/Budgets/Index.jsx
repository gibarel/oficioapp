import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, budgets = [] }) {
    const { flash } = usePage().props;
    const { t, locale } = useTranslation();

    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredBudgets = useMemo(() => {
        return budgets.filter((budget) => {
            const matchesSearch =
                (budget.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (budget.budget_number || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [budgets, searchTerm, statusFilter]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t('status.accepted', { defaultValue: 'Aprobado' })}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">
                        {t('status.rejected', { defaultValue: 'Rechazado' })}
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        {t('status.draft', { defaultValue: 'Borrador' })}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-bold leading-tight text-slate-900 tracking-tight">
                        Presupuestos
                    </h2>

                    <Link
                        href={route('budgets.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                    >
                        + Nuevo Presupuesto
                    </Link>
                </div>
            }
        >
            <Head title="Presupuestos" />

            <div className="py-6 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm">
                        {flash.success}
                    </div>
                )}

                {/* Buscador y Filtros por Estado */}
                <div className="bg-white p-5 shadow-sm rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="w-full sm:w-1/2">
                        <input
                            type="text"
                            placeholder="Buscar por cliente o número de presupuesto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2"
                        />
                    </div>

                    <div className="w-full sm:w-auto flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Todos ({budgets.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('draft')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === 'draft' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Borradores
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('accepted')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === 'accepted' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Aprobados
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('rejected')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                statusFilter === 'rejected' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Rechazados
                        </button>
                    </div>
                </div>

                {/* Listado de Presupuestos */}
                <div className="bg-white shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Número</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100 text-sm">
                                {filteredBudgets.length > 0 ? (
                                    filteredBudgets.map((budget) => (
                                        <tr key={budget.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-indigo-600">
                                                <Link href={route('budgets.show', budget.id)} className="hover:underline">
                                                    #{budget.budget_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {budget.client_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                                                {new Date(budget.issued_at || budget.created_at).toLocaleDateString(currentDateLocale)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {getStatusBadge(budget.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-extrabold text-slate-900">
                                                ${Number(budget.total_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                                <span className="text-xs font-normal text-slate-400 ml-1">{budget.currency}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                <Link
                                                    href={route('budgets.show', budget.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-xs text-slate-400">
                                            No se encontraron presupuestos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}