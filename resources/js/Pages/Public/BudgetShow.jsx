import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';

export default function BudgetShow({ budget }) {
    const { post, processing } = useForm({});

    const handleStatusUpdate = (status) => {
        post(route('public.budgets.status', { uuid: budget.uuid, status }));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6">
            <Head title={`Presupuesto #${budget.budget_number}`} />

            <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Encabezado del Profesional */}
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold text-slate-900">
                        {budget.user?.profile?.business_name || budget.user?.name}
                    </h1>
                    <p className="text-xs text-slate-500">Presupuesto de Trabajo / Servicio</p>
                </div>

                {/* Tarjeta del Presupuesto */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <span className="text-xs font-mono text-slate-400">#{budget.budget_number}</span>
                            <h2 className="text-lg font-bold text-slate-900">{budget.client_name}</h2>
                            <p className="text-xs text-slate-500">
                                Emitido: {new Date(budget.issued_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant={budget.status === 'accepted' ? 'success' : budget.status === 'rejected' ? 'danger' : 'default'}>
                            {budget.status === 'accepted' ? 'Aceptado' : budget.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                    </div>

                    {/* Ítems */}
                    <div className="divide-y divide-slate-100">
                        {budget.items.map((item) => (
                            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-slate-900">{item.work_name_snapshot}</p>
                                    <p className="text-xs text-slate-400">Cantidad: {item.quantity}</p>
                                </div>
                                <span className="font-mono font-bold text-slate-900">${item.subtotal_price}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <div className="text-right">
                            <span className="text-xs text-slate-400">Total a Pagar</span>
                            <p className="text-3xl font-extrabold font-mono text-slate-900">
                                ${budget.total_price} <span className="text-sm font-normal text-slate-500">{budget.currency}</span>
                            </p>
                        </div>
                    </div>

                    {budget.execution_conditions && (
                        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                            <p className="font-bold text-slate-700">Condiciones del Servicio:</p>
                            <p>{budget.execution_conditions}</p>
                        </div>
                    )}
                </div>

                {/* Acciones para el Cliente */}
                {budget.status !== 'accepted' && budget.status !== 'rejected' && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3">
                        <button
                            onClick={() => handleStatusUpdate('rejected')}
                            disabled={processing}
                            className="w-1/2 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Rechazar
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('accepted')}
                            disabled={processing}
                            className="w-1/2 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition"
                        >
                            Aceptar Presupuesto
                        </button>
                    </div>
                )}

                {budget.status === 'accepted' && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-center text-sm font-medium">
                        ✓ Has aceptado este presupuesto. El profesional se pondrá en contacto a la brevedad.
                    </div>
                )}
            </div>
        </div>
    );
}