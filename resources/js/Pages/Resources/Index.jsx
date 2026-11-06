import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';

export default function Index({ auth, resources, flash }) {
    // Formulario para creación
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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Insumos y Recursos
                </h2>
            }
        >
            <Head title="Insumos y Recursos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    {/* Formulario Dinámico (Crear / Editar) */}
                    <div className={`p-6 shadow-sm sm:rounded-lg transition-colors ${isEditing ? 'bg-amber-50 border border-amber-300' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-medium ${isEditing ? 'text-amber-900' : 'text-gray-900'}`}>
                                {isEditing ? '✏️ EDITAR RECURSO (Se guardará como copia personal)' : '+ CARGAR NUEVO RECURSO'}
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
                                >
                                    Cancelar Edición
                                </button>
                            )}
                        </div>

                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="material">Material</option>
                                    <option value="labor">Mano de Obra</option>
                                    <option value="asset">Herramienta / Equipo</option>
                                    <option value="service">Servicio</option>
                                    <option value="extra">Extra</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="ej: Bolsa de Cemento 50kg"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.unit_value}
                                    onChange={(e) => setData('unit_value', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.unit_value && <span className="text-red-500 text-xs">{errors.unit_value}</span>}
                            </div>

                            <div className="sm:col-span-4 flex justify-end space-x-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white transition ${
                                        isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-gray-800'
                                    }`}
                                >
                                    {isEditing ? 'Actualizar Recurso' : 'Guardar Insumo'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Buscador y Filtros */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="w-full sm:w-1/2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre de insumo, herramienta o labor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="w-full sm:w-auto flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setSelectedCategory('material')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCategory === 'material' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Materiales
                            </button>
                            <button
                                onClick={() => setSelectedCategory('asset')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCategory === 'asset' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Herramientas
                            </button>
                            <button
                                onClick={() => setSelectedCategory('labor')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${selectedCategory === 'labor' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Mano de Obra
                            </button>
                        </div>
                    </div>

                    {/* Listado en Tabla */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredResources.length > 0 ? (
                                    filteredResources.map((resource) => (
                                        <tr key={resource.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {resource.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    resource.type === 'material' ? 'bg-blue-100 text-blue-800' :
                                                    resource.type === 'asset' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {getTypeLabel(resource.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {resource.use_unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                                ${Number(resource.unit_value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                                                {resource.user_id === null ? (
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Global</span>
                                                ) : (
                                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Personal</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => startEditing(resource)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-semibold transition"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                                            No se encontraron insumos que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}