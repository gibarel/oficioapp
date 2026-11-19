import React, { useState } from 'react';
import axios from 'axios';

export default function GeminiAssistantChat() {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: '¡Hola! Soy tu asistente de OficioApp. Pregúntame sobre tus trabajos pendientes o estadísticas de la cuenta.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(route('ai.chat'), { query: userMessage });
            if (response.data.success) {
                setMessages((prev) => [...prev, { sender: 'ai', text: response.data.answer }]);
            } else {
                setMessages((prev) => [...prev, { sender: 'ai', text: 'Ocurrió un error al procesar tu consulta.' }]);
            }
        } catch (error) {
            console.error('Error en el chat de IA:', error);
            setMessages((prev) => [...prev, { sender: 'ai', text: 'Error de conexión con el servidor.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm">💬 Asistente Inteligente OficioApp</h4>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    Gemini DB Context
                </span>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl text-xs animate-pulse">
                            Analizando datos...
                        </div>
                    </div>
                )}
            </div>

            {/* Formulario de Entrada */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ej: ¿Cuántos trabajos pendientes tengo?"
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}