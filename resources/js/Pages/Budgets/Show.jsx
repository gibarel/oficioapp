import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Badge from '@/Components/Badge';

export default function Show({ auth, budget }) {

    // Generar enlace dinámico para WhatsApp
    const getWhatsAppShareUrl = () => {
    const cleanPhone = budget.client_phone ? budget.client_phone.replace(/[^0-9]/g, '') : '';
    const publicUrl = route('public.budgets.show', budget.uuid);
    
    const message = `Hola ${budget.client_name}, te adjunto el presupuesto *#${budget.budget_number}* por un total de *$${budget.total_price} ${budget.currency}*.\n\nPodés revisarlo y responder directamente desde este enlace:\n${publicUrl}`;
    
    return cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;
};

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 tracking-tight">
                        Presupuesto #{budget.budget_number}
                    </h2>
                    <div className="flex gap-2">
                        {/* Botón WhatsApp */}
                        <a
                            href={getWhatsAppShareUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>WhatsApp</span>
                        </a>

                        {/* Botón Descargar PDF */}
                        <a
                            href={route('budgets.pdf', budget.id)}
                            target="_blank"
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>Descargar PDF</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    {/* Encabezado */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                            <span className="text-xs font-mono text-slate-400">#{budget.budget_number}</span>
                            <h3 className="text-xl font-bold text-slate-900">{budget.client_name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Emisión: {new Date(budget.issued_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant={budget.status === 'accepted' ? 'success' : 'default'}>
                            {budget.status}
                        </Badge>
                    </div>

                    {/* Tabla simplificada de ítems */}
                    <div className="divide-y divide-slate-100">
                        {budget.items.map((item) => (
                            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-slate-900">{item.work_name_snapshot}</p>
                                    <p className="text-xs text-slate-400">Cant: {item.quantity} x ${item.unit_price}</p>
                                </div>
                                <span className="font-mono font-bold text-slate-900">${item.subtotal_price}</span>
                            </div>
                        ))}
                    </div>

                    {/* Resumen Total */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <div className="text-right space-y-1">
                            <p className="text-xs text-slate-400">Total Presupuestado</p>
                            <p className="text-2xl font-extrabold font-mono text-slate-900">
                                ${budget.total_price} <span className="text-sm font-normal text-slate-500">{budget.currency}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}