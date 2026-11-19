import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

const emptyForm = {
    name: '',
    phone: '',
    business_name: '',
    email: '',
    tax_id: '',
    address: '',
    notes: '',
};

export default function Index({ auth, clients = [], filters = {} }) {
    const user = auth?.user;
    const { flash } = usePage().props;
    const { locale } = useTranslation();

    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    const [search, setSearch] = useState(filters?.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [showExtraFields, setShowExtraFields] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(emptyForm);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('clients.index'),
                search.trim() ? { search: search.trim() } : {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 250);

        return () => clearTimeout(timeout);
    }, [search]);

    const openCreateModal = () => {
        setEditingClient(null);
        reset();
        clearErrors();
        setShowExtraFields(false);
        setIsFormOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        clearErrors();
        setData({
            name: client.name || '',
            phone: client.phone || '',
            business_name: client.business_name || '',
            email: client.email || '',
            tax_id: client.tax_id || '',
            address: client.address || '',
            notes: client.notes || '',
        });
        setShowExtraFields(
            Boolean(client.business_name || client.email || client.tax_id || client.address || client.notes)
        );
        setIsFormOpen(true);
    };

    const closeModal = () => {
        setIsFormOpen(false);
        setEditingClient(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingClient) {
            put(route('clients.update', editingClient.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('clients.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDeactivate = (client) => {
        if (!window.confirm(`¿Dar de baja a ${client.name}? Sus presupuestos anteriores se conservarán.`)) {
            return;
        }

        router.delete(route('clients.destroy', client.id), {
            preserveScroll: true,
        });
    };

    const sanitizePhone = (phone = '') => phone.replace(/\D/g, '');

    const totalAccumulated = clients.reduce(
        (sum, c) => sum + Number(c.budgets_sum_total_price || 0),
        0
    );

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">
                            Clientes
                        </h2>
                        <p className="text-xs text-slate-500">
                            Agenda rápida de clientes, contactos y presupuestos asociados
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                    >
                        + Nuevo cliente
                    </button>
                </div>
            }
        >
            <Head title="Clientes - OficioApp" />

            <div className="py-6 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5">
                {flash?.success && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Resumen compacto en 2 columnas */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Clientes activos
                        </span>
                        <p className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                            {clients.length}
                        </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Monto presupuestado
                        </span>
                        <p className="text-lg sm:text-2xl font-black font-mono text-indigo-600 truncate">
                            ${totalAccumulated.toLocaleString(currentDateLocale, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </p>
                    </div>
                </div>

                {/* Buscador */}
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, negocio o teléfono..."
                        aria-label="Buscar clientes"
                        className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 shrink-0"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Listado de clientes en tarjetas */}
                <div className="space-y-3">
                    {clients.map((client) => {
                        const cleanPhone = sanitizePhone(client.phone);
                        const budgetsCount = Number(client.budgets_count || 0);
                        const budgetsSum = Number(client.budgets_sum_total_price || 0);

                        return (
                            <div
                                key={client.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-slate-900 text-base truncate">
                                                {client.name}
                                            </h3>
                                            {client.business_name && (
                                                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {client.business_name}
                                                </span>
                                            )}
                                        </div>

                                        {client.phone && (
                                            <p className="text-xs sm:text-sm text-slate-600 font-mono">
                                                {client.phone}
                                            </p>
                                        )}

                                        {client.address && (
                                            <p className="text-xs text-slate-400">
                                                {client.address}
                                            </p>
                                        )}

                                        {client.notes && (
                                            <p className="text-xs text-slate-500 pt-0.5">
                                                {client.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0 space-y-1">
                                        <p className="font-mono font-extrabold text-slate-900 text-sm sm:text-base">
                                            ${budgetsSum.toLocaleString(currentDateLocale, {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}
                                        </p>
                                        <p className="text-[11px] font-semibold text-slate-400">
                                            {budgetsCount} {budgetsCount === 1 ? 'presupuesto' : 'presupuestos'}
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones táctiles */}
                                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {cleanPhone && (
                                            <>
                                                <a
                                                    href={`tel:${cleanPhone}`}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                                >
                                                    Llamar
                                                </a>
                                                <a
                                                    href={`https://wa.me/${cleanPhone}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                                >
                                                    WhatsApp
                                                </a>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(client)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeactivate(client)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            Dar de baja
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {clients.length === 0 && (
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                                {search ? 'No se encontraron clientes con ese filtro.' : 'Todavía no cargaste clientes.'}
                            </p>
                            <p className="text-xs text-slate-400">
                                Guardá tus clientes habituales para reutilizar sus datos al armar presupuestos.
                            </p>
                            {!search && (
                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
                                >
                                    + Agregar primer cliente
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal / Sheet de alta y edición */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-slate-900 text-base">
                                {editingClient ? 'Editar cliente' : 'Nuevo cliente'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Nombre o contacto *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ej: Valeria Gómez"
                                    required
                                    className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.name && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                    Teléfono / WhatsApp
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Ej: 1155667788"
                                    className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {errors.phone && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowExtraFields((prev) => !prev)}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                                {showExtraFields ? '− Ocultar datos adicionales' : '+ Agregar negocio, dirección, email o notas'}
                            </button>

                            {showExtraFields && (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Negocio o emprendimiento
                                        </label>
                                        <input
                                            type="text"
                                            value={data.business_name}
                                            onChange={(e) => setData('business_name', e.target.value)}
                                            placeholder="Ej: Librería El Sol"
                                            className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="cliente@correo.com"
                                                className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                DNI / CUIT
                                            </label>
                                            <input
                                                type="text"
                                                value={data.tax_id}
                                                onChange={(e) => setData('tax_id', e.target.value)}
                                                placeholder="20-12345678-9"
                                                className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Calle y altura / localidad"
                                            className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Notas
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Preferencias de entrega, horario, etc."
                                            className="w-full text-sm border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {processing ? 'Guardando...' : editingClient ? 'Guardar cambios' : 'Crear cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}