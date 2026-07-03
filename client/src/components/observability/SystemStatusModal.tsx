import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Database, Cpu, Clock, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { SystemHealthMetrics } from '../../types/index.js';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MetricsData {
  totalRequests: number;
  totalErrors: number;
  errorRatePercentage: string;
  latencyMs: {
    avg: number;
    p50: number;
    p95: number;
  };
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SystemHealthMetrics | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [healthRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/metrics'),
      ]);
      const healthJson = await healthRes.json();
      const metricsJson = await metricsRes.json();

      if (healthJson.success) setHealth(healthJson.data);
      if (metricsJson.success) setMetrics(metricsJson.data);
    } catch {
      console.error('Failed to fetch telemetry data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 5000); // auto refresh every 5s while open
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchTelemetry]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Telemetry & Health Observability" maxWidth="650px">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {health?.status === 'UP' ? (
            <span className="badge badge-resolved" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
              <CheckCircle2 size={16} /> System Operational
            </span>
          ) : (
            <span className="badge badge-new" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
              <AlertTriangle size={16} /> Service Degraded
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-refreshing every 5s</span>
        </div>
        <button
          onClick={fetchTelemetry}
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {health && metrics ? (
        <div className="grid-2" style={{ gap: '1rem' }}>
          {/* Database Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-cyan)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Database size={18} />
              <span>Database Persistence</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {health.database.status.toUpperCase()}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SQLite Query Ping: <strong>{health.database.latencyMs} ms</strong>
            </p>
          </div>

          {/* Uptime Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Clock size={18} />
              <span>Process Uptime</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {health.system.uptimeFormatted}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Started: <strong>{new Date(Date.now() - health.system.uptimeSeconds * 1000).toLocaleTimeString()}</strong>
            </p>
          </div>

          {/* Memory Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Cpu size={18} />
              <span>Memory Footprint</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {health.system.memory.rssMb} MB <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>RSS</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Heap Used: <strong>{health.system.memory.heapUsedMb} MB</strong> / {health.system.memory.heapTotalMb} MB
            </p>
          </div>

          {/* API Latency Card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Activity size={18} />
              <span>API Request Latency</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.latencyMs.p95} ms <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>p95</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total Requests: <strong>{metrics.totalRequests}</strong> (Err Rate: {metrics.errorRatePercentage})
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading live system telemetry...
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        💡 <strong>Engineering Note:</strong> This telemetry is served directly by the backend Express observability middleware (`/api/health` & `/api/metrics`), demonstrating real-time health checks without external third-party APM overhead.
      </div>
    </Modal>
  );
};
