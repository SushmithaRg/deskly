import React, { useState, useRef, useEffect } from 'react';
import { DocumentItem, UserProfile } from '../types';
import { api } from '../api/client';
import {
  FileText,
  Lock,
  Download,
  Folder,
  Search,
  Shield,
  Upload,
  FileCheck,
  Eye,
  Plus,
  X
} from 'lucide-react';

interface Props {
  documents: DocumentItem[];
  activeUser: UserProfile;
  onUploadDocument?: (doc: DocumentItem) => void;
}

export const DocumentVault: React.FC<Props> = ({
  documents: initialDocuments,
  activeUser,
  onUploadDocument
}) => {
  const [docList, setDocList] = useState<DocumentItem[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => { setDocList(initialDocuments); }, [initialDocuments]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // File Upload Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Personal' | 'Company Policies' | 'Project Assets'>('Personal');
  const [isConfidential, setIsConfidential] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const categories = ['ALL', 'Personal', 'Company Policies', 'Project Assets'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadError('');
    setUploading(true);

    try {
      const res = await api.documents.upload(selectedFile, uploadTitle || selectedFile.name, uploadCategory, isConfidential);
      const doc = res.data;
      const adapted: DocumentItem = {
        id: doc.id,
        title: doc.title,
        category: doc.category as DocumentItem['category'],
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: (doc.fileType || 'pdf') as DocumentItem['fileType'],
        isConfidential: doc.isConfidential,
        uploadedById: doc.uploadedById,
        uploadedBy: doc.uploadedBy?.fullName || activeUser.fullName,
        uploadedAt: doc.createdAt || new Date().toISOString().split('T')[0],
        realDataUrl: `http://localhost:5000${doc.fileUrl}`
      };
      setDocList(prev => [adapted, ...prev]);
      if (onUploadDocument) onUploadDocument(adapted);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Make sure the backend server is running.');
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setUploadTitle('');
      if (!uploadError) setShowUploadModal(false);
    }
  };

  // Strict RBAC filtering for Document Vault:
  // - Employees see: Company Policies + Projects + ONLY their own personal documents
  // - Managers see: All documents across teams
  const accessibleDocs = docList.filter(doc => {
    if (activeUser.role === 'EMPLOYEE') {
      if (doc.category === 'Personal' && doc.uploadedById !== activeUser.id && doc.uploadedBy !== activeUser.fullName) {
        return false; // Hide other employees' personal paystubs/IDs
      }
    }
    return true;
  });

  const filteredDocs = accessibleDocs.filter(doc => {
    const matchesCat = activeCategory === 'ALL' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Secure Enterprise Document Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeUser.role === 'EMPLOYEE'
              ? 'Employee View: Access company policies, project assets & your personal confidential files'
              : 'Manager View: Enterprise access to project assets, policies & compliance files'}
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Real Document</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat === 'ALL' ? '📂 All Files' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Document File Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4 relative group"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-xl border border-indigo-800/40">
                <FileText className="w-6 h-6" />
              </div>

              {doc.isConfidential ? (
                <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Confidential</span>
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                {doc.category}
              </span>
              <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {doc.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500 block">File Size</span>
                <span className="font-mono text-slate-300 font-semibold">{doc.fileSize}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Uploaded</span>
                <span className="text-slate-300">{doc.uploadedAt}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">By {doc.uploadedBy}</span>

              <a
                href={doc.realDataUrl || '#'}
                download={doc.title}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Real File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Upload Real Document</span>
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  required
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Tax Form or Architecture Specs"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Personal">Personal (Paystubs, Certs, Tax IDs)</option>
                  <option value="Company Policies">Company Policies</option>
                  <option value="Project Assets">Project Assets</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={isConfidential}
                  onChange={e => setIsConfidential(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="confidentialCheck" className="text-slate-300 font-medium cursor-pointer">
                  Mark as Confidential Document (Restricted Visibility)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow"
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
