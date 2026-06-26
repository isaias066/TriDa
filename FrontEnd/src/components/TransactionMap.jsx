import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme, useBank } from '../store/Context';
import '../styles/TransactionMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

const RC = { low: '#30D158', medium: '#FFD60A', high: '#FF9F0A', critical: '#FF453A' };
const ALERT_LEVELS = {
  low:      { label: 'Bajo' },
  medium:   { label: 'Medio' },
  high:     { label: 'Alto' },
  critical: { label: 'Crítico' },
};
const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function MapUpdater() {
  const m = useMap();
  useEffect(() => { m.invalidateSize(); }, [m]);
  return null;
}

function Pulse({ lat, lng, color, size }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (!map) return;
    const icon = L.divIcon({
      className: 'pulse-m',
      html: `<div class="p-ring" style="--c:${color};--s:${size}px"><div class="p-inner"></div><div class="p-outer"></div></div>`,
      iconSize: [size * 2, size * 2],
      iconAnchor: [size, size],
    });
    const mk = L.marker([lat, lng], { icon, interactive: false }).addTo(map);
    ref.current = mk;
    const t = setTimeout(() => { map.removeLayer(mk); }, 3500);
    return () => { clearTimeout(t); if (ref.current) map.removeLayer(ref.current); };
  }, [map, lat, lng, color, size]);
  return null;
}

