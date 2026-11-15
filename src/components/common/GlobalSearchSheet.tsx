import React, { useState, useMemo } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { Property, Lease, Payment, MaintenanceTicket, Vendor } from '../../types';
import { Search, Building2, Users, Receipt, Wrench, Briefcase, ArrowRight } from 'lucide-react';

interface GlobalSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  leases: Lease[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  vendors: Vendor[];
  onNavigate: (tabId: string, subTabId?: string) => void;
}

export const GlobalSearchSheet: React.FC<GlobalSearchSheetProps> = ({
  isOpen,
  onClose,
  properties,
  leases,
  payments,
  tickets,
  vendors,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) {
      return {
        properties: properties.slice(0, 3),
        leases: leases.slice(0, 3),
        payments: payments.slice(0, 2),
        tickets: tickets.slice(0, 2),
        vendors: vendors.slice(0, 2),
      };
    }
    return {
      properties: properties.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.landmark.toLowerCase().includes(q) ||
          p.address.neighborhood.toLowerCase().includes(q)
      ),
      leases: leases.filter(
        (l) =>
          l.tenantName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.propertyName.toLowerCase().includes(q)
      ),
      payments: payments.filter(
        (p) =>
          p.tenantName.toLowerCase().includes(q) ||
          p.transactionRef.toLowerCase().includes(q) ||
          p.receiptCode.toLowerCase().includes(q)
      ),
      tickets: tickets.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.propertyName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      ),
      vendors: vendors.filter(
        (v) => v.name.toLowerCase().includes(q) || v.specialty.toLowerCase().includes(q)
      ),
    };
  }, [q, properties, leases, payments, tickets, vendors]);

  const totalMatches =
    results.properties.length +
    results.leases.length +
    results.payments.length +
    results.tickets.length +
    results.vendors.length;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Recherche globale"
      subtitle="Biens, locataires, codes BIND, reçus, incidents et prestataires"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un nom, code BIND, référence M-Pesa..."
            className="w-full min-h-[48px] pl-10 pr-4 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {totalMatches === 0 ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            title="Aucun résultat trouvé"
            description={`Aucune fiche ne correspond à « ${query} ». Essayez un nom, un quartier ou un code de bail.`}
            actionLabel="Effacer la recherche"
            onAction={() => setQuery('')}
          />
        ) : (
          <div className="space-y-4">
            {results.properties.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Biens ({results.properties.length})
                </span>
                {results.properties.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onNavigate('properties', 'list');
                      onClose();
                    }}
                    className="w-full min-h-[48px] p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-blue-500"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] text-slate-900 dark:text-white block truncate">
                        {p.name}
                      </strong>
                      <span className="text-[12px] text-slate-500 truncate block">
                        ${p.rentUSD}/mois · {p.address.neighborhood}
                      </span>
                    </div>
                    <StatusBadge
                      status={
                        p.status === 'available'
                          ? 'vacant'
                          : p.status === 'maintenance'
                          ? 'maintenance'
                          : p.status === 'notice'
                          ? 'notice'
                          : 'occupied'
                      }
                    />
                  </button>
                ))}
              </div>
            )}

            {results.leases.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" /> Locataires & Baux ({results.leases.length})
                </span>
                {results.leases.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onNavigate('tenants', 'active');
                      onClose();
                    }}
                    className="w-full min-h-[48px] p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-blue-500"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] text-slate-900 dark:text-white block truncate">
                        {l.tenantName}
                      </strong>
                      <span className="text-[12px] text-slate-500 truncate block">
                        {l.code} · {l.propertyName}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {results.payments.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Paiements ({results.payments.length})
                </span>
                {results.payments.map((pay) => (
                  <button
                    key={pay.id}
                    type="button"
                    onClick={() => {
                      onNavigate('finances', pay.status === 'pending' ? 'payments' : 'rents');
                      onClose();
                    }}
                    className="w-full min-h-[48px] p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-blue-500"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] text-slate-900 dark:text-white tabular-nums block truncate">
                        ${pay.amountUSD} USD · {pay.tenantName}
                      </strong>
                      <span className="text-[12px] text-slate-500 truncate block">
                        {pay.receiptCode} · {pay.transactionRef}
                      </span>
                    </div>
                    <StatusBadge
                      status={
                        pay.status === 'verified' ? 'paid' : pay.status === 'rejected' ? 'rejected' : 'pending'
                      }
                    />
                  </button>
                ))}
              </div>
            )}

            {results.tickets.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-600" /> Maintenance ({results.tickets.length})
                </span>
                {results.tickets.map((tk) => (
                  <button
                    key={tk.id}
                    type="button"
                    onClick={() => {
                      onNavigate('properties', 'maintenance');
                      onClose();
                    }}
                    className="w-full min-h-[48px] p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-blue-500"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] text-slate-900 dark:text-white block truncate">
                        {tk.propertyName}
                      </strong>
                      <span className="text-[12px] text-slate-500 truncate block">{tk.description}</span>
                    </div>
                    <StatusBadge status={tk.status === 'completed' ? 'paid' : 'maintenance'} />
                  </button>
                ))}
              </div>
            )}

            {results.vendors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Prestataires ({results.vendors.length})
                </span>
                {results.vendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      onNavigate('more', 'team');
                      onClose();
                    }}
                    className="w-full min-h-[48px] p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-blue-500"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] text-slate-900 dark:text-white block truncate">
                        {v.name}
                      </strong>
                      <span className="text-[12px] text-slate-500 truncate block">
                        {v.city} · ${v.hourlyRateUSD}/h
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
