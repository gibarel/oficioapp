import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, work, calculation }) {
    const calc = calculation || {
        subtotal_cost: work.base_price || 0,
        contingency_amount: 0,
        profit_amount: 0,
        unit_price: work.base_price || 0,
        breakdown: []
    };

    // Calcular desglose entre Mano de Obra y Materiales
    let laborSubtotal = 0;
    let materialSubtotal = 0;

    if (work.resources && work.resources.length > 0) {
        work.resources.forEach((res) => {
            const cost = (res.pivot.quantity || 0) * (res.pivot.custom_unit_value || res.unit_value || 0);
            if (res.type === 'labor') {
                laborSubtotal += cost;
            } else {
                materialSubtotal += cost;
            }
        });
    } else {
        laborSubtotal = Number(work.base_price || 0);
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Detalle del Trabajo: {work.name}</h2>}
        >
            <Head title={`Trabajo - ${work.name}`} />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Encabezado */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Método y Unidad de Medida</span>
                        <p className="text-lg font-bold text-slate-800">
                            {work.reference_unit || 'u.'} — <span className="text-indigo-600 uppercase text-sm font-semibold">{work.calculation_method}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('works.edit', work.id)}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                        >
                            Editar Trabajo
                        </Link>
                        <Link
                            href={route('works.index')}
                            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition"
                        >
                            Volver
                        </Link>
                    </div>
                </div>

                {/* Resumen Económico */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Desglose de Costos y Precio Final</h3>
                    
                    {/* Fila de origen del costo base */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                        <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
                            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">👷 Mano de Obra (Esfuerzo Humano)</span>
                            <p className="text-xl font-bold text-slate-800 font-mono mt-1">${Number(laborSubtotal).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
                            <span className="text-xs text-blue-800 font-bold uppercase tracking-wider">📦 Materiales e Insumos</span>
                            <p className="text-xl font-bold text-slate-800 font-mono mt-1">${Number(materialSubtotal).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Fila de Totales e Incrementos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 font-medium">Costo Base Total</span>
                            <p className="text-lg font-bold text-slate-800 font-mono">${Number(calc.subtotal_cost || (laborSubtotal + materialSubtotal)).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 font-medium">Imprevistos ({work.contingency_percentage}%)</span>
                            <p className="text-lg font-bold text-slate-800 font-mono">${Number(calc.contingency_amount || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 font-medium">Margen ({work.profit_margin_percentage}%)</span>
                            <p className="text-lg font-bold text-slate-800 font-mono">${Number(calc.profit_amount || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm">
                            <span className="text-xs opacity-80 font-medium">Precio Sugerido / U</span>
                            <p className="text-xl font-bold font-mono">${Number(calc.unit_price || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Listado de Insumos / Mano de Obra */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detalle de Mano de Obra y Materiales Incluidos</h3>
                    {work.resources && work.resources.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {work.resources.map((res) => {
                                const qty = res.pivot.quantity;
                                const unitVal = res.pivot.custom_unit_value || res.unit_value;
                                const subtotal = qty * unitVal;
                                const isLabor = res.type === 'labor';

                                return (
                                    <div key={res.id} className="py-3 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isLabor ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {isLabor ? '👷 Mano de Obra' : '📦 Material'}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800">{res.name}</p>
                                                <p className="text-xs text-slate-500">Cantidad: {qty} × ${Number(unitVal).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 font-mono">${Number(subtotal).toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No hay insumos ni mano de obra desglosada vinculada (Método Simple).</p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}