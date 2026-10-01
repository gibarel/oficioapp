import React from 'react';

export default function StatCard({ title, value, description, icon: Icon, trend, variant = 'default' }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 truncate">{title}</span>
                {Icon && (
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-gray-900 font-mono">{value}</div>
                {trend && (
                    <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
            {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
        </div>
    );
}