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
                    {/* Encabezado */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-xs font-mono font-bold text-slate-400">REF: #{budget.budget_number}</span>
                            <h3 className="text-xl font-extrabold text-