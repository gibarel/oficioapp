import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Show({ auth, budget }) {
    const { flash } = usePage().props;
    const { delete: destroy, processing } = useForm();
    const { t, locale } = useTranslation();

    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    const [activeModal, setActiveModal] = useState(null);

    const incomeForm = useForm({
        concept: `Cobro presupuesto #${budget.budget_number}`,
        amount: '',
        payment_method: 'Transferencia',
        income_date: new Date().toISOString().slice(0, 10),
    });

    const expenseForm = useForm({
        concept: '',
        amount: '',
        destination: budget.client_address || '',
        expense_date: new Date().toISOString().slice(0, 10),
    });

    const incomes = budget.incomes || [];
    const expenses = budget.expenses || [];

    const totalCollected = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingBalance = Math.max(0, Number(budget.total_price || 0) - totalCollected);

    const handleDelete = () => {
        if (confirm(t('common.confirmDeleteBudget', { number: budget.budget_number }))) {
            destroy(route('budgets.destroy', budget.id), {
                onSuccess: () => {
                    window.location.href = route('dashboard');
                },
            });
        }
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        router.patch(route('budgets.status.update', budget.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    const handleIncomeSubmit = (e) => {
        e.preventDefault();
        incomeForm.post(route('budgets.incomes.store', budget.id), {
            preserveScroll: true,
            onSuccess: () => {
                incomeForm.reset('amount');
                setActiveModal(null);
            },
        });
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        expenseForm.post(route('budgets.expenses.store', budget.id), {
            preserveScroll: true,
            onSuccess: () => {
                expenseForm.reset('concept', 'amount');
                setActiveModal(null);
            },
        });
    };

    const getWhatsAppShareUrl = () => {
        const cleanPhone = budget.client_phone ? budget.client_phone.replace(/[^0-9]/g, '') : '';
        const publicUrl = route('public.budgets.show', budget.uuid);

        const message = `Hola ${budget.client_name}, te adjunto el presupuesto *#${budget.budget_number}* por un total de *$${Number(budget.total_price || 0).toLocaleString(currentDateLocale)} ${budget.currency}*.\n\nPodés revisarlo y responder directamente desde este enlace:\n${publicUrl}`;

        return cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
            : `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
                            {t('budgets.detailBadge')}
                        </span>
                        <h2 className="font-bold text-2xl text-slate-800 leading-tight mt-1">
                            {t('budgets.budgetTitle', { number: budget.budget_number })}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={getWhatsAppShareUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>{t('budgets.whatsappShare')}</span>
                        </a>

                        <a
                            href={route('budgets.pdf', budget.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>{t('budgets.downloadPdf')}</span>
                        </a>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition shadow-sm disabled:opacity-50"
                        >
                            {processing ? `🗑️ ${t('common.deleting')}` : `🗑️ ${t('common.delete')}`}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={t('budgets.budgetTitle', { number: budget.budget_number })} />

            <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
                {flash?.success && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-xs font-mono font-bold text-slate-400">REF: #{budget.budget_number}</span>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{budget.client_name}</h3>
                            {budget.client_phone && (
                                <p className="text-xs text-slate-500 mt-1">{t('common.phone')}: {budget.client_phone}</p>
                            )}
                            {budget.client_address && (
                                <p className="text-xs text-slate-500">{t('common.address')}: {budget.client_address}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                                {t('common.emissionDate')}: {new Date(budget.issued_at || budget.created_at).toLocaleDateString(currentDateLocale)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('status.label')}:</span>
                            <select
                                value={budget.status}
                                onChange={handleStatusChange}
                                className={`text-xs font-bold uppercase py-1.5 px-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 transition cursor-pointer ${
                                    budget.status === 'accepted' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    budget.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' :
                                    'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                            >
                                <option value="draft">{t('status.draft')}</option>
                                <option value="accepted">{t('status.accepted')}</option>
                                <option value="rejected">{t('status.rejected')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('budgets.budgetedItems')}</h4>
                        <div className="divide-y divide-slate-100">
                            {budget.items && budget.items.length > 0 ? (
                                budget.items.map((item) => (
                                    <div key={item.id} className="py-3.5 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.work_name_snapshot || item.description}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {t('common.quantity')}: {item.quantity} × ${Number(item.unit_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <span className="font-mono font-bold text-slate-900">
                                            ${Number(item.subtotal_price || item.total_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 py-4 text-center">{t('budgets.noItems')}</p>
                            )}
                        </div>
                    </div>

                    {budget.execution_conditions && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                            <span className="font-bold uppercase tracking-wider text-slate-700 block">{t('common.conditions')}:</span>
                            <p>{budget.execution_conditions}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <div className="text-right space-y-1">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('budgets.totalBudgeted')}</span>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                                ${Number(budget.total_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                <span className="text-sm font-normal text-slate-500 ml-1.5">{budget.currency}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Cobros y gastos del trabajo</h3>
                            <p className="text-xs text-slate-500">Seguimiento de pagos recibidos y gastos asociados</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveModal(activeModal === 'income' ? null : 'income')}
                                className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
                            >
                                + Registrar cobro
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveModal(activeModal === 'expense' ? null : 'expense')}
                                className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition"
                            >
                                + Registrar gasto
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block">Cobrado</span>
                            <span className="text-base sm:text-lg font-black font-mono text-emerald-700">
                                ${totalCollected.toLocaleString(currentDateLocale, { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block">Gastos</span>
                            <span className="text-base sm:text-lg font-black font-mono text-rose-700">
                                ${totalExpenses.toLocaleString(currentDateLocale, { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[11px] font-bold uppercase text-slate-400 block">Saldo</span>
                            <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                                ${pendingBalance.toLocaleString(currentDateLocale, { minimumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    {activeModal === 'income' && (
                        <form onSubmit={handleIncomeSubmit} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Nuevo cobro</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={incomeForm.data.concept}
                                    onChange={(e) => incomeForm.setData('concept', e.target.value)}
                                    placeholder="Concepto (ej. Anticipo 50%)"
                                    required
                                    className="rounded-xl border-slate-200 text-sm bg-white"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={incomeForm.data.amount}
                                    onChange={(e) => incomeForm.setData('amount', e.target.value)}
                                    placeholder="Monto ($)"
                                    required
                                    className="rounded-xl border-slate-200 text-sm font-mono bg-white"
                                />
                                <input
                                    type="text"
                                    value={incomeForm.data.payment_method}
                                    onChange={(e) => incomeForm.setData('payment_method', e.target.value)}
                                    placeholder="Medio de pago"
                                    className="rounded-xl border-slate-200 text-sm bg-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={incomeForm.processing}
                                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                                >
                                    Guardar cobro
                                </button>
                            </div>
                        </form>
                    )}

                    {activeModal === 'expense' && (
                        <form onSubmit={handleExpenseSubmit} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-900">Nuevo gasto del presupuesto</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={expenseForm.data.concept}
                                    onChange={(e) => expenseForm.setData('concept', e.target.value)}
                                    placeholder="Concepto (ej. Flete / Material extra)"
                                    required
                                    className="rounded-xl border-slate-200 text-sm bg-white"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={expenseForm.data.amount}
                                    onChange={(e) => expenseForm.setData('amount', e.target.value)}
                                    placeholder="Monto ($)"
                                    required
                                    className="rounded-xl border-slate-200 text-sm font-mono bg-white"
                                />
                                <input
                                    type="text"
                                    value={expenseForm.data.destination}
                                    onChange={(e) => expenseForm.setData('destination', e.target.value)}
                                    placeholder="Destino / Proveedor"
                                    className="rounded-xl border-slate-200 text-sm bg-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={expenseForm.processing}
                                    className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                                >
                                    Guardar gasto
                                </button>
                            </div>
                        </form>
                    )}

                    {(incomes.length > 0 || expenses.length > 0) && (
                        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2 text-sm">
                            {incomes.map((inc) => (
                                <div key={`inc-${inc.id}`} className="py-2.5 flex justify-between items-center">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mr-2">
                                            Cobro
                                        </span>
                                        <span className="font-medium text-slate-800">{inc.concept}</span>
                                        {inc.payment_method && (
                                            <span className="text-xs text-slate-400 ml-2">({inc.payment_method})</span>
                                        )}
                                    </div>
                                    <span className="font-mono font-bold text-emerald-700">
                                        +${Number(inc.amount || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}

                            {expenses.map((exp) => (
                                <div key={`exp-${exp.id}`} className="py-2.5 flex justify-between items-center">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mr-2">
                                            Gasto
                                        </span>
                                        <span className="font-medium text-slate-800">{exp.concept}</span>
                                        {exp.destination && (
                                            <span className="text-xs text-slate-400 ml-2">({exp.destination})</span>
                                        )}
                                    </div>
                                    <span className="font-mono font-bold text-rose-700">
                                        -${Number(exp.amount || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}