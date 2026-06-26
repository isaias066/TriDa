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
const ALERT_LEVELS = { low: { label: 'Bajo' }, medium: { label: 'Medio' }, high: { label: 'Alto' }, critical: { label: 'Crítico' } };
const fmtCOP = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function MapUpdater() {
  const m = useMap();
  useEffect(() => { m.invalidateSize(); }, [m]);
  return null;
}

export default function TransactionMap() {
  const { theme }        = useTheme();
  const { selectedBank } = useBank();
  const [ubicaciones, setUbicaciones] = useState([]);
  const [stats,       setStats]       = useState({ total: 0, crit: 0, high: 0, app: 0, blk: 0 });

  const tile = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  const qs = useMemo(() => selectedBank && selectedBank !== 'all' ? `?banco=${encodeURIComponent(selectedBank)}` : '', [selectedBank]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/mapa/ubicaciones${qs}`)
      .then(res => res.json())
      .then(data => {
        const normalized = data.map(u => {
          const score = Number(u.score_riesgo ?? u.monto ?? 0);
          const lvl   = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
          return {
            id:         u.id_transaccion ?? u.id,
            alertLevel: lvl,
            riskScore:  score,
            status:     String(u.estado_transaccion || '').toLowerCase(),
            user:       u.cliente || 'Desconocido',
            type:       u.tipo_transaccion || '—',
            amount:     Number(u.monto ?? 0),
            location:   { lat: parseFloat(u.latitud ?? 4.6), lng: parseFloat(u.longitud ?? -74.0), city: u.ciudad || 'Colombia' }
          };
        });
        setUbicaciones(normalized);
      }).catch(err => console.error(err));
  }, [qs]);

  return (
    <div className="mp">
      <div className="mp-header">
        <h1>Mapa Global</h1>
      </div>
      <div className="mp-map">
        <MapContainer center={[4.6393, -74.0821]} zoom={5} className="lmap">
          <TileLayer url={tile}/>
          <MapUpdater/>
          {ubicaciones.map(t => (
            <CircleMarker key={t.id} center={[t.location.lat, t.location.lng]} radius={6} pathOptions={{ color: RC[t.alertLevel], fillColor: RC[t.alertLevel] }}>
              <Popup>
                <div><strong>ID: {t.id}</strong><br/>Monto: {fmtCOP(t.amount)}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}