import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

export default function Customers() {
  const { customers } = useData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Fichier Clients</h1>
        </div>
        <p className="text-slate-600 ml-16">{customers.length} client{customers.length > 1 ? 's' : ''} enregistré{customers.length > 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun client enregistré</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                <h3 className="font-black text-lg text-slate-900 mb-3">{customer.name}</h3>
                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.city && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{customer.city}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
