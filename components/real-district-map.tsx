'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePHC } from './phc-context';
import { StatusBadge } from './status-badge';
import {
  Navigation,
  Car,
  Sparkles,
  Layers,
  MapPin,
  Route,
  ArrowRight,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Maximize2,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import Leaflet in browser only
export const RealDistrictMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const dispatchPolylineRef = useRef<any>(null);

  const {
    phcs,
    selectedPHCId,
    setSelectedPHCId,
    isTechnicianOutageSimulated,
    toggleTechnicianOutage,
  } = usePHC();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(selectedPHCId || 'phc-rampur');
  const [activeTileLayer, setActiveTileLayer] = useState<'streets' | 'light' | 'dark'>('streets');
  const [activeRegion, setActiveRegion] = useState<'sitapur' | 'india' | 'south' | 'west'>('sitapur');
  const [selectedRoadInfo, setSelectedRoadInfo] = useState<{
    name: string;
    type: string;
    distance: string;
    estTime: string;
    condition: string;
  } | null>(null);

  const tileLayers = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
  };

  const activePHC = phcs.find((p) => p.id === selectedFacilityId) || phcs[0];

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default Center: Sitapur District, Uttar Pradesh (NH-30 Corridor)
      const map = L.map(mapContainerRef.current, {
        center: [27.5744, 80.6695],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add Base Tile Layer
      const currentTiles = tileLayers[activeTileLayer];
      const tileLayer = L.tileLayer(currentTiles.url, {
        maxZoom: 19,
        attribution: currentTiles.attribution,
      }).addTo(map);

      // Real Road Polylines (NH-30, SH-26, MDR-44)
      const nh30Coordinates: [number, number][] = [
        [27.5300, 80.6200],
        [27.5500, 80.6500],
        [27.5670, 80.6830], // Sitapur Urban CHC
        [27.5744, 80.6695], // PHC Rampur
        [27.6000, 80.7000],
        [27.6300, 80.7300],
      ];

      const sh26Coordinates: [number, number][] = [
        [27.5670, 80.6830], // Sitapur Urban
        [27.5850, 80.7100],
        [27.6120, 80.7450], // PHC Shivapur
      ];

      const mdr44Coordinates: [number, number][] = [
        [27.5744, 80.6695], // PHC Rampur
        [27.7200, 80.7200],
        [27.8500, 80.7500],
        [27.9450, 80.7780], // PHC Lakshmipur
      ];

      // Draw Highway Polylines
      const nh30Line = L.polyline(nh30Coordinates, {
        color: '#2563eb',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
      }).addTo(map);

      nh30Line.on('click', () => {
        setSelectedRoadInfo({
          name: 'National Highway NH-30 (Sitapur–Lucknow Corridor)',
          type: '4-Lane National Highway',
          distance: '5.2 km (Sitapur Urban ⇄ Rampur)',
          estTime: '18 mins drive time',
          condition: 'Paved Asphalt / High Speed Access',
        });
      });

      const sh26Line = L.polyline(sh26Coordinates, {
        color: '#f59e0b',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 6',
      }).addTo(map);

      sh26Line.on('click', () => {
        setSelectedRoadInfo({
          name: 'State Highway SH-26 (Sitapur–Shivapur Link)',
          type: '2-Lane State Highway',
          distance: '11.8 km (Sitapur Urban ⇄ Shivapur)',
          estTime: '28 mins drive time',
          condition: 'Good Asphalt Corridor',
        });
      });

      const mdr44Line = L.polyline(mdr44Coordinates, {
        color: '#64748b',
        weight: 4,
        opacity: 0.7,
        dashArray: '5, 5',
      }).addTo(map);

      mdr44Line.on('click', () => {
        setSelectedRoadInfo({
          name: 'Major District Road MDR-44 (North Kheri Road)',
          type: 'District Rural Road',
          distance: '34.0 km (Rampur ⇄ Lakshmipur)',
          estTime: '55 mins drive time',
          condition: 'Rural Asphalt / Speed Limit 40 km/h',
        });
      });

      polylinesRef.current = [nh30Line, sh26Line, mdr44Line];

      // Render Markers for all PHCs
      renderFacilityMarkers(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTileLayer]);

  // Update Markers when state or simulation changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      renderFacilityMarkers(L, mapInstanceRef.current);
    }
    updateMarkers();
  }, [phcs, isTechnicianOutageSimulated, selectedFacilityId]);

  const renderFacilityMarkers = (L: any, map: any) => {
    // Clear previous markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (dispatchPolylineRef.current) {
      map.removeLayer(dispatchPolylineRef.current);
      dispatchPolylineRef.current = null;
    }

    phcs.forEach((phc) => {
      const isSelected = phc.id === selectedFacilityId;
      const isRampur = phc.id === 'phc-rampur';
      const isSitapurUrban = phc.id === 'phc-sitapur';
      const isLakshmipur = phc.id === 'phc-lakshmipur';

      // Determine Status & Color
      let colorClass = 'bg-emerald-500 ring-emerald-300';
      let pinColorHex = '#10b981';
      let statusText = '🟢 Capable (All OK)';

      if (isRampur && isTechnicianOutageSimulated) {
        colorClass = 'bg-rose-600 ring-rose-300 animate-bounce';
        pinColorHex = '#ef4444';
        statusText = '🔴 OUTAGE (Technician Absent)';
      } else if (isLakshmipur) {
        colorClass = 'bg-amber-500 ring-amber-300';
        pinColorHex = '#f59e0b';
        statusText = '🟡 LIMITED (Stock 4d Buffer)';
      } else if (isSitapurUrban) {
        colorClass = 'bg-blue-600 ring-blue-300';
        pinColorHex = '#2563eb';
        statusText = '🔵 DONOR HUB (3 Techs)';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${pinColorHex};
            color: white;
            border: 2px solid white;
            border-radius: 9999px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          ">
            ${isSitapurUrban ? '★' : isRampur && isTechnicianOutageSimulated ? '!' : '●'}
            ${
              isSelected || (isRampur && isTechnicianOutageSimulated)
                ? `<div style="
                    position: absolute;
                    inset: -6px;
                    border: 2px solid ${pinColorHex};
                    border-radius: 9999px;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                    opacity: 0.75;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([phc.latitude, phc.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px; padding: 4px;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${phc.name}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            ${phc.district}, ${phc.state} &bull; ${phc.tier}
          </div>
          <div style="font-weight: bold; color: ${pinColorHex}; margin-bottom: 6px;">
            ${statusText}
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            Doctors: <b>${phc.resources.doctorsAvailable}</b> | Techs: <b>${
        isRampur && isTechnicianOutageSimulated ? 0 : phc.resources.techniciansAvailable
      }</b> | Stock: <b>${phc.resources.medicineStockPercentage}%</b>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedFacilityId(phc.id);
        setSelectedPHCId(phc.id);
      });

      markersRef.current.push(marker);
    });

    // If Rampur Outage is simulated, draw the animated AI Transit Dispatch corridor on NH-30
    if (isTechnicianOutageSimulated) {
      const dispatchRouteCoords: [number, number][] = [
        [27.5670, 80.6830], // Sitapur Urban (Donor)
        [27.5744, 80.6695], // PHC Rampur (Recipient)
      ];

      const dispatchLine = L.polyline(dispatchRouteCoords, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.9,
        dashArray: '10, 8',
      }).addTo(map);

      dispatchPolylineRef.current = dispatchLine;
    }
  };

  const handleRegionChange = (region: 'sitapur' | 'india' | 'south' | 'west') => {
    setActiveRegion(region);
    if (!mapInstanceRef.current) return;

    if (region === 'sitapur') {
      mapInstanceRef.current.setView([27.5744, 80.6695], 12);
    } else if (region === 'india') {
      mapInstanceRef.current.setView([22.5, 79.5], 5);
    } else if (region === 'south') {
      mapInstanceRef.current.setView([13.0, 75.5], 7);
    } else if (region === 'west') {
      mapInstanceRef.current.setView([20.5, 78.5], 7);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Top Map Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Compass className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Live Geographic Highway & Facility Map
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live OpenStreetMap Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive physical road network, real GPS coordinates, and real-time capability markers
            </p>
          </div>
        </div>

        {/* Region & Tile Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Region Zoom Shortcuts */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleRegionChange('sitapur')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeRegion === 'sitapur' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Sitapur Corridor (NH-30)
            </button>
            <button
              onClick={() => handleRegionChange('india')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeRegion === 'india' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              All India (15 PHCs)
            </button>
          </div>

          {/* Simulation Outage Toggle */}
          <button
            onClick={toggleTechnicianOutage}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
              isTechnicianOutageSimulated
                ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isTechnicianOutageSimulated ? 'Outage Active (Rampur 🔴)' : 'Simulate Rampur Outage'}
          </button>
        </div>
      </div>

      {/* Main Grid: Leaflet Map Container + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Real Leaflet Map */}
        <div className="lg:col-span-8 relative min-h-[480px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0" />

          {/* Floating Map Color Legend */}
          <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-slate-900/95 border border-slate-800 text-[11px] space-y-1 backdrop-blur-md shadow-xl">
            <div className="font-bold text-slate-200">Map Legend & Issues</div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Green = Capable (Staff & Reagents OK)
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow = Limited Buffer (Supply Alert)
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Red = Critical Outage (SPOF Missing)
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Blue = Donor Hub (Surplus Personnel)
            </div>
          </div>
        </div>

        {/* Right Side: Telemetry & Road Corridor Inspector */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Inspector Header */}
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
                {selectedRoadInfo ? 'Selected Highway Corridor' : 'Facility Telemetry & Road Access'}
              </span>

              {selectedRoadInfo ? (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white leading-tight">
                    {selectedRoadInfo.name}
                  </h4>
                  <div className="text-xs text-slate-300">
                    Classification: <strong className="text-blue-300">{selectedRoadInfo.type}</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Corridor Length:</span>
                      <strong className="text-white">{selectedRoadInfo.distance}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transit Time:</span>
                      <strong className="text-emerald-400">{selectedRoadInfo.estTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Surface Quality:</span>
                      <span className="text-slate-300">{selectedRoadInfo.condition}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRoadInfo(null)}
                    className="text-xs text-blue-400 hover:text-blue-300 underline pt-1"
                  >
                    &larr; Return to Facility Telemetry
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {activePHC.name}
                    </h4>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : activePHC.id === 'phc-lakshmipur'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                        ? 'RED OUTAGE'
                        : activePHC.id === 'phc-lakshmipur'
                        ? 'YELLOW LIMITED'
                        : 'GREEN READY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    GPS: <strong className="font-mono text-slate-300">{activePHC.latitude.toFixed(4)}°N, {activePHC.longitude.toFixed(4)}°E</strong> &bull; {activePHC.district}
                  </p>
                </div>
              )}
            </div>

            {/* Location Bottleneck / Health Status Box */}
            {!selectedRoadInfo && (
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                    : activePHC.id === 'phc-lakshmipur'
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold text-[11px] mb-1 flex items-center gap-1.5">
                  {activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : activePHC.id === 'phc-lakshmipur' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Location Operational Status:</span>
                </div>
                <p>
                  {activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                    ? 'CRITICAL OUTAGE: Diagnostic Lab Technician absent. Automated hematology analyzer idle. 28 daily tests blocked.'
                    : activePHC.id === 'phc-lakshmipur'
                    ? 'WARNING: 4-day medicine runway remaining. Backup DG under maintenance.'
                    : activePHC.id === 'phc-sitapur'
                    ? 'REGIONAL DONOR HUB: 3 certified technicians on shift (2 surplus available for rotational deployment).'
                    : `Operational: Diagnostic lab, emergency stabilization, and maternal wards fully staffed.`}
                </p>
              </div>
            )}

            {/* Live Telemetry Resource Metric Counts */}
            {!selectedRoadInfo && (
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Doctors</span>
                  <span className="font-bold font-mono text-slate-200 text-sm">
                    {activePHC.resources.doctorsAvailable}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Lab Techs</span>
                  <span
                    className={`font-bold font-mono text-sm ${
                      activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                        ? 'text-rose-400 font-extrabold animate-pulse'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated
                      ? 0
                      : activePHC.resources.techniciansAvailable}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Stock %</span>
                  <span
                    className={`font-bold font-mono text-sm ${
                      activePHC.resources.medicineStockPercentage < 70
                        ? 'text-amber-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {activePHC.resources.medicineStockPercentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Active AI Highway Reassignment Transit Note */}
            {activePHC.id === 'phc-rampur' && isTechnicianOutageSimulated && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-blue-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Highway Reassignment Active:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Rotational transit from <strong>Sitapur Urban CHC</strong> along <strong>NH-30</strong> (5.2 km, ~18 mins drive time) restores diagnostic capability to 100%.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Link */}
          <div className="pt-3 border-t border-slate-800">
            <Link
              href={`/phcs/${activePHC.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>Inspect {activePHC.name} Full Twin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
