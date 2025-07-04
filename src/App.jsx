import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

export default function SigmaDashboard() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trades, setTrades] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use production API endpoints with environment variable
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    
    Promise.all([
      fetch(`${API_BASE}/status`).then(res => res.json()),
      fetch(`${API_BASE}/history`).then(res => res.json()),
      fetch(`${API_BASE}/leaderboard`).then(res => res.json()),
      fetch(`${API_BASE}/trades`).then(res => res.json()),
      fetch(`${API_BASE}/health`).then(res => res.json())
      ])
      .then(([statusData, historyData, leaderboardData, tradeData, healthData]) => {
        setStatus(statusData);
        setHistory(historyData);
        setLeaderboard(leaderboardData);
        setTrades(tradeData);
        setHealth(healthData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading Sigma Fund...</div>;
  if (!status || !health) return <div className="p-4 text-red-600">Failed to load system status.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sigma Fund Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Last Run">{health.last_run || "-"}</Card>
        <Card title="Quotes Loaded">{health.quotes_loaded ?? 0}</Card>
        <Card title="Symbols Found">{health.symbols_found ?? 0}</Card>
        <Card title="Agent Outputs">{health.agent_outputs ?? 0}</Card>
        <Card title="Fund Entries">{health.fund_entries ?? 0}</Card>
        <Card title="Win Rate">
          {typeof health.win_rate === "number" ? health.win_rate.toFixed(1) : "0.0"}%
        </Card>
        <Card title="Latest PnL">
          ${typeof health.latest_pnl === "number" ? health.latest_pnl.toFixed(2) : "0.00"}
        </Card>
        <Card title="Recent Runs (12h)">
          {health.recent_run_count ?? 0} / {health.expected_runs ?? 0} {health.cron_gap_detected && <span className="text-red-600 font-bold ml-1">⚠️</span>}
        </Card>
        <Card title="Cron Gap Detected">
          {health.cron_gap_detected ? (
            <span className="text-red-600 font-bold">Yes ⚠️</span>
          ) : (
            <span className="text-green-600">No</span>
          )}
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mt-6">Fund PnL Over Time</h2>
        <div className="w-full h-72 bg-white rounded-2xl shadow p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} height={50} />
              <YAxis domain={['auto', 'auto']} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="PnL" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Live Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card title="AGI Mind Status">
            <span className={`font-bold ${status.agi_mind_connected ? 'text-green-600' : 'text-red-600'}`}>
              {status.agi_mind_connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </Card>
          <Card title="Active Signals">
            <span className="text-blue-600 font-bold">{status.active_signals_count || 0}</span>
          </Card>
          <Card title="System Health">
            <span className={`font-bold ${
              status.system_health === 'operational' ? 'text-green-600' : 
              status.system_health === 'initializing' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {status.system_health === 'operational' ? '✅ Operational' :
               status.system_health === 'initializing' ? '🟡 Initializing' : '⚠️ Maintenance'}
            </span>
          </Card>
        </div>
        <h3 className="text-lg font-medium mb-2">Recent Signals</h3>
        <ul className="mt-2 list-disc list-inside">
          {status.latest_signals?.length ? status.latest_signals.map((sig, idx) => (
            <li key={idx} className="text-sm">
              {typeof sig === 'string' ? sig : `${sig.symbol || 'Unknown'}: ${sig.action || 'Signal'} - ${sig.confidence || 'N/A'}% confidence`}
            </li>
          )) : <li className="text-gray-500">No recent signals</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Agent Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {status.agents?.length ? status.agents.map((agent, idx) => (
            <div key={idx} className="bg-white shadow rounded-2xl p-4">
              <div className="text-sm text-gray-500">{agent.name}</div>
              <div className="font-semibold text-lg">{agent.symbol} → {agent.action}</div>
              <div className="text-sm text-gray-600 mt-1">Confidence: <span className="font-medium">{(agent.confidence * 100).toFixed(1)}%</span></div>
              <div className={`text-sm mt-1 ${agent.PnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>PnL: {agent.PnL.toFixed(2)}</div>
            </div>
          )) : <div>No agent data found.</div>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Agent Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left mt-2 bg-white shadow rounded-2xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Trades</th>
                <th className="px-4 py-2">Wins</th>
                <th className="px-4 py-2">Losses</th>
                <th className="px-4 py-2">Win Rate</th>
                <th className="px-4 py-2">PnL ($)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length ? leaderboard.map((entry, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 font-medium">{entry.agent}</td>
                  <td className="px-4 py-2">{entry.trades}</td>
                  <td className="px-4 py-2">{entry.wins}</td>
                  <td className="px-4 py-2">{entry.losses}</td>
                  <td className="px-4 py-2">{entry.win_rate}%</td>
                  <td className={`px-4 py-2 ${entry.PnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{entry.PnL.toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td className="px-4 py-2" colSpan="6">No leaderboard data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Recent Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm text-left mt-2 bg-white shadow rounded-2xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Agent</th>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">PnL</th>
              </tr>
            </thead>
            <tbody>
              {trades.length ? trades.map((t, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">{t.agent}</td>
                  <td className="px-4 py-2">{t.symbol}</td>
                  <td className="px-4 py-2">{t.action}</td>
                  <td className={`px-4 py-2 ${t.PnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t.PnL.toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td className="px-4 py-2" colSpan="5">No trades yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-lg font-semibold mt-1">{children}</div>
    </div>
  );
}
