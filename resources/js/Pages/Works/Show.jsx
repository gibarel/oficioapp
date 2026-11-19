import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Show({ auth, work, calculation }) {
    const { t, locale } = useTranslation();
    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    // Función auxiliar para formatear números de forma limpia (hasta 3 decimales solo si es necesario, evitando ceros sobrantes)
    const formatQty = (value) => {
        return Number(value || 0).toLocaleString(currentDateLocale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    };

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

    // Traducción amigable del método de cálculo
    const methodNames = {
        simple: 'Precio Directo (Simple)',
        intermediate: 'Desglose de Materiales y Mano de Obra',
        advanced: 'Avanzado (Con Costos Indirectos)'
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full">
                            {methodNames[work.calculation_method] || work.calculation_method}
                        </span>
                        <h2 className="font-bold text-2xl text-slate-800 leading-tight mt-1">{work.name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('works.edit', work.id)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition shadow-sm"
                        >
                            ✏️ Editar Trabajo
                        </Link>
                        <Link
                            href={route('works.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                        >
                            ← Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Trabajo - ${work.name}`} />

            <div className="py-8 max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* 🌟 Tarjeta Estrella: Precio Sugerido Final */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Precio Sugerido de Venta</span>
                        <p className="text-3xl sm:text-4xl font-black font-mono mt-1">
                            ${Number(calc.unit_price || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            <span className="text-sm font-normal text-indigo-200 ml-2">por {work.reference_unit || 'unidad'}</span>
                        </p>
                        <p className="text-xs text-slate-300 mt-2">
                            Este es el valor ideal para presupuestar este trabajo, incluyendo tus costos, imprevistos y ganancia.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10 text-right w-full sm:w-auto">
                        <span className="text-xs text-indigo-200 block">Costo Neto Total</span>
                        <span className="text-xl font-bold font-mono text-white">
                            ${Number(calc.subtotal_cost || (laborSubtotal + materialSubtotal)).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Desglose de Costos Básicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                            👷
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mano de Obra / Esfuerzo</span>
                            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">
                                ${Number(laborSubtotal).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                            📦
                        </div>
                        <div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Materiales e Insumos</span>
                            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">
                                ${Number(materialSubtotal).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen de Incrementos (Imprevistos y Ganancia) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Cómo se compone tu precio?</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 block font-medium">Costo Base Acumulado</span>
                            <p className="text-lg font-bold text-slate-800 font-mono mt-1">
                                ${Number(calc.subtotal_cost || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 block font-medium">Colchón de Imprevistos ({work.contingency_percentage}%)</span>
                            <p className="text-lg font-bold text-amber-600 font-mono mt-1">
                                + ${Number(calc.contingency_amount || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl">
                            <span className="text-xs text-slate-500 block font-medium">Tu Margen de Ganancia ({work.profit_margin_percentage}%)</span>
                            <p className="text-lg font-bold text-emerald-600 font-mono mt-1">
                                + ${Number(calc.profit_amount || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Listado de Recursos Asociados */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Insumos y Mano de Obra Detallados</h3>
                    {work.resources && work.resources.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {work.resources.map((res) => {
                                const qty = res.pivot.quantity;
                                const unit = res.pivot.unit || 'u';
                                const unitVal = res.pivot.custom_unit_value || res.unit_value;
                                const subtotal = qty * unitVal;
                                const isLabor = res.type === 'labor';

                                return (
                                    <div key={res.id} className="py-3.5 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${isLabor ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {isLabor ? '👷 Mano de Obra' : '📦 Material'}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800">{res.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Cantidad: {formatQty(qty)} {unit} × ${Number(unitVal).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 font-mono">
                                                ${Number(subtotal).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">Este trabajo utiliza el Método Simple (precio directo sin desglose de materiales).</p>
                            <p className="text-xs text-slate-400 mt-1">Puedes editarlo en cualquier momento si deseas agregarle insumos o mano de obra.</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}