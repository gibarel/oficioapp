import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function Edit({ auth, profile }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        business_name: profile?.business_name || '',
        trade_category: profile?.trade_category || '',
        hourly_rate_reference: profile?.hourly_rate_reference || '',
        currency: profile?.currency || 'ARS',
        phone: auth.user.phone || '',
        logo: null,
    });

    const [logoPreview, setLogoPreview] = useState(
        profile?.logo_path ? `/storage/${profile.logo_path}` : null
    );

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Usamos POST para permitir el envío multipart/form-data con archivos
        post(route('profile.business.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Perfil del Profesional</h2>}
        >
            <Head title="Perfil Profesional" />

            <div className="py-8 max-w-2xl mx-auto px-4 sm:px-6">
                <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    
                    {/* Sección Logo */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Logo Comercial / Identidad
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-slate-400">Sin logo</span>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Formato JPG, PNG o WEBP. Máximo 2MB.</p>
                            </div>
                        </div>
                        <InputError message={errors.logo} />
                    </div>

                    {/* Datos del Negocio */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Comercial / Nombre de Fantasía</label>
                            <input
                                type="text"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                placeholder="Ej: Electricidad integral & Soluciones"
                                className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900"
                            />
                            <InputError message={errors.business_name} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Rubro / Oficio</label>
                                <input
                                    type="text"
                                    value={data.trade_category}
                                    onChange={(e) => setData('trade_category', e.target.value)}
                                    placeholder="Ej: Electricista, Jardines, Albañilería"
                                    className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900"
                                />
                                <InputError message={errors.trade_category} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono WhatsApp de Contacto</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Ej: +5491112345678"
                                    className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900"
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda por Defecto</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900"
                                >
                                    <option value="ARS">ARS ($) - Peso Argentino</option>
                                    <option value="BRL">BRL (R$) - Real Brasileño</option>
                                    <option value="USD">USD ($) - Dólar Estadounidense</option>
                                </select>
                                <InputError message={errors.currency} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tarifa Horaria Referencia ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.hourly_rate_reference}
                                    onChange={(e) => setData('hourly_rate_reference', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-slate-900 focus:border-slate-900 font-mono"
                                />
                                <InputError message={errors.hourly_rate_reference} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        {recentlySuccessful && (
                            <span className="text-xs text-emerald-600 font-medium">✓ Cambios guardados</span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="ml-auto px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                        >
                            Guardar Perfil
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}