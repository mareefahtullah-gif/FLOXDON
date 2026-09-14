import React, { useState } from 'react';
import { 
  Database, Table, Play, Plus, Trash2, RefreshCw, 
  Terminal, CheckCircle2, ChevronRight, HardDrive, 
  Search, ShieldCheck, Download
} from 'lucide-react';
import { DatabaseTable } from '../types';
import { INITIAL_DATABASE_TABLES } from '../data/defaultProjects';

interface DatabaseStudioProps {
  appName: string;
}

export const DatabaseStudio: React.FC<DatabaseStudioProps> = ({ appName }) => {
  const [tables, setTables] = useState<DatabaseTable[]>(INITIAL_DATABASE_TABLES);
  const [activeTableName, setActiveTableName] = useState<string>(tables[0]?.name || 'fleet_units');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM fleet_units ORDER BY id ASC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [newRowInputs, setNewRowInputs] = useState<Record<string, string>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);

  const activeTable = tables.find((t) => t.name === activeTableName) || tables[0];

  const handleExecuteSql = () => {
    setIsExecuting(true);
    setQueryError(null);

    setTimeout(() => {
      setIsExecuting(false);
      const trimmed = sqlQuery.trim().toLowerCase();

      try {
        if (trimmed.startsWith('select')) {
          if (trimmed.includes('telemetry_logs')) {
            const telTable = tables.find((t) => t.name === 'telemetry_logs');
            setQueryResult(telTable ? telTable.rows : []);
          } else if (trimmed.includes('user_accounts')) {
            const usrTable = tables.find((t) => t.name === 'user_accounts');
            setQueryResult(usrTable ? usrTable.rows : []);
          } else {
            const flTable = tables.find((t) => t.name === 'fleet_units');
            setQueryResult(flTable ? flTable.rows : []);
          }
        } else if (trimmed.startsWith('insert')) {
          setQueryResult([{ status: 'INSERT 0 1', rowsAffected: 1 }]);
        } else {
          setQueryResult([{ status: 'COMMAND OK', query: sqlQuery }]);
        }
      } catch (err: any) {
        setQueryError(err.message || 'Syntax error in SQL query');
      }
    }, 450);
  };

  const handleInsertRow = () => {
    if (!activeTable) return;
    const newRow: any = { id: activeTable.rows.length + 1 };
    activeTable.columns.forEach((col) => {
      newRow[col.name] = newRowInputs[col.name] || 'N/A';
    });

    setTables((prev) =>
      prev.map((t) =>
        t.name === activeTableName ? { ...t, rows: [...t.rows, newRow] } : t
      )
    );
    setNewRowInputs({});
    setIsAddingRow(false);
  };

  const handleDeleteRow = (rowId: any) => {
    setTables((prev) =>
      prev.map((t) =>
        t.name === activeTableName
          ? { ...t, rows: t.rows.filter((r) => r.id !== rowId) }
          : t
      )
    );
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto select-none font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white p-6 rounded-2xl border shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                PostgreSQL 16 Database Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                Port 5432 • Local Cluster
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual schema manager, interactive SQL console, and live table data editor running on your PostgreSQL cluster.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>postgres://forge:••••@localhost:5432/{appName.toLowerCase().replace(/[^a-z0-9]/g, '')}_db</span>
          </div>
        </div>

        {/* SQL Console Box */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-emerald-600" />
              SQL Query Console
            </span>

            <button
              onClick={handleExecuteSql}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : 'fill-current'}`} />
              <span>{isExecuting ? 'Executing...' : 'Run SQL'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-white">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-xs font-mono text-indigo-950 focus:outline-none resize-none leading-relaxed"
              placeholder="Enter SQL command (e.g. SELECT * FROM fleet_units;)"
            />
          </div>

          {/* Query Result Strip */}
          {queryResult && (
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto">
              <div className="text-[11px] text-emerald-700 font-bold mb-1">
                ✓ Query executed successfully: {queryResult.length} rows returned (0.8ms)
              </div>
              <pre className="text-[11px] text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}

          {queryError && (
            <div className="p-3 bg-rose-50 border-t border-rose-200 text-xs text-rose-700 font-mono">
              ✕ {queryError}
            </div>
          )}
        </div>

        {/* Database Tables & Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Table Selector Sidebar */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block px-1">
              Database Tables
            </span>
            <div className="space-y-1">
              {tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    setActiveTableName(t.name);
                    setSqlQuery(`SELECT * FROM ${t.name} LIMIT 50;`);
                    setQueryResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                    activeTableName === t.name
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-mono truncate">{t.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {t.rows.length} rows
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Table Data Grid */}
          <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                <span className="font-mono text-xs font-bold text-slate-900">
                  Table: {activeTable?.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({activeTable?.columns.length} columns, {activeTable?.rows.length} rows)
                </span>
              </div>

              <button
                onClick={() => setIsAddingRow(!isAddingRow)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Row</span>
              </button>
            </div>

            {/* Insert Row Form */}
            {isAddingRow && (
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">Insert new record into {activeTable?.name}:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeTable?.columns.map((col) => (
                    <div key={col.name} className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 font-medium">{col.name} ({col.type})</label>
                      <input
                        type="text"
                        placeholder={col.name}
                        value={newRowInputs[col.name] || ''}
                        onChange={(e) =>
                          setNewRowInputs({ ...newRowInputs, [col.name]: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsAddingRow(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInsertRow}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Confirm Insert
                  </button>
                </div>
              </div>
            )}

            {/* Table Scroll Area */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    {activeTable?.columns.map((col) => (
                      <th key={col.name} className="p-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{col.name}</span>
                          <span className="text-[9px] text-slate-400">({col.type})</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTable?.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition text-slate-700">
                      {activeTable.columns.map((col) => (
                        <td key={col.name} className="p-3 whitespace-nowrap">
                          {String(row[col.name] ?? 'null')}
                        </td>
                      ))}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
