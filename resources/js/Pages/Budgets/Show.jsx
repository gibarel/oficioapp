import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Badge from '@/Components/Badge';

export default function Show({ auth, budget }) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que deseas eliminar el presupuesto #${budget.budget_number}? Esta acción no se puede deshacer.`)) {
            destroy(route('budgets.destroy', budget.id));
        }
    };

    // Generar enlace dinámico para WhatsApp
    const getWhatsAppShareUrl = () => {
        const cleanPhone = budget.client_phone ? budget.client_phone.replace(/[^0-9]/g, '') : '';
        const publicUrl = route('public.budgets.show', budget.uuid);
        
        const message = `Hola ${budget.client_name}, te adjunto el presupuesto *#${budget.budget_number}* por un total de *$${Number(budget.total_price || 0).toLocaleString('es-AR')} ${budget.currency}*.\n\nPodés revisarlo y responder directamente desde este enlace:\n${publicUrl}`;
        
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
                            Detalle de Presupuesto
                        </span>
                        <h2 className="font-bold text-2xl text-slate-800 leading-tight mt-1">
                            Presupuesto #{budget.budget_number}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Botón WhatsApp */}
                        <a
                            href={getWhatsAppShareUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>💬 WhatsApp</span>
                        </a>

                        {/* Botón Descargar PDF */}
                        <a
                            href={route('budgets.pdf', budget.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                            <span>📄 Descargar PDF</span>
                        </a>

                        {/* Botón Eliminar Presupuesto */}
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition shadow-sm"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    {/* Encabezado del cliente */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-xs font-mono font-bold text-slate-400">REF: #{budget.budget_number}</span>
                            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{budget.client_name}</h3>
                            {budget.client_phone && (
                                <p className="text-xs text-slate-500 mt-1">Tel: {budget.client_phone}</p>
                            )}
                            {budget.client_address && (
                                <p className="text-xs text-slate-500">Dir: {budget.client_address}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                                Emisión: {new Date(budget.issued_at || budget.created_at).toLocaleDateString('es-AR')}
                            </p>
                        </div>
                        <Badge variant={budget.status === 'accepted' ? 'success' : budget.status === 'rejected' ? 'danger' : 'default'}>
                            {budget.status}
                        </Badge>
                    </div>

                    {/* Tabla de ítems */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ítems Presupuestados</h4>
                        <div className="divide-y divide-slate-100">
                            {budget.items && budget.items.length > 0 ? (
                                budget.items.map((item) => (
                                    <div key={item.id} className="py-3.5 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.work_name_snapshot || item.description}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Cantidad: {item.quantity} × ${Number(item.unit_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <span className="font-mono font-bold text-slate-900">
                                            ${Number(item.subtotal_price || item.total_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 py-4 text-center">No hay ítems registrados en este presupuesto.</p>
                            )}
                        </div>
                    </div>

                    {/* Condiciones de ejecución si existen */}
                    {budget.execution_conditions && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                            <span className="font-bold uppercase tracking-wider text-slate-700 block">Condiciones:</span>
                            <p>{budget.execution_conditions}</p>
                        </div>
                    )}

                    {/* Resumen Total */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <div className="text-right space-y-1">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Presupuestado</span>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                                ${Number(budget.total_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} 
                                <span className="text-sm font-normal text-slate-500 ml-1.5">{budget.currency}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}