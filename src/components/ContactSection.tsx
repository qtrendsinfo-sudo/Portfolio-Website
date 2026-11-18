import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInView } from '../hooks/useInView';
import { mapFirebaseErrorToMessage } from '../lib/firebaseErrors';
import {
  submitProjectInquiry,
  type InquirySubmissionInput,
} from '../lib/firestoreService';

interface ContactSectionProps {
  preselectedProjectType?: string;
}

type InquiryProjectType = InquirySubmissionInput['projectType'];

interface InquiryFormState {
  name: string;
  email: string;
  company: string;
  projectType: InquiryProjectType;
  budget: string;
  timeline: string;
  message: string;
}

type FormField = keyof InquiryFormState;
type FormErrors = Partial<Record<FormField, string>>;
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const PROJECT_TYPES: InquiryProjectType[] = [
  'Mobile Application',
  'Web Application',
  'SaaS Product',
  'UI/UX Design',
  'Digital Product',
  'Custom Software',
];

const BUDGET_RANGES = [
  'Under $10k',
  '$10k – $25k',
  '$25k – $50k',
  '$50k – $100k',
  '$100k+',
  'To be discussed',
];

const TIMELINES = [
  'Immediate (2–4 weeks)',
  '1 – 2 Months',
  '3 – 6 Months',
  'Flexible / Exploratory',
];

function resolveProjectType(value?: string): InquiryProjectType {
  if (value && PROJECT_TYPES.includes(value as InquiryProjectType)) {
    return value as InquiryProjectType;
  }
  return 'Mobile Application';
}

