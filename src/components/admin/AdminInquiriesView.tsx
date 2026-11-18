import { useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Inbox,
  Mail,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  type AdminInquiryRecord,
  type InquiryStatus,
} from '../../lib/firestoreService';
import { ConfirmDialog } from '../ConfirmDialog';

type StatusFilter = 'all' | InquiryStatus;

interface AdminInquiriesViewProps {
  inquiries: AdminInquiryRecord[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpdateStatus: (inquiry: AdminInquiryRecord, nextStatus: InquiryStatus) => Promise<void>;
  onDeleteInquiry: (inquiry: AdminInquiryRecord) => Promise<void>;
}

function formatDateTime(date: Date | null): string {
  if (!date) return 'Pending timestamp';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function AdminInquiriesView({
  inquiries,
  loading,
  error,
  onRetry,
  onUpdateStatus,
  onDeleteInquiry,
}: AdminInquiriesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminInquiryRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const selectedInquiry = useMemo(
    () => inquiries.find((i) => i.id === selectedInquiryId) ?? null,
    [inquiries, selectedInquiryId],
  );

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.projectType.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [inquiries, searchQuery, statusFilter]);

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === 'new').length,
      reviewed: inquiries.filter((i) => i.status === 'reviewed').length,
      archived: inquiries.filter((i) => i.status === 'archived').length,
    }),
    [inquiries],
  );

  const handleStatusChange = async (
    inquiry: AdminInquiryRecord,
    nextStatus: InquiryStatus,
  ) => {
    if (inquiry.status === 'archived' || inquiry.status === nextStatus) return;
    setUpdatingId(inquiry.id);
    try {
      await onUpdateStatus(inquiry, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const deletedId = pendingDelete.id;
      await onDeleteInquiry(pendingDelete);
      if (selectedInquiryId === deletedId) {
        setSelectedInquiryId(null);
      }
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const statusTone = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return 'text-[#e5a93c]';
      case 'reviewed':
        return 'text-emerald-400';
      case 'archived':
        return 'text-[#71717a]';
    }
  };

  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-tabular text-xs tracking-[0.2em] text-[#e5a93c]">
            CLIENT INTAKE PIPELINE
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#f4f4f0]">
            Project Inquiries
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a1aa]">
            Review client briefs submitted through the contact intake form.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="inline-flex min-h-[40px] items-center border border-white/15 px-4 py-2 font-mono-tabular text-xs tracking-[0.12em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          {loading ? 'SYNCING...' : 'REFRESH INQUIRIES'}
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, email, or project..."
            aria-label="Search inquiries"
            className="w-full border border-white/15 bg-[#111114] py-2.5 pr-4 pl-10 text-sm text-[#f4f4f0] placeholder:text-[#71717a] focus:border-[#e5a93c] focus:outline-none"
          />
        </div>

        <div
          role="tablist"
          aria-label="Filter inquiries by status"
          className="inline-flex flex-wrap border border-white/10 bg-[#111114] p-1"
        >
          {(
            [
              { id: 'all', label: `All (${counts.all})` },
              { id: 'new', label: `New (${counts.new})` },
              { id: 'reviewed', label: `Reviewed (${counts.reviewed})` },
              { id: 'archived', label: `Archived (${counts.archived})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[34px] px-3 py-1.5 font-mono-tabular text-xs tracking-[0.1em] transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#e5a93c] text-[#08080a] font-semibold'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-4 border border-rose-400/40 bg-rose-950/30 p-4 text-xs text-rose-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="border border-rose-300/40 px-3 py-1.5 font-mono-tabular text-[11px] hover:bg-rose-400/20 cursor-pointer"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Loading / Empty / Split View */}
      {loading ? (
        <div className="border border-white/10 bg-[#111114] divide-y divide-white/10">
          {[1, 2, 3].map((row) => (
            <div key={row} className="p-5 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-48 animate-pulse bg-white/10" />
                <div className="h-3 w-72 animate-pulse bg-white/5" />
              </div>
              <div className="h-8 w-24 animate-pulse bg-white/10" />
            </div>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="border border-white/10 bg-[#111114] px-6 py-16 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[#e5a93c]/70" />
          <h2 className="mt-4 font-display text-xl font-semibold text-[#f4f4f0]">
            No inquiries received yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#a1a1aa]">
            Submissions from the public Start a Project intake form will appear here
            for review.
          </p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="border border-white/10 bg-[#111114] px-6 py-14 text-center">
          <p className="text-sm text-[#a1a1aa]">
            No inquiries match your current search or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-4 border border-white/15 px-4 py-2 font-mono-tabular text-xs text-[#f4f4f0] hover:border-[#e5a93c] cursor-pointer"
          >
            CLEAR FILTERS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* Inquiry List */}
          <div
            className={`border border-white/10 bg-[#111114] divide-y divide-white/10 ${
              selectedInquiry ? 'lg:col-span-6' : 'lg:col-span-12'
            }`}
          >
            {filteredInquiries.map((inquiry) => {
              const isSelected = selectedInquiry?.id === inquiry.id;
              return (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiryId(inquiry.id)}
                  className={`cursor-pointer p-5 transition-colors ${
                    isSelected
                      ? 'bg-[#e5a93c]/[0.07]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[11px]">
                        <span className={`font-semibold uppercase ${statusTone(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        <span className="text-[#52525b]" aria-hidden="true">
                          /
                        </span>
                        <span className="text-[#a1a1aa]">{inquiry.projectType}</span>
                        <span className="text-[#52525b]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[#71717a]">
                          {formatDateTime(inquiry.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-1.5 font-display text-lg font-semibold text-[#f4f4f0]">
                        {inquiry.name}
                        {inquiry.company ? (
                          <span className="font-normal text-[#a1a1aa]">
                            {' '}
                            — {inquiry.company}
                          </span>
                        ) : null}
                      </h2>

                      <p className="mt-0.5 font-mono-tabular text-xs text-[#a1a1aa] break-all">
                        {inquiry.email}
                      </p>

                      {!selectedInquiry && (
                        <p className="mt-3 line-clamp-2 text-sm text-[#d4d4d8]">
                          {inquiry.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-tabular text-xs text-[#a1a1aa]">
                        {inquiry.budget}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiryId(inquiry.id);
                        }}
                        className="border border-white/15 bg-[#08080a] px-3 py-1.5 font-mono-tabular text-[11px] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] cursor-pointer"
                      >
                        {isSelected ? 'VIEWING' : 'DETAILS'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Inspector Panel */}
          {selectedInquiry && (
            <aside
              aria-label="Inquiry detail inspector"
              className="lg:col-span-6 border border-white/15 bg-[#111114] p-6 sm:p-7 flex flex-col gap-6 lg:sticky lg:top-24"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div className="min-w-0">
                  <p className="font-mono-tabular text-[11px] tracking-[0.16em] text-[#e5a93c]">
                    INQUIRY DETAILS · {selectedInquiry.status.toUpperCase()}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-[#f4f4f0]">
                    {selectedInquiry.name}
                  </h2>
                  <p className="mt-0.5 font-mono-tabular text-xs text-[#71717a] break-all">
                    ID: {selectedInquiry.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInquiryId(null)}
                  aria-label="Close inquiry details"
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    EMAIL
                  </dt>
                  <dd className="mt-1 text-sm text-[#f4f4f0] break-all">
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#e5a93c] transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#e5a93c]" />
                      <span>{selectedInquiry.email}</span>
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    COMPANY / BRAND
                  </dt>
                  <dd className="mt-1 text-sm text-[#f4f4f0]">
                    {selectedInquiry.company || 'Not specified'}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    PROJECT TYPE
                  </dt>
                  <dd className="mt-1 text-sm text-[#f4f4f0]">
                    {selectedInquiry.projectType}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    BUDGET
                  </dt>
                  <dd className="mt-1 font-mono-tabular text-sm text-[#f4f4f0]">
                    {selectedInquiry.budget}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    TIMELINE
                  </dt>
                  <dd className="mt-1 text-sm text-[#f4f4f0]">
                    {selectedInquiry.timeline}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                    RECEIVED
                  </dt>
                  <dd className="mt-1 font-mono-tabular text-xs text-[#d4d4d8]">
                    {formatDateTime(selectedInquiry.createdAt)}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-white/10 pt-4">
                <span className="block font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                  PROJECT MESSAGE
                </span>
                <p className="mt-2 whitespace-pre-wrap border border-white/10 bg-[#08080a] p-4 text-sm leading-relaxed text-[#d4d4d8]">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Status Controls aligned with Firestore Security Rules */}
              <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                <span className="font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                  INQUIRY STATUS
                </span>

                {selectedInquiry.status === 'archived' ? (
                  <p className="border border-white/10 bg-[#08080a] px-3.5 py-2.5 font-mono-tabular text-[11px] text-[#a1a1aa]">
                    This inquiry is archived. Per Firestore security rules, archived
                    inquiries are locked against status changes.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        updatingId === selectedInquiry.id ||
                        selectedInquiry.status === 'reviewed'
                      }
                      onClick={() =>
                        void handleStatusChange(selectedInquiry, 'reviewed')
                      }
                      className={`inline-flex min-h-[38px] items-center gap-1.5 border px-3.5 py-1.5 font-mono-tabular text-xs tracking-[0.1em] transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedInquiry.status === 'reviewed'
                          ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/15 bg-[#08080a] text-[#f4f4f0] hover:border-emerald-400/50 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>MARK REVIEWED</span>
                    </button>

                    {selectedInquiry.status !== 'new' && (
                      <button
                        type="button"
                        disabled={updatingId === selectedInquiry.id}
                        onClick={() =>
                          void handleStatusChange(selectedInquiry, 'new')
                        }
                        className="inline-flex min-h-[38px] items-center border border-white/15 bg-[#08080a] px-3.5 py-1.5 font-mono-tabular text-xs tracking-[0.1em] text-[#d4d4d8] hover:border-[#e5a93c] hover:text-[#e5a93c] disabled:opacity-50 cursor-pointer"
                      >
                        REOPEN AS NEW
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={updatingId === selectedInquiry.id}
                      onClick={() =>
                        void handleStatusChange(selectedInquiry, 'archived')
                      }
                      className="inline-flex min-h-[38px] items-center gap-1.5 border border-white/15 bg-[#08080a] px-3.5 py-1.5 font-mono-tabular text-xs tracking-[0.1em] text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] disabled:opacity-50 cursor-pointer"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>ARCHIVE</span>
                    </button>
                  </div>
                )}

                <div className="mt-2 flex justify-end border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setPendingDelete(selectedInquiry)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 border border-rose-400/30 bg-rose-950/20 px-4 py-1.5 font-mono-tabular text-xs tracking-[0.1em] text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>DELETE INQUIRY</span>
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={
          pendingDelete
            ? `Delete inquiry from ${pendingDelete.name}?`
            : 'Delete inquiry?'
        }
        description="This permanently deletes the client inquiry record from Firestore and cannot be recovered."
        confirmLabel="DELETE INQUIRY"
        busy={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
