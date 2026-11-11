import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Copy,
  Edit3,
  Trash2,
  Eye,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CampaignTemplate } from '../types';

export function TemplatesView() {
  const { templates, createTemplate, updateTemplate, duplicateTemplate, deleteTemplate } = useData();

  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);

  // Editor State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const availableVariables = [
    { tag: '{{first_name}}', desc: 'الاسم الأول للمستلم (مثل: محمد)' },
    { tag: '{{last_name}}', desc: 'اسم العائلة للمستلم' },
    { tag: '{{company}}', desc: 'اسم الشركة أو المؤسسة' },
    { tag: '{{email}}', desc: 'عنوان البريد الإلكتروني للمستلم' },
  ];

  const handleOpenCreate = () => {
    setIsEditing(false);
    setActiveTemplateId(null);
    setTitle('');
    setSubject('');
    setHtmlContent('<p>مرحباً {{first_name}}،</p>\n<p>اكتب نص رسالتك هنا...</p>\n<p>مع خالص التحية،<br>اسمك</p>');
    setTextContent('مرحباً {{first_name}}،\n\nاكتب نص رسالتك هنا...\n\nمع التحية،\nاسمك');
    setEditorModalOpen(true);
  };

  const handleOpenEdit = (t: CampaignTemplate) => {
    setIsEditing(true);
    setActiveTemplateId(t.id);
    setTitle(t.title);
    setSubject(t.subject);
    setHtmlContent(t.htmlContent);
    setTextContent(t.textContent || '');
    setEditorModalOpen(true);
  };

  const handleOpenPreview = (t: CampaignTemplate) => {
    setSelectedTemplate(t);
    setPreviewModalOpen(true);
  };

  const handleInsertTag = (tag: string) => {
    setHtmlContent(prev => prev + ' ' + tag);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject) return;

    if (isEditing && activeTemplateId) {
      await updateTemplate(activeTemplateId, {
        title,
        subject,
        htmlContent,
        textContent,
        variables: ['first_name', 'last_name', 'company', 'email'],
      });
    } else {
      await createTemplate({
        title,
        subject,
        htmlContent,
        textContent,
        variables: ['first_name', 'last_name', 'company', 'email'],
      });
    }

    setEditorModalOpen(false);
  };

  const renderPreviewHtml = (html: string) => {
    return html
      .replace(/{{first_name}}/g, 'أحمد')
      .replace(/{{last_name}}/g, 'المنصوري')
      .replace(/{{company}}/g, 'شركة الابتكار الرقمي')
      .replace(/{{email}}/g, 'ahmed@innovation.sa');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            قوالب الرسائل البريدية ونماذج التنويع
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            صياغة نماذج بريد إلكتروني تفاعلية مع وسوم التخصيص التلقائي (Merge Tags).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إنشاء قالب جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {tpl.title}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenPreview(tpl)}
                    title="معاينة القالب"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateTemplate(tpl.id)}
                    title="تكرار / نسخ"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    title="تعديل"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف القالب "${tpl.title}"؟`)) {
                        deleteTemplate(tpl.id);
                      }
                    }}
                    title="حذف"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">عنوان الموضوع (Subject)</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                  {tpl.subject}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-500 line-clamp-3 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded border border-slate-100 dark:border-slate-850 font-sans leading-relaxed">
                {tpl.textContent || tpl.htmlContent.replace(/<[^>]*>?/gm, '')}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {tpl.variables?.join(' · ') || 'first_name'}
              </span>
              <button
                onClick={() => handleOpenPreview(tpl)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                معاينة العرض ←
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة المحرر */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditorModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? 'تعديل قالب الرسالة' : 'إنشاء قالب رسالة جديد'}
              </h2>
              <button onClick={() => setEditorModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم القالب
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: رسالة التعريف بالخدمات، متابعة العروض"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الموضوع في البريد (Subject)
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="استفسار مهم لـ {{first_name}} بخصوص {{company}}"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* شريط وسوم الدمج */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  انقر لإدراج وسم التخصيص في النص:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariables.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      title={v.desc}
                      className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                      dir="ltr"
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  محتوى الرسالة بتنسيق HTML
                </label>
                <textarea
                  rows={8}
                  required
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  النص البسيط البديل (Plain-text)
                </label>
                <textarea
                  rows={3}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="نص احتياطي لمنع برامج البريد القديمة من إظهار أخطاء التنسيق"
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  حفظ القالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة المعاينة */}
      {previewModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPreviewModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  معاينة القالب: {selectedTemplate.title}
                </h2>
                <span className="text-xs text-slate-500">مع بيانات تجريبية للمستلم (أحمد المنصوري، شركة الابتكار)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden p-0.5">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1 rounded ${previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1 rounded ${previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => setPreviewModalOpen(false)} className="text-slate-400">✕</button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                <div>
                  <span className="text-slate-400 font-medium">المستلم: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200" dir="ltr">أحمد المنصوري &lt;ahmed@innovation.sa&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">الموضوع: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {renderPreviewHtml(selectedTemplate.subject)}
                  </span>
                </div>
              </div>

              <div className={`mx-auto transition-all ${previewMode === 'mobile' ? 'max-w-xs border border-slate-300 dark:border-slate-700 rounded-xl p-3' : 'w-full'}`}>
                <div
                  className="bg-white text-slate-900 p-4 rounded-lg border border-slate-200 shadow-xs min-h-[160px] text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: renderPreviewHtml(selectedTemplate.htmlContent),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
