import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '../context/DataContext';

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
  const [consentSource, setConsentSource] = useState('موافقة مباشرة ومصرح بها');

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
      consentSource: consentSource || 'موافقة مباشرة',
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
        alert('تعذر قراءة ملف CSV: ' + err.message);
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
      consentSource: 'استيراد جماعي عبر CSV',
    }));

    await importContacts(formatted);
    setImportModalOpen(false);
    setCsvText('');
    setParseResult(null);
  };

  const handleExportCSV = () => {
    const header = 'البريد الإلكتروني,الاسم الأول,اسم العائلة,الشركة,الحالة\n';
    const rows = filteredContacts
      .map((c) => `"${c.email}","${c.firstName || ''}","${c.lastName || ''}","${c.company || ''}","${c.status}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            المشتركون وقاعدة جهات الاتصال
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            إدارة المستلمين المصرح لهم، استيراد وتصفية ملفات CSV، واستبعاد العناوين الملغاة تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {contacts.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV</span>
            </button>
          )}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد CSV</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مستلم</span>
          </button>
        </div>
      </div>

      {/* البحث والتصفية */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالبريد أو الاسم أو الشركة..."
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">جميع القوائم ({contactLists.length})</option>
            {contactLists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">كافة الحالات</option>
            <option value="active">مؤهل ونشط</option>
            <option value="suppressed">مستبعد / ملغي</option>
          </select>
        </div>
      </div>

      {/* جدول جهات الاتصال */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              قائمة المستلمين فارغة حالياً
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              أضف جهة اتصال يدوياً أو ارفع ملف CSV يحتوي على عناوين البريد وأسماء المستلمين.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مستلم</span>
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>استيراد CSV</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">المستلم</th>
                  <th className="py-3 px-4 font-semibold">الشركة / الجهة</th>
                  <th className="py-3 px-4 font-semibold">القوائم</th>
                  <th className="py-3 px-4 font-semibold">حالة الاستهداف</th>
                  <th className="py-3 px-4 font-semibold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredContacts.map((c) => {
                  const isSuppressed = c.status === 'suppressed' || suppressions.some(s => s.email.toLowerCase() === c.email.toLowerCase());
                  const listNames = contactLists.filter(l => c.listIds.includes(l.id)).map(l => l.name);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : c.email.split('@')[0]}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block" dir="ltr">
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
                              <span key={name} className="text-[11px] text-slate-600 dark:text-slate-300">
                                {name} ·
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">بدون قائمة</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isSuppressed ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold inline-flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>مستبعد (محظور من الإرسال)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>مؤهل للإرسال</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleSuppression(c.email, isSuppressed ? undefined : 'manual_block')}
                            className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                              isSuppressed
                                ? 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            {isSuppressed ? 'إلغاء الاستبعاد' : 'استبعاد'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`حذف المستلم ${c.email}؟`)) {
                                deleteContact(c.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة إضافة مستلم يدوياً */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">إضافة مستلم جديد</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="محمد"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    اسم العائلة
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="العمري"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  اسم الشركة / المنظمة
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="شركة التقنية المتقدمة"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {contactLists.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    التعيين إلى القوائم
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
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  حفظ المستلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة استيراد CSV */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setImportModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">استيراد جهات الاتصال من ملف CSV</h2>
                <p className="text-xs text-slate-500">فحص تلقائي للأعمدة وصحة العناوين وتصفية المكرر</p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3">
              {contactLists.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    إضافة إلى قائمة معينة (اختياري)
                  </label>
                  <select
                    value={targetImportListId}
                    onChange={(e) => setTargetImportListId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">— بدون تعيين لقائمة —</option>
                    {contactLists.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  انقر هنا لاختيار ملف CSV
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  الأعمدة المدعومة: Email, First Name, Last Name, Company
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
                  جاري تحليل السجلات والتحقق من صحة العناوين...
                </div>
              )}

              {parseResult && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">{parseResult.validCount}</span>
                      <span className="text-[10px] text-emerald-600">عناوين صالحة</span>
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-800">
                      <span className="font-bold text-amber-700 dark:text-amber-400 block">{parseResult.duplicateCount}</span>
                      <span className="text-[10px] text-amber-600">مكرر تم تداركه</span>
                    </div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-800">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block">{parseResult.invalidCount}</span>
                      <span className="text-[10px] text-rose-600">صيغ خاطئة</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!parseResult || parseResult.validCount === 0}
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  تأكيد استيراد {parseResult?.validCount || 0} جهة اتصال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
