import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export function ContactListsView() {
  const { contactLists, contacts, createList, updateList, deleteList } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenCreate = () => {
    setEditingListId(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (listId: string) => {
    const target = contactLists.find(l => l.id === listId);
    if (!target) return;
    setEditingListId(listId);
    setName(target.name);
    setDescription(target.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingListId) {
      await updateList(editingListId, name.trim(), description.trim());
    } else {
      await createList(name.trim(), description.trim());
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            قوائم وشرائح المشتركين
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            تقسيم جهات الاتصال إلى مجموعات وشرائح مستهدفة لإرسال حملات مخصصة.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إنشاء قائمة جديدة</span>
        </button>
      </div>

      {contactLists.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <FolderKanban className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            لا توجد أي قوائم مشتركين حتى الآن
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            أنشئ أول قائمة مستهدفين (مثل: عملاء محتملون، مشتركو النشرة، شركاء) لتنظيم المستلمين.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إنشاء أول قائمة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactLists.map((list) => {
            const memberCount = contacts.filter(c => c.listIds.includes(list.id)).length;

            return (
              <div
                key={list.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {list.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {memberCount} مستلم
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(list.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`حذف القائمة "${list.name}"؟ لن يتم حذف جهات الاتصال.`)) {
                            deleteList(list.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                    {list.description || 'لا يوجد وصف مضاف.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>أُنشئت: {new Date(list.createdAt).toLocaleDateString('ar-EG')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingListId ? 'تعديل بيانات القائمة' : 'إنشاء قائمة مشتركين جديدة'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم القائمة *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مدراء الشركات، المشتركون الجدد"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  الوصف أو الملاحظات
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات توضيحية حول هذه الفئة المستهدفة"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  حفظ القائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
