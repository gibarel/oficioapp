import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth = {} }) {
    const user = auth?.user;

    return (
        <>
            <Head title="OficioApp - Presupuestos y Gestión en Campo" />
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6">
                {/* Header / Nav */}
                <header className="flex justify-between items-center max-w-4xl w-full mx-auto py-4">
                    <span className="font-bold text-lg tracking-tight text-slate-900">OficioApp</span>
                    <nav className="flex gap-3">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
                            >
                                ir al Panel →
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-slate-700 text-sm font-medium hover:text-slate-900 transition"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Minimalista */}
                <main className="max-w-xl mx-auto text-center space-y-6 my-auto py-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Presupuestos rápidos para profesionales de oficio.
                    </h1>
                    <p className="text-base text-slate-500 font-normal">
                        Calculá costos de materiales, horas de trabajo e imprevistos en segundos. Compartí directamente por WhatsApp o PDF.
                    </p>
                    <div className="pt-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-base font-semibold hover:bg-slate-800 transition inline-block shadow-sm"
                            >
                                Ir al Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('register')}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-base font-semibold hover:bg-slate-800 transition inline-block shadow-sm"
                            >
                                Probar OficioApp Gratis
                            </Link>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center text-xs text-slate-400 py-4">
                    OficioApp © {new Date().getFullYear()} — Herramientas simples para el trabajo diario.
                </footer>
            </div>
        </>
    );
}