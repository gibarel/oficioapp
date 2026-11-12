import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, resources, flash }) {
    const { t, locale } = useTranslation();
    const dateLocaleMap = { es: 'es-AR', pt: 'pt-BR', en: 'en-US' };
    const currentDateLocale = dateLocaleMap[locale] || 'es-AR';

    // Formulario para creación y edición
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: null,
        type: 'material',
        name: '',
        use_unit: 'unidad',
        unit_value: '',
        purchase_unit: '',
        conversion_factor: 1,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('resources.update', data.id), {
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                    clearErrors();
                },
            });
        } else {
            post(route('resources.store'), {
                onSuccess: () => {
                    reset('name', 'unit_value', 'purchase_unit');
                    clearErrors();
                },
            });
        }
    };

    const startEditing = (resource) => {
        setIsEditing(true);
        setData({
            id: resource.id,
            type: resource.type,
            name: resource.name,
            use_unit: resource.use_unit || 'unidad',
            unit_value: resource.unit_value,
            purchase_unit: resource.purchase_unit || '',
            conversion_factor: resource.conversion_factor || 1,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        reset();
        clearErrors();
    };

    const filteredResources = useMemo(() => {
        return resources.filter((resource) => {
            const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [resources, searchTerm, selectedCategory]);

    const getTypeLabel = (type) => {
        const labels = {
            material: 'Material',
            labor: 'Mano de Obra',
            asset: 'Herramienta / Equipo',
            service: 'Servicio',
            extra: 'Extra',
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 tracking-tight">
                    {t('dashboard.resourcesTitle', { defaultValue: 'Insumos y Recursos' })}
                </h2>
            }
        >
            <Head title={t('dashboard.resourcesTitle', { defaultValue: 'Insumos y Recursos' })} />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8 px-4 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl relative text-sm font-medium shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    {/* Formulario Dinámico (Crear / Editar) */}
                    <div className={`p-6 shadow-sm rounded-3xl transition-colors border ${isEditing ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isEditing ? 'text-amber-900' : 'text-slate-800'}`}>
                                {isEditing ? '✏️ Editar Recurso (Copia Personal)' : '+ Cargar Nuevo Insumo'}
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl font-semibold transition"
                                >
                                    Cancelar Edición
                                </button>
                            )}
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tipo</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2 bg-white font-medium cursor-pointer"
                                >
                                    <option value="material">Material</option>
                                    <option value="labor">Mano de Obra</option>
                                    <option value="asset">Herramienta / Equipo</option>
                                    <option value="service">Servicio</option>
                                    <option value="extra">Extra</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="ej: Bolsa de Cemento 50kg"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2"
                                />
                                {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.unit_value}
                                    onChange={(e) => setData('unit_value', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2 font-mono"
                                />
                                {errors.unit_value && <span className="text-red-500 text-xs mt-1 block">{errors.unit_value}</span>}
                            </div>

                            <div className="sm:col-span-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-sm ${
                                        isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    {isEditing ? 'Actualizar Recurso' : 'Guardar Insumo'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Buscador y Filtros */}
                    <div className="bg-white p-5 shadow-sm rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="w-full sm:w-1/2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre de insumo o herramienta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2"
                            />
                        </div>

                        <div className="w-full sm:w-auto flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setSelectedCategory('material')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === 'material' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Materiales
                            </button>
                            <button
                                onClick={() => setSelectedCategory('asset')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === 'asset' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Herramientas
                            </button>
                            <button
                                onClick={() => setSelectedCategory('labor')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === 'labor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Mano de Obra
                            </button>
                        </div>
                    </div>

                    {/* Listado en Tabla / Tarjetas Mobile-Friendly */}
                    <div className="bg-white shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Unidad</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Precio Unitario</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Origen</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                                    {filteredResources.length > 0 ? (
                                        filteredResources.map((resource) => (
                                            <tr key={resource.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {resource.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-lg ${
                                                        resource.type === 'material' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        resource.type === 'asset' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}>
                                                        {getTypeLabel(resource.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                    {resource.use_unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-extrabold text-slate-900">
                                                    ${Number(resource.unit_value || 0).toLocaleString(currentDateLocale, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                                                    {resource.user_id === null ? (
                                                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-bold">Global</span>
                                                    ) : (
                                                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">Personal</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                    <button
                                                        onClick={() => startEditing(resource)}
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-xs text-slate-400">
                                                No se encontraron insumos que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}