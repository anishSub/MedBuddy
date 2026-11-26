"use client";

import { useState, useEffect } from "react";
import { PatientShell } from "@/components/patient/PatientShell";
import { DocumentThumb } from "@/components/patient/DocumentThumb";
import { Icon } from "@/components/common/Icon";
import { useAuth } from "@/context/AuthContext";
import { patientService } from "@/lib/supabase/services";
import type { DocumentItem } from "@/types";

type DocumentKind = "rx" | "lab" | "xray";
type DocumentType = "Prescription" | "Lab Report" | "X-Ray";

// Fallback mock data shown when DB has no records yet
const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    type: "Prescription",
    date: "24 Jun 2024",
    title: "Cardiology Follow-up",
    doctor: "Dr. Sushil Adhikari",
    note: "Continue current medication; review in 4 weeks.",
    kind: "rx",
  },
  {
    type: "Lab Report",
    date: "21 Jun 2024",
    title: "HbA1c & Glucose Panel",
    doctor: "Norvic Laboratory",
    note: "HbA1c improved to 6.8%. Maintain diet plan.",
    kind: "lab",
  },
  {
    type: "Prescription",
    date: "06 May 2024",
    title: "Diabetes Review",
    doctor: "Dr. Anjali Karki",
    note: "Metformin dose adjusted to twice daily.",
    kind: "rx",
  },
  {
    type: "X-Ray",
    date: "18 Apr 2024",
    title: "Chest X-Ray — PA View",
    doctor: "Patan Hospital",
    note: "No active pulmonary lesion identified.",
    kind: "xray",
  },
  {
    type: "Lab Report",
    date: "14 Apr 2024",
    title: "Lipid Profile",
    doctor: "National Path Lab",
    note: "LDL slightly elevated; repeat after 3 months.",
    kind: "lab",
  },
  {
    type: "Prescription",
    date: "02 Mar 2024",
    title: "General Medicine Visit",
    doctor: "Dr. Bimal Shrestha",
    note: "Blood pressure stable. Continue Amlodipine.",
    kind: "rx",
  },
];

const KIND_MAP: Record<DocumentType, DocumentKind> = {
  Prescription: "rx",
  "Lab Report": "lab",
  "X-Ray": "xray",
};

const MEDICAL_IMAGES: { src: string; alt: string }[] = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Medical_prescription_issued_by_Bimaristan_Qalawun.jpg",
    alt: "Medical prescription",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Picking_up_prescriptions_at_Ochsner_Medical_Center_11_May_2020_-_02.jpg",
    alt: "Prescription pickup at pharmacy",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/77/US_Navy_040616-N-4565G-004_Advanced_laboratory_technician_Hospital_Corpsman_2nd_Class_John_Zettlemoyer_views_a_blood_sample_through_a_forensics_microscope.jpg",
    alt: "Medical laboratory blood sample",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Laboratory_Airmen_ensure_healthy_force_150113-F-FV476-030.jpg",
    alt: "Laboratory blood sample",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/d/d4/A_chest_X-ray.jpg",
    alt: "Chest X-ray",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/60/Xray-40y-male-chest-with-cvc.jpg",
    alt: "Chest X-ray with line",
  },
];

function mapRecordToDoc(r: {
  type: string;
  record_date: string;
  title: string;
  doctor: string;
  note?: string | null;
  kind: string;
}): DocumentItem {
  return {
    type: r.type as DocumentType,
    date: r.record_date,
    title: r.title,
    doctor: r.doctor,
    note: r.note ?? "",
    kind: (r.kind as DocumentKind) || KIND_MAP[r.type as DocumentType] || "rx",
  };
}