export function ContactSection({ preselectedProjectType }: ContactSectionProps) {
  const { ref, visible } = useInView(0.08);
  const { user, isConfigured } = useAuth();
  const [form, setForm] = useState<InquiryFormState>({
    name: '',
    email: '',
    company: '',
    projectType: resolveProjectType(preselectedProjectType),
    budget: '$25k – $50k',
    timeline: '1 – 2 Months',
    message: '',
  });

  const [focusedField, setFocusedField] = useState<FormField | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRecord, setSubmittedRecord] = useState<InquiryFormState | null>(
    null,
  );
  const [submittedDocId, setSubmittedDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (preselectedProjectType) {
      setForm((prev) => ({
        ...prev,
        projectType: resolveProjectType(preselectedProjectType),
      }));
      if (status === 'success') {
        setStatus('idle');
        setSubmittedRecord(null);
        setSubmittedDocId(null);
      }
    }
  }, [preselectedProjectType, status]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.projectType) {
      nextErrors.projectType = 'Please choose a project type.';
    }
    if (!form.message.trim() || form.message.trim().length < 15) {
      nextErrors.message = 'Please share a brief overview (at least 15 characters).';
    }
    return nextErrors;
  };

  const handleChange = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isConfigured) {
      setStatus('error');
      setErrorMessage(
        'Project inquiry persistence is unavailable because Firebase configuration is missing.',
      );
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const snapshot = { ...form };
      const docId = await submitProjectInquiry(snapshot);
      setSubmittedRecord(snapshot);
      setSubmittedDocId(docId);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(mapFirebaseErrorToMessage(err, 'firestore'));
    }
  };

  const handleCopyBrief = async () => {
    if (!submittedRecord) return;
    const summaryText = [
      'R & L STUDIO — PROJECT BRIEF',
      ...(submittedDocId ? [`Reference ID: ${submittedDocId}`] : []),
      `Name: ${submittedRecord.name}`,
      `Email: ${submittedRecord.email}`,
      `Company / Brand: ${submittedRecord.company || 'Not specified'}`,
      `Project Type: ${submittedRecord.projectType}`,
      `Budget: ${submittedRecord.budget}`,
      `Timeline: ${submittedRecord.timeline}`,
      `Message: ${submittedRecord.message}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus('error');
      setErrorMessage('Clipboard access was denied by your browser.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setSubmittedRecord(null);
    setSubmittedDocId(null);
    setCopied(false);
    setForm({
      name: user?.displayName || '',
      email: user?.email || '',
      company: '',
      projectType: 'Mobile Application',
      budget: '$25k – $50k',
      timeline: '1 – 2 Months',
      message: '',
    });
    setErrors({});
  };

  const fieldLabelClass = (field: FormField) =>
    `block font-mono-tabular text-[11px] tracking-[0.16em] transition-colors ${
      errors[field]
        ? 'text-rose-400'
        : focusedField === field
          ? 'text-[#e5a93c]'
          : 'text-[#a1a1aa]'
    }`;

  const fieldInputClass = (field: FormField) =>
    `mt-2 w-full border bg-[#08080a] px-4 py-3 text-sm text-[#f4f4f0] placeholder:text-[#52525b] transition-colors focus:outline-none ${
      errors[field]
        ? 'border-rose-400/70'
        : focusedField === field
          ? 'border-[#e5a93c]'
          : 'border-white/15 hover:border-white/25'
    }`;

  const errorCount = Object.keys(errors).length;

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-heading"
      className={`relative border-t border-white/10 bg-[#0b0b0e] py-20 sm:py-28 lg:py-36 reveal-section ${
        visible ? 'is-visible' : ''
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 gap-10 sm:gap-14 lg:grid-cols-12">
          {/* Editorial CTA Lead Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="font-mono-tabular text-xs tracking-[0.22em] text-[#e5a93c]">
                05 · START A PROJECT
              </p>
              <h2
                id="contact-heading"
                className="mt-4 font-display text-[clamp(1.9rem,4.5vw,4rem)] font-semibold leading-[1.03] tracking-[-0.028em] text-[#f4f4f0]"
                style={{ textWrap: 'balance' }}
              >
                HAVE AN IDEA? LET&apos;S MAKE IT REAL.
              </h2>
              <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-base leading-relaxed text-[#a1a1aa]">
                Tell us what you are building, where you are starting from, and the
                timeline you are aiming for. We review every project brief directly.
              </p>
            </div>

            <div className="mt-10 sm:mt-12 border-t border-white/10 pt-6 sm:pt-8">
              <span className="block font-mono-tabular text-[11px] tracking-[0.18em] text-[#71717a]">
                INTAKE WORKFLOW · DIRECT FIRESTORE PERSISTENCE
              </span>
              <p className="mt-2 text-sm leading-relaxed text-[#d4d4d8]">
                Submitted briefs are validated and recorded directly into R &amp; L
                Studio&apos;s project intake pipeline with an instant reference ID.
              </p>
            </div>
          </div>

          {/* Interactive Project Inquiry Interface */}
          <div className="lg:col-span-7">
            <div className="border border-white/10 bg-[#111114] p-5 sm:p-10">
              {status === 'error' && errorMessage && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 border border-rose-400/40 bg-rose-950/30 p-4 text-sm text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {status === 'success' && submittedRecord ? (
                <div role="status" className="flex flex-col gap-6 py-4 sm:py-6">
                  <div className="flex items-center gap-3 text-[#e5a93c]">
                    <CheckCircle2 className="h-6 w-6 shrink-0" />
                    <span className="font-mono-tabular text-xs tracking-[0.18em]">
                      BRIEF RECORDED IN STUDIO PIPELINE
                    </span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#f4f4f0]">
                    Thank you, {submittedRecord.name}.
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-[#d4d4d8]">
                    Your project brief for{' '}
                    <span className="font-medium text-[#f4f4f0]">
                      {submittedRecord.projectType}
                    </span>{' '}
                    has been saved to Firestore. R &amp; L Studio will review your scope
                    and reply at{' '}
                    <span className="font-medium text-[#f4f4f0]">
                      {submittedRecord.email}
                    </span>
                    .
                  </p>

                  {submittedDocId && (
                    <div className="border border-white/10 bg-[#08080a] px-4 py-3">
                      <span className="block font-mono-tabular text-[10px] tracking-[0.16em] text-[#71717a]">
                        INQUIRY REFERENCE ID
                      </span>
                      <span className="mt-1 block font-mono-tabular text-xs text-[#e5a93c] break-all">
                        {submittedDocId}
                      </span>
                    </div>
                  )}

                  <dl className="grid grid-cols-1 gap-4 border-t border-b border-white/10 py-5 sm:grid-cols-2">
                    <div>
                      <dt className="font-mono-tabular text-[11px] text-[#71717a]">
                        EMAIL
                      </dt>
                      <dd className="mt-1 text-sm text-[#f4f4f0] break-all">
                        {submittedRecord.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] text-[#71717a]">
                        COMPANY / BRAND
                      </dt>
                      <dd className="mt-1 text-sm text-[#f4f4f0]">
                        {submittedRecord.company || 'Independent / Not specified'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] text-[#71717a]">
                        BUDGET
                      </dt>
                      <dd className="mt-1 text-sm text-[#f4f4f0]">
                        {submittedRecord.budget}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono-tabular text-[11px] text-[#71717a]">
                        TIMELINE
                      </dt>
                      <dd className="mt-1 text-sm text-[#f4f4f0]">
                        {submittedRecord.timeline}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyBrief}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#e5a93c] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#08080a] hover:bg-[#f0ba54] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>COPIED TO CLIPBOARD</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>COPY BRIEF SUMMARY</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex min-h-[44px] items-center justify-center border border-white/20 px-6 py-3 text-xs font-medium tracking-[0.14em] text-[#f4f4f0] hover:border-[#e5a93c] hover:text-[#e5a93c] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      SUBMIT ANOTHER BRIEF
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 sm:gap-6">
                  {errorCount > 0 && (
                    <div
                      role="alert"
                      className="flex items-center gap-2.5 border border-rose-400/40 bg-rose-950/25 px-4 py-3 text-xs text-rose-200"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>
                        Please review {errorCount} highlighted{' '}
                        {errorCount === 1 ? 'field' : 'fields'} before continuing.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className={fieldLabelClass('name')}>
                        NAME *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'error-name' : undefined}
                        value={form.name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Your full name"
                        className={fieldInputClass('name')}
                      />
                      {errors.name && (
                        <p id="error-name" className="mt-1.5 text-xs text-rose-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className={fieldLabelClass('email')}>
                        EMAIL *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'error-email' : undefined}
                        value={form.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="you@company.com"
                        className={fieldInputClass('email')}
                      />
                      {errors.email && (
                        <p id="error-email" className="mt-1.5 text-xs text-rose-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-company"
                        className={fieldLabelClass('company')}
                      >
                        COMPANY / BRAND
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        value={form.company}
                        onFocus={() => setFocusedField('company')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Organization or venture name"
                        className={fieldInputClass('company')}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-type"
                        className={fieldLabelClass('projectType')}
                      >
                        PROJECT TYPE *
                      </label>
                      <select
                        id="contact-type"
                        value={form.projectType}
                        onFocus={() => setFocusedField('projectType')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('projectType', e.target.value)}
                        className={fieldInputClass('projectType')}
                      >
                        {PROJECT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-budget" className={fieldLabelClass('budget')}>
                        BUDGET
                      </label>
                      <select
                        id="contact-budget"
                        value={form.budget}
                        onFocus={() => setFocusedField('budget')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('budget', e.target.value)}
                        className={fieldInputClass('budget')}
                      >
                        {BUDGET_RANGES.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-timeline"
                        className={fieldLabelClass('timeline')}
                      >
                        TIMELINE
                      </label>
                      <select
                        id="contact-timeline"
                        value={form.timeline}
                        onFocus={() => setFocusedField('timeline')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => handleChange('timeline', e.target.value)}
                        className={fieldInputClass('timeline')}
                      >
                        {TIMELINES.map((tl) => (
                          <option key={tl} value={tl}>
                            {tl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="contact-message"
                        className={fieldLabelClass('message')}
                      >
                        MESSAGE *
                      </label>
                      <span className="font-mono-tabular text-[10px] text-[#71717a]">
                        {form.message.trim().length} CHARS
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'error-message' : undefined}
                      value={form.message}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Describe the product vision, platform goals, or technical challenge..."
                      className={fieldInputClass('message')}
                    />
                    {errors.message && (
                      <p id="error-message" className="mt-1.5 text-xs text-rose-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="inline-flex min-h-[50px] w-full sm:w-auto items-center justify-center gap-2.5 bg-[#e5a93c] px-8 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#08080a] hover:bg-[#f0ba54] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {status === 'submitting' ? 'VALIDATING BRIEF...' : 'START A PROJECT'}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>

                    <span className="font-mono-tabular text-[11px] text-[#71717a]">
                      * Required fields
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
