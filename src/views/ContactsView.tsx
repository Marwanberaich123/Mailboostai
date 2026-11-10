import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Contact } from '../types';

export function ContactsView() {
  const { contacts, contactLists, suppressions, addContact, importContacts, deleteContact, toggleSuppression } = useData();

  const [search, setSearch] = useState('');
  const [listFilter, setListFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Manual Add Form
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [consentSource, setConsentSource] = useState('Website Opt-in Form');

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [targetImportListId, setTargetImportListId] = useState<string>('');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.firstName && c.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()));

    const matchesList = listFilter === 'all' || c.listIds.includes(listFilter);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesList && matchesStatus;
  });

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await addContact({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      company: company || undefined,
      listIds: selectedListIds,
      status: 'active',
      consentSource: consentSource || 'Direct Confirmation',
    });

    setEmail('');
    setFirstName('');
    setLastName('');
    setCompany('');
    setSelectedListIds([]);
    setAddModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setParsing(true);
      try {
        const res = await fetch('/api/contacts/parse-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvText: text }),
        });
        const data = await res.json();
        setParseResult(data);
      } catch (err: any) {
        alert('Failed to parse CSV: ' + err.message);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || !parseResult.validContacts) return;

    const formatted = parseResult.validContacts.map((c: any) => ({
      email: c.email,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      company: c.company || '',
      listIds: targetImportListId ? [targetImportListId] : [],
      status: 'active' as const,
      consentSource: 'CSV Batch Import (Confirmed Opt-in)',
    }));

    await importContacts(formatted);
    setImportModalOpen(false);
    setCsvText('');
    setParseResult(null);
  };

  const handleDownloadInvalid = () => {
    if (!parseResult || !parseResult.invalidContacts) return;
    const header = 'Row Number,Email,Reason\n';
    const rows = parseResult.invalidContacts
      .map((r: any) => `${r.rowNumber},"${r.rawEmail}","${r.reason}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invalid_contacts_report.csv';
    a.click();
  };

  const handleExportCSV = () => {
    const header = 'Email,First Name,Last Name,Company,Status,Consent Source\n';
    const rows = filteredContacts
      .map((c) => `"${c.email}","${c.firstName || ''}","${c.lastName || ''}","${c.company || ''}","${c.status}","${c.consentSource || ''}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Recipient Database &amp; Audience
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Permission-verified subscribers, intelligent CSV mapping, and suppression management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, company..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Lists ({contactLists.length})</option>
            {contactLists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Eligible</option>
            <option value="suppressed">Suppressed / Opt-out</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Company</th>
                <th className="py-3 px-4 font-medium">Lists</th>
                <th className="py-3 px-4 font-medium">Status &amp; Consent</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching contacts found in this list.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => {
                  const isSuppressed = c.status === 'suppressed' || suppressions.some(s => s.email.toLowerCase() === c.email.toLowerCase());
                  const listNames = contactLists
                    .filter(l => c.listIds.includes(l.id))
                    .map(l => l.name);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : c.email.split('@')[0]}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block">
                          {c.email}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {c.company || '—'}
                      </td>

                      <td className="py-3 px-4">
                        {listNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {listNames.map(name => (
                              <span
                                key={name}
                                className="text-[11px] text-slate-600 dark:text-slate-300"
                              >
                                {name} ·
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Uncategorized</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {isSuppressed ? (
                            <span className="text-rose-600 dark:text-rose-400 font-medium inline-flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Suppressed (Blocked)</span>
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Opt-in Confirmed</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 block">
                            {c.consentSource || 'Direct opt-in'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleSuppression(c.email, isSuppressed ? undefined : 'manual_block')}
                            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                              isSuppressed
                                ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            {isSuppressed ? 'Unsuppress' : 'Suppress'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${c.email}?`)) {
                                deleteContact(c.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Contact Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add Individual Recipient</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@cyberdyne.com"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sarah"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Connor"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Cyberdyne Systems"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Lists
                </label>
                <div className="space-y-1 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {contactLists.map(l => (
                    <label key={l.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedListIds.includes(l.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedListIds(prev => [...prev, l.id]);
                          else setSelectedListIds(prev => prev.filter(id => id !== l.id));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{l.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Consent / Opt-in Source
                </label>
                <input
                  type="text"
                  value={consentSource}
                  onChange={(e) => setConsentSource(e.target.value)}
                  placeholder="e.g. Inbound Demo Request"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setImportModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Import Contacts from CSV</h2>
                <p className="text-xs text-slate-500">Automatically inspect columns, syntax, and duplicates</p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Contact List (Optional)
                </label>
                <select
                  value={targetImportListId}
                  onChange={(e) => setTargetImportListId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">— Do not assign to list —</option>
                  {contactLists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Click to select CSV file
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-1">
                  Format: Email, First Name, Last Name, Company
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {parsing && (
                <div className="text-center py-2 text-xs text-indigo-600 font-medium">
                  Analyzing CSV records and syntax...
                </div>
              )}

              {/* Import Results Preview */}
              {parseResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        {parseResult.validCount}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">Valid Contacts</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {parseResult.duplicateCount}
                      </span>
                      <span className="text-[10px] text-amber-600 block">Duplicates Scrubbed</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <span className="text-base font-bold text-rose-700 dark:text-rose-400 font-mono">
                        {parseResult.invalidCount}
                      </span>
                      <span className="text-[10px] text-rose-600 block">Invalid Syntax</span>
                    </div>
                  </div>

                  {parseResult.invalidCount > 0 && (
                    <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
                      <span>{parseResult.invalidCount} records contained malformed emails.</span>
                      <button
                        onClick={handleDownloadInvalid}
                        className="underline text-[11px] font-semibold hover:text-rose-900"
                      >
                        Download Invalid CSV
                      </button>
                    </div>
                  )}

                  {/* Preview Rows */}
                  {parseResult.sampleValid && parseResult.sampleValid.length > 0 && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Preview Sample (First 5 records):
                      </span>
                      {parseResult.sampleValid.map((s: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          <span>{s.email}</span>
                          <span>{s.firstName} {s.lastName} ({s.company || '—'})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!parseResult || parseResult.validCount === 0}
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  Import {parseResult?.validCount || 0} Contacts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
