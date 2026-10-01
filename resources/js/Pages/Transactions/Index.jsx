import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import InputError from '@/Components/InputError';

export default function Index({ auth, transactions, budgets, summary }) {
    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        budget_id: '',
        type: 'expense',
        category: 'materiales',
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('transactions.store'), {
            onSuccess: () => reset('description', 'amount'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este movimiento?')) {
            destroy(route('transactions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Finanzas y Gastos Reales</h2>}
        >
            <Head title="Ingresos y Gastos" />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
                
                {/* Resumen Financiero */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs text-slate-400">Ingresos</span>
                        <p className="text-lg sm:text-xl font-bold font-mono text-emerald-600">
                            +${summary.totalIncome}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs text-slate-400">Gastos</span>
                        <p className="text-lg sm:text-xl font-bold font-mono text-rose-600">
                            -${summary.totalExpense}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-xs text-slate-400">Balance Real</span>
                        <p className={`text-lg sm:text-xl font-bold font-mono ${Number(summary.netProfit) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                            ${summary.netProfit}
                        </p>
                    </div>
                </div>

                {/* Formulario de Registro */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        + Registrar Movimiento
                    </h3>

                    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900"
                            >
                                <option value="expense">Gasto / Salida</option>
                                <option value="income">Ingreso / Cobro</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900"
                            >
                                <option value="materiales">Materiales e Insumos</option>
                                <option value="mano_obra">Mano de Obra / Ayudantes</option>
                                <option value="transporte">Combustible / Flete</option>
                                <option value="cobro_anticipo">Cobro Anticipo</option>
                                <option value="cobro_final">Cobro Final</option>
                                <option value="varios">Varios / Otros</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={data.budget_id}
                                onChange={(e) => setData('budget_id', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900"
                            >
                                <option value="">Sin asociar (Gasto General)</option>
                                {budgets.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        #{b.budget_number} - {b.client_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <input
                                type="text"
                                placeholder="Descripción (ej: Compra de 5 bolsas de cemento)"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Monto ($)"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm font-mono focus:ring-slate-900"
                            />
                            <InputError message={errors.amount} />
                        </div>

                        <div className="sm:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
                            >
                                Cargar Movimiento
                            </button>
                        </div>
                    </form>
                </div>

                {/* Historial de Transacciones */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    {transactions.map((t) => (
                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900 text-sm">{t.description}</span>
                                    <Badge variant={t.type === 'income' ? 'success' : 'danger'} className="text-[10px]">
                                        {t.category}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {t.transaction_date}
                                    {t.budget && ` • Presupuesto #${t.budget.budget_number} (${t.budget.client_name})`}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount}
                                </span>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="text-xs text-slate-300 hover:text-rose-600 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                            Aún no hay movimientos registrados.
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}