function getProviderInitials(name: string) {
  return name
    .replace(/^(Dr\.|Doctor)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function RecordsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [filter, setFilter] = useState("All");

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Prescription" as DocumentType,
    doctor: "",
    note: "",
  });

  useEffect(() => {
    if (!user) return;
    patientService
      .getMedicalRecords(user.id)
      .then((rows) => {
        if (rows.length > 0) {
          setDocuments(rows.map(mapRecordToDoc));
          setUsingMock(false);
        } else {
          // DB has no records yet — show hardcoded fallback
          setDocuments(MOCK_DOCUMENTS);
          setUsingMock(true);
        }
      })
      .catch(() => {
        setDocuments(MOCK_DOCUMENTS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const shown = documents.filter((doc) => {
    if (filter === "All") return true;
    if (filter === "Prescriptions") return doc.type === "Prescription";
    if (filter === "Lab Reports") return doc.type === "Lab Report";
    if (filter === "X-Rays") return doc.type === "X-Ray";
    return true;
  });

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.title || !form.doctor) return;
    setUploading(true);
    try {
      const newRecord = await patientService.addMedicalRecord({
        patient_id: user.id,
        title: form.title,
        type: form.type,
        kind: KIND_MAP[form.type],
        doctor: form.doctor,
        note: form.note,
      });
      // Prepend newly saved record to list (always real from here on)
      setDocuments((prev) => [
        mapRecordToDoc(newRecord as Parameters<typeof mapRecordToDoc>[0]),
        ...prev,
      ]);
      setUsingMock(false);
      setShowUpload(false);
      setForm({ title: "", type: "Prescription", doctor: "", note: "" });
    } catch {
      alert("Could not save record. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <PatientShell title="Medical Records" eyebrow="Documents & reports" compact>
      <main className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Tab bar + upload button */}
        <div className="flex flex-wrap items-end justify-between border-b border-[#E2E8F0] gap-3">
          <div className="flex min-w-0 flex-nowrap gap-3 pb-1 sm:gap-7 sm:pb-0">
            {["All", "Prescriptions", "Lab Reports", "X-Rays"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`relative h-10 sm:h-11 text-[12px] font-semibold shrink-0 transition ${
                  filter === item
                    ? "text-[#0D9488] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#0D9488]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="mb-2 sm:mb-3 flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[11px] font-semibold text-white transition hover:bg-[#0F766E] shadow-xs shrink-0"
          >
            <Icon name="plus" size={14} />
            Upload document
          </button>
        </div>

        {/* Count bar */}
        <div className="mt-4 sm:mt-5 flex items-center justify-between">
          <p className="text-[12px] text-[#64748B]">
            {loading ? (
              "Loading…"
            ) : (
              <>
                <span className="font-semibold text-[#334155]">
                  {shown.length} records
                </span>
                {" for "}
                {user?.full_name ?? "you"}
                {usingMock && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">
                    (demo data)
                  </span>
                )}
              </>
            )}
          </p>
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B] hover:text-[#0F172A]">
            Newest first <Icon name="chevron" size={14} />
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-10 text-center text-[13px] text-[#94A3B8]">
            Loading records…
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-start justify-start gap-4 pb-6 sm:gap-5">
            {shown.map((doc, i) => (
              <article
                key={`${doc.title}-${i}`}
                className="patient-card patient-card-interactive group grid h-[310px] w-[270px] shrink-0 grid-rows-[120px_1fr] overflow-hidden"
              >
                <div className="overflow-hidden border-b border-[#E2E8F0] bg-[#F1F5F9] p-3">
                  <DocumentThumb
                    key={`${doc.title}-${i}`}
                    kind={doc.kind}
                    illustrated
                    src={MEDICAL_IMAGES[i % MEDICAL_IMAGES.length].src}
                    alt={MEDICAL_IMAGES[i % MEDICAL_IMAGES.length].alt}
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
                        doc.type === "Lab Report"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : doc.type === "X-Ray"
                            ? "bg-[#F1F5F9] text-[#475569]"
                            : "bg-[#E6F4F2] text-[#0D9488]"
                      }`}
                    >
                      {doc.type}
                    </span>
                    <span className="text-[10px] tabular-nums text-[#94A3B8]">
                      {doc.date}
                    </span>
                  </div>
                  <h3 className="mt-2.5 line-clamp-2 min-h-[42px] text-sm font-semibold tracking-[-0.01em] text-[#0F172A]">
                    {doc.title}
                  </h3>
                  <div className="mt-2 flex min-w-0 items-center gap-2">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E6F4F2] text-[10px] font-semibold text-[#0D9488]"
                      aria-hidden="true"
                    >
                      {getProviderInitials(doc.doctor)}
                    </span>
                    <p className="truncate text-xs font-medium text-[#64748B]">
                      {doc.doctor}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
                    {doc.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[#0F172A]">
                Add Medical Record
              </h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Blood Sugar Panel"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as DocumentType,
                    }))
                  }
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  <option>Prescription</option>
                  <option>Lab Report</option>
                  <option>X-Ray</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Doctor / Facility
                </label>
                <input
                  required
                  value={form.doctor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, doctor: e.target.value }))
                  }
                  placeholder="e.g. Dr. Anjali Karki"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">
                  Note{" "}
                  <span className="font-normal text-[#94A3B8]">(optional)</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  rows={2}
                  placeholder="Short summary…"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="mt-1 w-full rounded-md bg-[#0D9488] py-2.5 text-[13px] font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60 transition"
              >
                {uploading ? "Saving…" : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PatientShell>
  );
}