export default function TransactionMap() {
  const { theme }        = useTheme();
  const { selectedBank } = useBank();

  const [ubicaciones, setUbicaciones] = useState([]);
  const [stats,       setStats]       = useState({ total: 0, crit: 0, high: 0, app: 0, blk: 0 });
  const [pulses,      setPulses]      = useState([]);
  const prevRef = useRef(0);

  const tile = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  const qs = useMemo(() =>
    selectedBank && selectedBank !== 'all'
      ? `?banco=${encodeURIComponent(selectedBank)}`
      : ''
  , [selectedBank]);

  useEffect(() => {
  fetch(`http://localhost:5000/api/mapa/ubicaciones${qs}`)
    .then(res => res.json())
    .then(data => {
      const normalized = data.map(u => {
        const score = Number(u.score_riesgo ?? 0);
        const lvl   = score >= 80 ? 'critical'
                    : score >= 60 ? 'high'
                    : score >= 30 ? 'medium'
                    : 'low';
        const estado = String(u.estado_transaccion || '').toUpperCase();
        const status = estado === 'BLOQUEADA' ? 'blocked'
                     : estado === 'ALERTADA'  ? 'flagged'
                     : estado === 'PENDIENTE' ? 'pending'
                     : 'approved';
        return {
          id:         u.id_transaccion,
          alertLevel: lvl,
          riskScore:  score,
          status,
          user:       u.cliente || 'Sin nombre',
          type:       u.tipo_transaccion || '—',
          amount:     Number(u.monto ?? 0),
          channel:    u.canal || '—',
          bank: {
            name:  u.banco       || 'Sin banco',
            color: u.banco_color || '#6366F1',
          },
          location: {
            lat:  parseFloat(u.latitud  ?? 0),
            lng:  parseFloat(u.longitud ?? 0),
            city: u.ciudad || '—',
          },
        };
      }).filter(u => u.location.lat !== 0 && u.location.lng !== 0);
      setUbicaciones(normalized);
    })
    .catch(err => console.error('Error cargando ubicaciones:', err));
}, [qs]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/mapa/stats${qs}`)
      .then(res => res.json())
      .then(data => {
        setStats({
          total: data.total_transacciones ?? data.total ?? 0,
          crit:  data.total_criticas      ?? data.crit  ?? 0,
          high:  data.total_altas         ?? data.high  ?? 0,
          app:   data.total_aprobadas     ?? data.app   ?? 0,
          blk:   data.total_bloqueadas    ?? data.blk   ?? 0,
        });
      })
      .catch(err => console.error('Error cargando stats del mapa:', err));
  }, [qs]);

  useEffect(() => {
    if (ubicaciones.length > prevRef.current) {
      const diff = ubicaciones.slice(0, ubicaciones.length - prevRef.current);
      const np = diff.slice(0, 6).map((t, i) => ({
        id:    `${t.id}-p-${Date.now()}-${i}`,
        lat:   t.location.lat,
        lng:   t.location.lng,
        color: RC[t.alertLevel],
        size:  t.alertLevel === 'critical' ? 24 : t.alertLevel === 'high' ? 18 : 14,
      }));
      setPulses(prev => [...np, ...prev].slice(0, 40));
    }
    prevRef.current = ubicaciones.length;
  }, [ubicaciones]);

  const txns = useMemo(() => ubicaciones.slice(0, 150), [ubicaciones]);

  return (
    <div className="mp">
      <div className="mp-header">
        <div>
          <h1>Mapa Global</h1>
          <p>Transacciones en tiempo real alrededor del mundo</p>
        </div>
        <div className="mp-legend">
          {Object.entries(ALERT_LEVELS).map(([k, v]) => (
            <div key={k} className="mp-leg-item">
              <span className="mp-leg-dot" style={{ background: RC[k], boxShadow: `0 0 8px ${RC[k]}` }}></span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mp-map">
        <MapContainer
          center={[10, -50]} zoom={3}
          className="lmap"
          zoomControl={false}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
        >
          <TileLayer url={tile}/>
          <MapUpdater/>
          {pulses.map(p => (
            <Pulse key={p.id} lat={p.lat} lng={p.lng} color={p.color} size={p.size}/>
          ))}
          {txns.map(t => {
            const c      = RC[t.alertLevel];
            const recent = txns.indexOf(t) < 5;
            const r      = t.alertLevel === 'critical' ? 8 : t.alertLevel === 'high' ? 5 : t.alertLevel === 'medium' ? 4 : 3;
            return (
              <CircleMarker
                key={t.id}
                center={[t.location.lat, t.location.lng]}
                radius={r}
                pathOptions={{
                  color: c, fillColor: c,
                  fillOpacity: recent ? 0.9 : 0.5,
                  weight: recent ? 2.5 : 1,
                  opacity: recent ? 1 : 0.6,
                }}
              >
                <Popup>
                  <div className="mpop">
                    <div className="mpop-h" style={{ borderLeftColor: c }}>
                      <strong>{t.id}</strong>
                      <span style={{ color: c }}>{t.riskScore}%</span>
                    </div>
                    <div className="mpop-b">
                      <div className="mpr"><span>Usuario</span><strong>{t.user}</strong></div>
                      <div className="mpr"><span>Banco</span><strong style={{ color: t.bank.color }}>{t.bank.name}</strong></div>
                      <div className="mpr"><span>Tipo</span><strong>{t.type}</strong></div>
                      <div className="mpr"><span>Monto</span><strong>{fmtCOP(t.amount)}</strong></div>
                      <div className="mpr"><span>Ciudad</span><strong>{t.location.city}</strong></div>
                      <div className="mpr"><span>Canal</span><strong>{t.channel}</strong></div>
                      <div className="mpr"><span>Estado</span>
                        <strong style={{ color: c }}>
                          {t.status === 'blocked' ? '🚫 Bloqueada' : t.status === 'flagged' ? '⚠️ Marcada' : '✅ Aprobada'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <div className="mp-overlay-stats">
          <div className="mp-os"><span className="mp-os-v">{stats.total}</span><span className="mp-os-l">Activas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF453A' }}>{stats.crit}</span><span className="mp-os-l">Críticas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#FF9F0A' }}>{stats.high}</span><span className="mp-os-l">Altas</span></div>
          <div className="mp-os"><span className="mp-os-v" style={{ color: '#30D158' }}>{stats.app}</span><span className="mp-os-l">Aprobadas</span></div>
        </div>
      </div>
    </div>
  );
}