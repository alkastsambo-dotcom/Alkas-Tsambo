import React, { useState } from 'react';
import { Property, PropertyType, PropertyStatus, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Building,
  Home,
  Store,
  Warehouse,
  Briefcase,
  Sparkles,
  Info,
  Car,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

interface InteractiveMapProps {
  properties: Property[];
  onSelectProperty?: (prop: Property) => void;
  onOpenComments?: (prop: Property) => void;
  language: Language;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  onSelectProperty,
  onOpenComments,
  language,
}) => {
  const t = translations[language];
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    properties[0] || null
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeRouteSimulation, setActiveRouteSimulation] = useState<string | null>(null);

  const filteredProperties = properties.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: PropertyStatus) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-emerald-500',
          border: 'border-emerald-600',
          text: 'text-emerald-700 dark:text-emerald-400',
          label: 'Disponible',
          pinClass: 'bg-emerald-600 text-white',
        };
      case 'occupied':
        return {
          bg: 'bg-red-600',
          border: 'border-red-700',
          text: 'text-red-700 dark:text-red-400',
          label: 'Occupé',
          pinClass: 'bg-red-600 text-white',
        };
      case 'notice':
        return {
          bg: 'bg-orange-500',
          border: 'border-orange-600',
          text: 'text-orange-700 dark:text-orange-400',
          label: 'Préavis / Fin proche',
          pinClass: 'bg-orange-600 text-white',
        };
      case 'maintenance':
      default:
        return {
          bg: 'bg-slate-500',
          border: 'border-slate-600',
          text: 'text-slate-700 dark:text-slate-400',
          label: 'En Travaux',
          pinClass: 'bg-slate-600 text-white',
        };
    }
  };

  const getPropertyIcon = (type: PropertyType) => {
    switch (type) {
      case 'apartment':
        return <Building className="w-3.5 h-3.5" />;
      case 'house':
        return <Home className="w-3.5 h-3.5" />;
      case 'shop':
        return <Store className="w-3.5 h-3.5" />;
      case 'warehouse':
        return <Warehouse className="w-3.5 h-3.5" />;
      case 'office':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'event_hall':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  // Convert GPS coordinates into relative SVG canvas coordinates for Goma map bounds
  // Goma bounding box roughly: lat: -1.63 to -1.70, lng: 29.21 to 29.25
  const getMapPosition = (lat: number, lng: number) => {
    const minLat = -1.7;
    const maxLat = -1.635;
    const minLng = 29.21;
    const maxLng = 29.25;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return {
      left: `${Math.min(Math.max(x, 8), 92)}%`,
      top: `${Math.min(Math.max(y, 10), 90)}%`,
    };
  };

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {/* Top Filter Controls on single scrollable row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setFilterType('all')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tous ({properties.length})
        </button>
        <button
          onClick={() => setFilterType('apartment')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
            filterType === 'apartment' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Appartements
        </button>
        <button
          onClick={() => setFilterType('house')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
            filterType === 'house' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Maisons
        </button>
        <button
          onClick={() => setFilterType('shop')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
            filterType === 'shop' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Boutiques
        </button>
        <button
          onClick={() => setFilterType('warehouse')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
            filterType === 'warehouse' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          Dépôts
        </button>
      </div>

      {/* Main Map Viewport & Detail Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Visual Map Surface */}
        <div className="lg:col-span-2 relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner">
          {/* Stylized SVG Map Topography & Lake Kivu Shoreline */}
          <svg className="w-full h-full object-cover" viewBox="0 0 800 500" preserveAspectRatio="none">
            {/* Dark Map Canvas */}
            <rect width="800" height="500" fill="#0f172a" />
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* Lake Kivu Water Body Area (Bottom-left curved shore) */}
            <path
              d="M 0,340 C 180,360 260,390 340,430 C 400,460 480,480 600,500 L 0,500 Z"
              fill="#0369a1"
              opacity="0.35"
            />
            <text x="70" y="440" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="1">
              LAC KIVU (PORT & PLAGE HIMBI)
            </text>

            {/* Major Arteries / Boulevards (Boulevard Kanyamuhanga, Av. du Tourisme) */}
            <path
              d="M 120,480 C 180,380 290,290 400,240 C 520,180 620,120 750,40"
              stroke="#334155"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 120,480 C 180,380 290,290 400,240 C 520,180 620,120 750,40"
              stroke="#64748b"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 4"
            />
            <text x="320" y="270" fill="#94a3b8" fontSize="10" transform="rotate(-30 320,270)">
              BD KANYAMUHANGA / RN2
            </text>

            <path
              d="M 400,240 L 720,380"
              stroke="#334155"
              strokeWidth="4"
              fill="none"
            />
            <text x="500" y="325" fill="#94a3b8" fontSize="9" transform="rotate(22 500,325)">
              AVENUE DES ÉCOLES
            </text>

            {/* Mont Goma Landmark Topography */}
            <circle cx="580" cy="180" r="45" fill="#1e293b" opacity="0.6" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
            <text x="545" y="185" fill="#cbd5e1" fontSize="10" fontWeight="600">
              ▲ MONT GOMA
            </text>

            {/* Rond-Point BDGL Landmark */}
            <circle cx="400" cy="240" r="10" fill="#6366f1" opacity="0.4" />
            <circle cx="400" cy="240" r="4" fill="#a5b4fc" />
            <text x="415" y="244" fill="#a5b4fc" fontSize="9" fontWeight="bold">
              Rond-Point BDGL
            </text>
          </svg>

          {/* Interactive Property Markers */}
          {filteredProperties.map((prop) => {
            const pos = getMapPosition(prop.gps.lat, prop.gps.lng);
            const statusInfo = getStatusColor(prop.status);
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <div
                key={prop.id}
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                onClick={() => {
                  setSelectedProperty(prop);
                  onSelectProperty?.(prop);
                }}
              >
                {/* Marker Pin */}
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-transform ${
                    statusInfo.pinClass
                  } ${isSelected ? 'scale-125 ring-4 ring-white shadow-xl' : 'hover:scale-110'}`}
                >
                  {getPropertyIcon(prop.type)}

                  {/* Selected highlight ring */}
                  {isSelected && (
                    <span className="absolute -inset-1 rounded-full border-2 border-blue-400 opacity-90" />
                  )}
                </div>

                {/* Floating Micro Tag on Hover */}
                <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none">
                  {prop.name.split('-')[0]} · ${prop.rentUSD}/m
                </div>
              </div>
            );
          })}

          {/* Map Compass & Coordinates Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-[10px] border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-[11px]">Goma / Nord-Kivu · GPS WGS84</span>
          </div>

          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-400">
            {filteredProperties.length} biens affichés sur la carte
          </div>
        </div>

        {/* Selected Property Spotlight & GPS Itinerary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-sm">
          {selectedProperty ? (
            <div className="space-y-4">
              {/* Photo & Quick Badges */}
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <img
                  src={selectedProperty.photos[0]}
                  alt={selectedProperty.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  ${selectedProperty.rentUSD} / mois
                </div>
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 shadow-sm ${
                      getStatusColor(selectedProperty.status).text
                    }`}
                  >
                    ● {getStatusColor(selectedProperty.status).label}
                  </span>
                </div>
              </div>

              {/* Title & Type */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedProperty.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedProperty.address.commune}, Quartier {selectedProperty.address.neighborhood}
                </p>
              </div>

              {/* Mandatory Visual Landmark (Pilier 6) */}
              <div className="p-3 rounded-[10px] bg-orange-500/10 border border-orange-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Point de Repère Visuel Obligatoire</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  « {selectedProperty.landmark} »
                </p>
                <div className="text-[10px] text-slate-500 font-mono pt-1 tabular-nums">
                  GPS : {selectedProperty.gps.lat.toFixed(4)}, {selectedProperty.gps.lng.toFixed(4)}
                </div>
              </div>

              {/* Occupancy or Tenant Details */}
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Occupant :</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedProperty.tenantName || 'Aucun (Logement libre)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Caution en séquestre :</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    ${selectedProperty.depositUSD} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Compteur Électricité :</span>
                  <span className="font-mono text-slate-900 dark:text-white tabular-nums">
                    {selectedProperty.meters.electricity} kWh
                  </span>
                </div>
              </div>

              {/* GPS Itinerary Trigger & Universal Comments */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveRouteSimulation(selectedProperty.id);
                    setTimeout(() => setActiveRouteSimulation(null), 4000);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shadow-xs"
                >
                  <Navigation className="w-4 h-4" />
                  <span>
                    {activeRouteSimulation === selectedProperty.id
                      ? 'Itinéraire en cours de guidage (GPS Live)...'
                      : 'Lancer l’Itinéraire GPS'}
                  </span>
                </button>

                <button
                  onClick={() => onOpenComments?.(selectedProperty)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  <span>Voir Remarques & Photos ({selectedProperty.commentsCount})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Cliquez sur un marqueur de la carte pour inspecter le bien.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
