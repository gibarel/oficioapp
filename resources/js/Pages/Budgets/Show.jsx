import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Show({ auth, budget }) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Presupuesto {budget.budget_number}</h2>}>
            <Head title={`Presupuesto ${budget.budget_number}`} />

            <div className="py-12 max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="bg-white p-8 shadow-lg rounded-lg space-y-6">
                    {/* Header */}
                    <div className="flex justify-between border-b pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">PRESUPUESTO</h3>
                            <p className="text-sm text-gray-500">N°: {budget.budget_number}</p>
                            <p className="text-sm text-gray-500">Fecha: {new Date(budget.issued_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold uppercase">{budget.status}</span>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</h4>
                        <p className="text-lg font-semibold text-gray-800">{budget.client_name}</p>
                        {budget.client_phone && <p className="text-sm text-gray-600">Tel: {budget.client_phone}</p>}
                        {budget.client_address && <p className="text-sm text-gray-600">Obra: {budget.client_address}</p>}
                    </div>

                    {/* Ítems */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Descripción / Item</th>
                                <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Cant.</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">P. Unitario</th>
                                <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {budget.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.work_name_snapshot}</td>
                                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right font-mono">${item.unit_price}</td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold">${item.subtotal_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totales consolidado */}
                    <div className="border-t pt-4 flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Costo Base:</span>
                                <span className="font-mono">${budget.subtotal_cost}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Imprevistos:</span>
                                <span className="font-mono">${budget.contingency_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Margen Ganancia:</span>
                                <span className="font-mono">${budget.profit_amount}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                                <span>TOTAL:</span>
                                <span className="font-mono">${budget.total_price} {budget.currency}</span>
                            </div>
                        </div>
                    </div>

                    {budget.execution_conditions && (
                        <div className="border-t pt-4 text-xs text-gray-500">
                            <p className="font-bold text-gray-700 mb-1">Condiciones de Ejecución:</p>
                            <p>{budget.execution_conditions}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}