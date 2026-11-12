import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Dashboard({ auth, stats, recentBudgets }) {
    const user = auth?.user;
    const { t, locale } = useTranslation();

    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">
                            {t('common.hello')}, {user?.name || t('common.user')} 👋
                        </h2>
                        <p className="text-xs text-slate-500">{t('common.dashboardSubtitle')}</p>
                    </div>
                    <Link
                        href={route('budgets.create')}
                        className="w-full sm:w-auto text-center px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                    >
                        {t('common.newBudget')}
                    </Link>
                </div>
            }
        >
            <Head title={t('dashboard.title')} />

            <div className="py-6 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
                
                {/* Métricas Principales */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('dashboard.totalBillable')}
                        </span>
                        <p className="text-lg sm:text-2xl font-black font-mono text-slate-900 truncate">
                            ${Number(stats?.totalAmountSum || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('dashboard.issued')}
                        </span>
                        <p className="text-lg sm:text-2xl font-black font-mono text-slate-900">
                            {stats?.totalIssued || 0}
                        </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('dashboard.approved')}
                        </span>
                        <p className="text-lg sm:text-2xl font-black font-mono text-emerald-600">
                            {stats?.totalApproved || 0}
                        </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {t('dashboard.pendingCount')}
                        </span>
                        <p className="text-lg sm:text-2xl font-black font-mono text-amber-600">
                            {stats?.totalDrafts || 0}
                        </p>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                        href={route('budgets.create')}
                        className="p-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-between hover:bg-indigo-700 transition shadow-sm"
                    >
                        <div>
                            <p className="font-bold text-sm">{t('dashboard.createBudgetTitle')}</p>
                            <p className="text-xs text-indigo-100">{t('dashboard.createBudgetDesc')}</p>
                        </div>
                        <span className="text-xl font-bold">→</span>
                    </Link>

                    <Link
                        href={route('works.index')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition shadow-sm"
                    >
                        <div>
                            <p className="font-bold text-sm text-slate-900">{t('dashboard.worksCatalogTitle')}</p>
                            <p className="text-xs text-slate-400">{t('dashboard.worksCatalogDesc')}</p>
                        </div>
                        <span className="text-lg text-slate-400">→</span>
                    </Link>

                    <Link
                        href={route('resources.index')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition shadow-sm"
                    >
                        <div>
                            <p className="font-bold text-sm text-slate-900">{t('dashboard.resourcesTitle')}</p>
                            <p className="text-xs text-slate-400">{t('dashboard.resourcesDesc')}</p>
                        </div>
                        <span className="text-lg text-slate-400">→</span>
                    </Link>
                </div>

                {/* Presupuestos Recientes */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                            {t('dashboard.recentBudgets')}
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentBudgets?.map((b) => (
                            <Link
                                key={b.id}
                                href={route('budgets.show', b.id)}
                                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition block text-sm"
                            >
                                <div className="space-y-1 pr-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                            #{b.budget_number}
                                        </span>
                                        <p className="font-bold text-slate-900 text-sm sm:text-base">{b.client_name}</p>
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {t('common.issuedDate')}: {new Date(b.issued_at || b.created_at).toLocaleDateString(currentDateLocale)}
                                    </p>
                                </div>

                                <div className="text-right space-y-1.5 shrink-0">
                                    <p className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                                        ${Number(b.total_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                    </p>
                                    <div>
                                        <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                                            b.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                            b.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                            {b.status === 'draft' ? t('status.pending') : t(`status.${b.status}`)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {(!recentBudgets || recentBudgets.length === 0) && (
                            <div className="p-8 text-center text-xs text-slate-400">
                                {t('dashboard.noRecentBudgets')}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}