import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Send,
  Clock,
  CornerUpLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Reply } from '../types';

export function RepliesInboxView() {
  const { replies, sendReply } = useData();

  const [search, setSearch] = useState('');
  const [selectedReply, setSelectedReply] = useState<Reply | null>(replies[0] || null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const filteredReplies = replies.filter(r =>
    r.fromEmail.toLowerCase().includes(search.toLowerCase()) ||
    (r.fromName && r.fromName.toLowerCase().includes(search.toLowerCase())) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReply || !replyText.trim()) return;

    setSending(true);
    await sendReply(selectedReply.id, replyText);
    setSending(false);
    setReplyText('');
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          صندوق الردود والوارد
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          استقبال ردود المستلمين على حملاتك البريدية والرد المباشر عليها من مكان واحد.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[480px] overflow-hidden">
        {/* العمود الأيمن: قائمة المحادثات */}
        <div className="border-l border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في الردود الواردة..."
                className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReplies.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <span className="font-bold block">لا توجد ردود واردة حالياً</span>
                <span className="text-[11px] block text-slate-400">ستظهر هنا أي رسائل يرسلها المستلمون رداً على حملاتك</span>
              </div>
            ) : (
              filteredReplies.map((r) => {
                const isSelected = selectedReply?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReply(r)}
                    className={`w-full text-right p-4 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {r.fromName || r.fromEmail}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {new Date(r.receivedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mb-1">
                      {r.subject}
                    </div>

                    <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {r.snippet}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* العمود الأيسر: عرض المحادثة والرد */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6">
          {selectedReply ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {selectedReply.subject}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-white">
                      المرسل: {selectedReply.fromName} &lt;{selectedReply.fromEmail}&gt;
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedReply.receivedAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/60 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {selectedReply.body}
                </div>
              </div>

              {/* نموذج الرد */}
              <form onSubmit={handleSendManualReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {sentNotice && (
                  <div className="p-2 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-md">
                    تم إرسال الرد بنجاح للمستلم.
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>الرد المباشر على {selectedReply.fromEmail}:</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'جاري الإرسال...' : 'إرسال الرد'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
              <Inbox className="w-10 h-10 opacity-40" />
              <span className="text-xs font-bold">صندوق الردود الموحد</span>
              <span className="text-[11px] text-slate-500">اختر رسالة من القائمة لعرض تفاصيلها والرد عليها</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
