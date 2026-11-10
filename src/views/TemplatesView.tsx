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
  Code,
  Sparkles,
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
    { tag: '{{first_name}}', desc: 'Recipient First Name (e.g. Sarah)' },
    { tag: '{{last_name}}', desc: 'Recipient Last Name (e.g. Connor)' },
    { tag: '{{email}}', desc: 'Recipient Email Address' },
    { tag: '{{company}}', desc: 'Company or Org Name' },
  ];

  const handleOpenCreate = () => {
    setIsEditing(false);
    setActiveTemplateId(null);
    setTitle('');
    setSubject('');
    setHtmlContent('<p>Hi {{first_name}},</p>\n<p>Write your message here...</p>\n<p>Best regards,<br>Your Name</p>');
    setTextContent('Hi {{first_name}},\n\nWrite your message here...\n\nBest,\nYour Name');
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

  // Render preview with sample tags replaced
  const renderPreviewHtml = (html: string) => {
    return html
      .replace(/{{first_name}}/g, 'Sarah')
      .replace(/{{last_name}}/g, 'Connor')
      .replace(/{{company}}/g, 'Cyberdyne Systems')
      .replace(/{{email}}/g, 'sarah.connor@cyberdyne.com');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reusable Email Templates &amp; Variations
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Build responsive HTML &amp; text message variations with dynamic recipient merge tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
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
                    title="Preview"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateTemplate(tpl.id)}
                    title="Duplicate"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    title="Edit"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete template "${tpl.title}"?`)) {
                        deleteTemplate(tpl.id);
                      }
                    }}
                    title="Delete"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Subject Line</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                  {tpl.subject}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-500 line-clamp-3 font-mono text-[11px] bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded border border-slate-100 dark:border-slate-850">
                {tpl.textContent || tpl.htmlContent.replace(/<[^>]*>?/gm, '')}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                Variables: {tpl.variables?.join(', ') || 'first_name'}
              </span>
              <button
                onClick={() => handleOpenPreview(tpl)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Preview Email →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditorModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Template' : 'Create Message Template'}
              </h2>
              <button onClick={() => setEditorModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Executive Outreach Variation A"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Quick question for {{first_name}} at {{company}}"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Merge Tags Strip */}
              <div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                  Click to insert personalization variable:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariables.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      title={v.desc}
                      className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                    >
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  HTML Body Content
                </label>
                <textarea
                  rows={8}
                  required
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Plain-Text Alternative (Optional)
                </label>
                <textarea
                  rows={4}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Plain-text fallback for minimalist email clients"
                  className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPreviewModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTemplate.title}
                </h2>
                <span className="text-xs text-slate-500">Rendered with sample contact data (Sarah Connor, Cyberdyne)</span>
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
                  <span className="text-slate-400 font-medium">To: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">Sarah Connor &lt;sarah.connor@cyberdyne.com&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Subject: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
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
