import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, availableWorks }) {
    const { data, setData, post, processing } = useForm({
        client_name: '',
        client_phone: '',
        client_address: '',
        currency: 'ARS',
        execution_conditions: 'Presupuesto válido por 15 días. Pago 50% anticipo y 50% contra entrega.',
        items: [],
    });

    const addWorkItem = (workId) => {
        if (!workId) return;
        const work = availableWorks.find((w) => w.id === parseInt(workId));
        if (!work) return;

        setData('items', [
            ...data.items,
            {
                work_id: work.id,
                name: work.name,
                quantity: 1,
            },
        ]);
    };

    const updateItemQuantity = (index, qty) => {
        const updated = [...data.items];
        updated[index].quantity = qty;
        setData('items', updated);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('budgets.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Generar Nuevo Presupuesto</h2>}>
            <Head title="Nuevo Presupuesto" />

            <form onSubmit={submit} className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="bg-white p-6 shadow rounded-lg space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Datos del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Cliente / Firma</label>
                            <input
                                type="text"
                                value={data.client_name}
                                onChange={(e) => setData('client_name', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                            <input
                                type="text"
                                value={data.client_phone}
                                onChange={(e) => setData('client_phone', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección de la Obra/Trabajo</label>
                            <input
                                type="text"
                                value={data.client_address}
                                onChange={(e) => setData('client_address', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 shadow rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Ítems a Presupuestar</h3>
                        <select
                            onChange={(e) => {
                                addWorkItem(e.target.value);
                                e.target.value = '';
                            }}
                            className="border-gray-300 rounded-md text-sm"
                        >
                            <option value="">+ Seleccionar Trabajo del Catálogo</option>
                            {availableWorks.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {data.items.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">Agrega al menos un trabajo del catálogo para calcular el presupuesto.</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Trabajo</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2 font-medium text-sm">{item.name}</td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={item.quantity}
                                                onChange={(e) => updateItemQuantity(index, e.target.value)}
                                                className="w-24 border-gray-300 rounded text-sm"
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-600 text-xs">
                                                Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={processing || data.items.length === 0} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Generar y Emitir Presupuesto
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}