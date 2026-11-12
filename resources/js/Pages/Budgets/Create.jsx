import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, works = [] }) {
    const { t, locale } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        client_name: '',
        client_phone: '',
        client_address: '',
        currency: 'ARS',
        execution_conditions: 'Presupuesto válido por 15 días. Pago 50% anticipo y 50% contra entrega.',
        items: [],
    });

    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    const handleAddWork = (e) => {
        const workId = e.target.value;
        if (!workId) return;

        const work = (works || []).find((w) => w.id === parseInt(workId));
        if (!work) return;

        if (data.items.some((item) => item.work_id === work.id)) {
            e.target.value = '';
            return;
        }

        const unitPrice = Number(work.unit_price) || Number(work.base_price) || 0;

        const newItem = {
            work_id: work.id,
            description: work.name,
            calculation_method: work.calculation_method,
            quantity: 1,
            unit: work.reference_unit || 'u.',
            unit_price: unitPrice,
            total_price: unitPrice,
        };

        setData('items', [...data.items, newItem]);
        e.target.value = '';
    };

    const handleQuantityChange = (index, value) => {
        const updatedItems = [...data.items];
        const qty = parseFloat(value) || 0;
        updatedItems[index].quantity = qty;
        updatedItems[index].total_price = qty * (Number(updatedItems[index].unit_price) || 0);
        setData('items', updatedItems);
    };

    const handleRemoveItem = (index) => {
        const updatedItems = data.items.filter((_, i) => i !== index);
        setData('items', updatedItems);
    };

    const calculatedSubtotal = data.items.reduce(
        (sum, item) => sum + (Number(item.total_price) || 0),
        0
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('budgets.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">{t('budgets.createTitle')}</h2>}
        >
            <Head title={t('budgets.createTitle')} />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos del Cliente */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <h3 className="text-base font-bold text-slate-800">{t('budgets.clientData')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    {t('budgets.clientName')}
                                </label>
                                <input
                                    type="text"
                                    value={data.client_name}
                                    onChange={(e) => setData('client_name', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                                    placeholder="ej. Juan Pérez"
                                    required
                                />
                                {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    {t('budgets.clientPhone')}
                                </label>
                                <input
                                    type="text"
                                    value={data.client_phone}
                                    onChange={(e) => setData('client_phone', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                                    placeholder="ej. 11 3426 4951"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    {t('budgets.clientAddress')}
                                </label>
                                <input
                                    type="text"
                                    value={data.client_address}
                                    onChange={(e) => setData('client_address', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm"
                                    placeholder="ej. Av. Corrientes 1234"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ítems a Presupuestar */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h3 className="text-base font-bold text-slate-800">{t('budgets.itemsToBudget')}</h3>
                            <select
                                onChange={handleAddWork}
                                defaultValue=""
                                className="w-full sm:w-auto rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900 text-sm py-2 px-3 bg-slate-50 font-medium text-slate-700 cursor-pointer"
                            >
                                <option value="" disabled>{t('budgets.selectWorkPlaceholder')}</option>
                                {Array.isArray(works) && works.length > 0 ? (
                                    works.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} ({w.reference_unit || 'u.'}) - ${Number(w.unit_price || w.base_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>{t('budgets.noWorksAvailable')}</option>
                                )}
                            </select>
                        </div>

                        {data.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                                            <th className="py-2">{t('dashboard.worksCatalogTitle')}</th>
                                            <th className="py-2 text-center w-40">{t('common.quantity')} / {t('common.unitPrice').split(' ')[1] || 'Unid.'}</th>
                                            <th className="py-2 text-right">{t('common.unitPrice')}</th>
                                            <th className="py-2 text-right">{t('common.subtotal')}</th>
                                            <th className="py-2 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-3 font-semibold text-slate-800">{item.description}</td>
                                                <td className="py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                            className="w-20 rounded-xl border-slate-200 text-center text-sm py-1 focus:border-slate-900 focus:ring-slate-900"
                                                        />
                                                        <span className="text-xs font-bold text-slate-500 uppercase">{item.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right text-slate-600 font-mono">
                                                    ${Number(item.unit_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-900 font-mono">
                                                    ${Number(item.total_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                                                    >
                                                        {t('common.remove')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('budgets.estimatedTotal')}</span>
                                        <p className="text-2xl font-extrabold font-mono text-slate-900">
                                            ${Number(calculatedSubtotal || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                {t('budgets.emptyItemsPrompt')}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || data.items.length === 0}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                        >
                            {t('common.saveAndIssue')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}