"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  Download,
  FileText,
  Trash2,
  RotateCcw,
  Eye,
  Save,
  Printer,
  Copy,
  CheckCircle2,
} from "lucide-react";

import jsPDF from "jspdf";

type Form = {
  reference: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  upi: string;
  bank: string;
  account: string;
  ifsc: string;
  amount: string;
  transactionDate: string;
  transactionId: string;
  category: string;
  subject: string;
  body: string;
  remarks: string;
  crime: string;
  lawSection: string;
  punishment: string;
  officer: string;
  designation: string;
  organization: string;
  department: string;
  address: string;
  footer: string;
  includeBankDetails: boolean;
  includePublicInfo: boolean;
};

type Doc = Form & {
  id: string;
  savedAt: string;
};

const today = new Date().toISOString().slice(0, 10);

const PUBLIC_INFO = {
  portal: "https://cybercrime.gov.in/",
  helpline: "1930",
  emergency: "112",
};

const FIXED_SUBJECT =
  "Request for clarification regarding a reported transaction";

const FIXED_BODY = `This document records a request for clarification concerning the transaction information identified below. The recipient is requested to review the transaction details and provide any relevant explanation or supporting information through the appropriate authorized channel.

This is a case-document draft generated from information entered by the operator. It does not by itself establish guilt, liability, or a finding that any offence has occurred. Any further action should be based on verified records, applicable law, and the competent authority’s process.`;

const FIXED_CRIME =
  "Reported financial / cyber transaction requiring review";

const empty: Form = {
  reference: "",
  date: today,

  name: "",
  phone: "",
  email: "",

  upi: "",
  bank: "",
  account: "",
  ifsc: "",

  amount: "",
  transactionDate: "",
  transactionId: "",

  category: "Financial Transaction Review",

  subject: FIXED_SUBJECT,
  body: FIXED_BODY,

  remarks: "",

  crime: FIXED_CRIME,
  lawSection: "",
  punishment: "",

  officer: "Arjun Mehta",
  designation: "Case Review Officer",

  organization: "CASE REVIEW DOCUMENT",
  department: "Transaction Review & Case Documentation",

  address: "New Delhi, India",

  footer: "",

  includeBankDetails: true,
  includePublicInfo: true,
};

const LAW_PRESETS = [
  {
    label:
      "IT Act, 2000 — Section 66C: Identity theft",

    section:
      "Information Technology Act, 2000 — Section 66C",

    punishment:
      "Imprisonment up to 3 years and fine up to ₹1 lakh.",

    note:
      "Applies where the statutory elements of identity theft are established.",
  },

  {
    label:
      "IT Act, 2000 — Section 66D: Cheating by personation",

    section:
      "Information Technology Act, 2000 — Section 66D",

    punishment:
      "Imprisonment up to 3 years and fine up to ₹1 lakh.",

    note:
      "Applies where the statutory requirements concerning cheating by personation are established.",
  },

  {
    label:
      "BNS, 2023 — Section 112: Petty organised crime",

    section:
      "Bharatiya Nyaya Sanhita, 2023 — Section 112",

    punishment:
      "Imprisonment from 1 year up to 7 years and liable to fine.",

    note:
      "Applicability depends on the facts and statutory requirements.",
  },

  {
    label: "Custom / verified provision",

    section: "",

    punishment: "",

    note:
      "Enter the verified provision and statutory consequence after case review.",
  },
];

const demo: Form = {
  ...empty,

  reference: "DEMO-2026-001",

  name: "Rahul Sharma",
  phone: "9000000000",
  email: "demo@example.com",

  upi: "demo@example",

  bank: "Sample Bank",
  account: "0000000000",
  ifsc: "DEMO0000000",

  amount: "25000",
  transactionDate: today,

  transactionId: "DEMO-TXN-001",

  subject: FIXED_SUBJECT,
  body: FIXED_BODY,

  remarks: "DEMO / SAMPLE",

  crime:
    "Suspected financial transaction requiring clarification",

  lawSection: LAW_PRESETS[1].section,
  punishment: LAW_PRESETS[1].punishment,

  officer: "Arjun Mehta",
  designation: "Case Review Officer",

  organization: "CASE REVIEW DOCUMENT",

  department:
    "Transaction Review & Case Documentation",

  address: "New Delhi, India",

  includeBankDetails: true,
  includePublicInfo: true,
};

function fmtDate(v: string) {
  if (!v) return "—";

  const d = new Date(v + "T00:00:00");

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function maskAccount(v: string) {
  return v ? "•••• •••• " + v.slice(-4) : "—";
}

function replaceVars(text: string, f: Form) {
  const vars: Record<string, string> = {
    REFERENCE_NUMBER: f.reference,
    DATE: fmtDate(f.date),
    NAME: f.name,
    PHONE: f.phone,
    EMAIL: f.email,
    UPI_ID: f.upi,
    BANK_NAME: f.bank,
    ACCOUNT_NUMBER: f.account,
    IFSC: f.ifsc,
    AMOUNT: f.amount ? `₹ ${f.amount}` : "",
    TRANSACTION_DATE: fmtDate(f.transactionDate),
    TRANSACTION_ID: f.transactionId,
    CATEGORY: f.category,
    SUBJECT: f.subject,
    NOTICE_BODY: f.body,
    CRIME: f.crime,
    LAW_SECTION: f.lawSection,
    PUNISHMENT: f.punishment,
  };

  return text.replace(
    /\{\{([A-Z0-9_]+)\}\}/g,
    (_, key) => vars[key] ?? ""
  );
}

export default function NoticeGenerator() {
  const [f, setF] = useState<Form>({
    ...empty,
  });

  const [docs, setDocs] = useState<Doc[]>([]);

  const [showAccount, setShowAccount] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    try {
      setDocs(
        JSON.parse(
          localStorage.getItem(
            "notice_docs"
          ) || "[]"
        )
      );
    } catch {
      setDocs([]);
    }
  }, []);

  const update = (
    key: keyof Form,
    value: string | boolean
  ) => {
    setF(
      (current) =>
        ({
          ...current,
          [key]: value,
        }) as Form
    );
  };

  const saveDraft = () => {
    const draft: Doc = {
      ...f,

      id: crypto.randomUUID(),

      savedAt:
        new Date().toISOString(),
    };

    const next = [
      draft,
      ...docs,
    ].slice(0, 30);

    setDocs(next);

    localStorage.setItem(
      "notice_docs",
      JSON.stringify(next)
    );

    alert(
      "Draft saved locally on this device."
    );
  };

  const clear = () => {
    setF({
      ...empty,

      reference: "",

      date: new Date()
        .toISOString()
        .slice(0, 10),
    });
  };

  const loadDemo = () => {
    setF(demo);
  };

  const downloadPdf = () => {
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const left = 13;
    const right = 197;

    const contentW = right - left;

    let y = 12;

    const section = (
      title: string
    ) => {
      pdf.setFillColor(
        25,
        39,
        65
      );

      pdf.rect(
        left,
        y - 3,
        contentW,
        5.5,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.text(
        title,
        left + 2.5,
        y + 0.7
      );

      y += 7;

      pdf.setTextColor(
        25,
        39,
        65
      );
    };

    const text = (
      value: string,
      size = 7.2,
      bold = false,
      lineHeight = 3.6
    ) => {
      pdf.setFont(
        "helvetica",
        bold ? "bold" : "normal"
      );

      pdf.setFontSize(size);

      pdf.setTextColor(
        35,
        42,
        52
      );

      const lines =
        pdf.splitTextToSize(
          value,
          contentW
        );

      lines.forEach(
        (line: string) => {
          pdf.text(
            line,
            left,
            y
          );

          y += lineHeight;
        }
      );
    };

    const pair = (
      first: string,
      second: string
    ) => {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.5);

      pdf.setTextColor(
        35,
        42,
        52
      );

      pdf.text(
        first,
        left,
        y
      );

      pdf.text(
        second,
        105,
        y
      );

      y += 4.3;
    };

    /*
     * PUBLIC-REFERENCE HEADER
     */

    pdf.setTextColor(
      25,
      39,
      65
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(10.5);

    pdf.text(
      "PUBLIC-REFERENCE INFORMATION",
      left,
      y
    );

    y += 4.5;

    pdf.setFontSize(9.5);

    pdf.text(
      "Ministry of Home Affairs — Government of India",
      left,
      y
    );

    y += 4;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(6.5);

    pdf.setTextColor(80);

    pdf.text(
      "North Block, New Delhi - 110001, India",
      left,
      y
    );

    y += 4;

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(7);

    pdf.text(
      "Indian Cyber Crime Coordination Centre (I4C) — Public Reference",
      left,
      y
    );

    y += 3.5;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(6.3);

    pdf.text(
      "5th Floor, NDCC-II Building, Jai Singh Road, New Delhi - 110001",
      left,
      y
    );

    

    y += 5;

    pdf.setDrawColor(
      25,
      39,
      65
    );

    pdf.setLineWidth(0.7);

    pdf.line(
      left,
      y,
      right,
      y
    );

    y += 5;

    /*
     * DOCUMENT TITLE
     */

    pdf.setTextColor(
      25,
      39,
      65
    );

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(13);

    pdf.text(
      "TRANSACTION REVIEW NOTICE",
      left,
      y
    );

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(7.5);

    pdf.setTextColor(70);

    pdf.text(
      `CASE NO. ${
        f.reference || "—"
      }`,
      right,
      y,
      {
        align: "right",
      }
    );

    y += 5;

    pdf.text(
      `Notice date: ${fmtDate(
        f.date
      )}`,
      right,
      y,
      {
        align: "right",
      }
    );

    y += 6;

    /*
     * SECTION 1
     */

    section(
      "1. RECIPIENT / SUBJECT DETAILS"
    );

    pair(
      `Full Name: ${
        f.name || "—"
      }`,
      `Phone: ${
        f.phone || "—"
      }`
    );

    pair(
      `Email: ${
        f.email || "—"
      }`,
      "Status: Information requested for review"
    );

    /*
     * SECTION 2
     */

    section(
      "2. REPORTED TRANSACTION"
    );

    pair(
      `Amount: ${
        f.amount
          ? `₹ ${f.amount}`
          : "—"
      }`,
      `Transaction Date: ${
        f.transactionDate
          ? fmtDate(
              f.transactionDate
            )
          : "—"
      }`
    );

    pair(
      `Transaction ID / UTR: ${
        f.transactionId || "—"
      }`,
      `UPI ID: ${
        f.upi || "—"
      }`
    );

    pair(
      `Bank: ${
        f.bank || "—"
      }`,
      `IFSC: ${
        f.ifsc || "—"
      }`
    );

    pair(
      `Account: ${
        f.account
          ? maskAccount(
              f.account
            )
          : "—"
      }`,
      `Classification: ${
        f.category ||
        "Financial Transaction Review"
      }`
    );

    y += 1;

    /*
     * SECTION 3
     */

    section("3. NOTICE");

    text(
      "This notice records transaction information supplied for case review. The recipient is requested to review the details above and provide any relevant explanation or supporting information through the appropriate authorized channel.",
      7.1,
      false,
      3.4
    );

    y += 1;

    text(
      "If, after verification of the transaction records and completion of the applicable investigation and legal process, the competent authority or court establishes that the conduct amounts to cheating and dishonestly inducing delivery of property, the applicable provisions of Section 318 of the Bharatiya Nyaya Sanhita, 2023 may apply. In specified circumstances covered by Section 318(4), the punishment may extend to imprisonment of up to seven years and fine.",
      6.65,
      false,
      3.2
    );

    y += 1;

    text(
      "If the facts establish cheating by personation, Section 319 of the Bharatiya Nyaya Sanhita, 2023 may apply. Where the statutory requirements are established, the provision provides for imprisonment of up to five years, or fine, or both.",
      6.65,
      false,
      3.2
    );

    y += 1;

    text(
      "Where the verified facts satisfy the statutory requirements of identity theft or cheating by personation using a computer resource or communication device, Sections 66C or 66D of the Information Technology Act, 2000 may also be applicable. These provisions provide for imprisonment of up to three years and fine up to ₹1 lakh.",
      6.65,
      false,
      3.2
    );

    y += 1;

    /*
     * SECTION 4
     */

    section(
      "4. LEGAL REFERENCE — VERIFY AGAINST THE CASE FACTS"
    );

    text(
      "Information Technology Act, 2000 — Section 66C (identity theft): imprisonment up to 3 years and fine up to ₹1 lakh, where the statutory elements are established.",
      6.5,
      false,
      3.15
    );

    text(
      "Information Technology Act, 2000 — Section 66D (cheating by personation using a computer resource or communication device): imprisonment up to 3 years and fine up to ₹1 lakh, where applicable.",
      6.5,
      false,
      3.15
    );

    text(
      "Bharatiya Nyaya Sanhita, 2023 — Section 318 (cheating): punishment depends on the applicable subsection and established facts.",
      6.5,
      false,
      3.15
    );

    text(
      "Bharatiya Nyaya Sanhita, 2023 — Section 319 (cheating by personation): punishment can extend to 5 years, or fine, or both, subject to statutory requirements.",
      6.5,
      false,
      3.15
    );

    y += 1;

    /*
     * SECTION 5
     */

    section(
      "5. NATIONAL CYBERCRIME PUBLIC-REFERENCE CONTACTS"
    );

    text(
      "Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs — public-reference address: 5th Floor, NDCC-II Building, Jai Singh Road, New Delhi - 110001.",
      6.6,
      false,
      3.2
    );

    text(
      "National Cyber Crime Reporting Portal: cybercrime.gov.in     Helpline: 1930     Emergency: 112",
      7,
      true,
      3.6
    );

    /*
     * OFFICER INFORMATION
     */

    y += 2;

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(6.8);

    pdf.setTextColor(70);

    pdf.text(
      `Case Review Officer: ${
        f.officer ||
        "Arjun Mehta"
      }`,
      left,
      y
    );

    y += 3.5;

    pdf.text(
      `Designation: ${
        f.designation ||
        "Case Review Officer"
      }`,
      left,
      y
    );

    /*
     * SAVE
     */

    pdf.save(
      `${
        f.reference ||
        "transaction-review-notice"
      }.pdf`
    );
  };

  const remove = (
    id: string
  ) => {
    const next = docs.filter(
      (d) => d.id !== id
    );

    setDocs(next);

    localStorage.setItem(
      "notice_docs",
      JSON.stringify(next)
    );
  };

  const copyVariables = async () => {
    const variables = [
      "{{REFERENCE_NUMBER}}",
      "{{DATE}}",
      "{{NAME}}",
      "{{PHONE}}",
      "{{EMAIL}}",
      "{{UPI_ID}}",
      "{{BANK_NAME}}",
      "{{ACCOUNT_NUMBER}}",
      "{{IFSC}}",
      "{{AMOUNT}}",
      "{{TRANSACTION_DATE}}",
      "{{TRANSACTION_ID}}",
      "{{CATEGORY}}",
      "{{SUBJECT}}",
      "{{CRIME}}",
      "{{LAW_SECTION}}",
      "{{PUNISHMENT}}",
      "{{NOTICE_BODY}}",
    ].join("\n");

    await navigator.clipboard.writeText(
      variables
    );

    setCopied(true);

    setTimeout(
      () => setCopied(false),
      1500
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                Transaction Notice
              </h1>

              <p className="text-xs text-slate-500">
                Transaction review and case documentation
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clear}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              <RotateCcw
                size={15}
                className="mr-1 inline"
              />

              New Notice
            </button>

            <button
              onClick={loadDemo}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Load Demo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1550px] px-5 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(430px,0.9fr)_minmax(540px,1.1fr)]">
          <section className="no-print space-y-5">
            <Card title="Case and recipient details">
              <div className="mb-3">
                <Field
                  label="Case Number"
                  value={f.reference}
                  onChange={(v) =>
                    update(
                      "reference",
                      v
                    )
                  }
                  required
                  placeholder="Enter case number"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={f.name}
                  onChange={(v) =>
                    update(
                      "name",
                      v
                    )
                  }
                  required
                />

                <Field
                  label="Phone Number"
                  value={f.phone}
                  onChange={(v) =>
                    update(
                      "phone",
                      v
                    )
                  }
                  required
                />

                <Field
                  label="Email Address"
                  value={f.email}
                  onChange={(v) =>
                    update(
                      "email",
                      v
                    )
                  }
                  type="email"
                />
              </div>
            </Card>

            <Card title="Transaction details">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Transaction Amount (INR)"
                  value={f.amount}
                  onChange={(v) =>
                    update(
                      "amount",
                      v
                    )
                  }
                />

                <Field
                  label="Transaction Date"
                  type="date"
                  value={
                    f.transactionDate
                  }
                  onChange={(v) =>
                    update(
                      "transactionDate",
                      v
                    )
                  }
                />

                <Field
                  label="Transaction ID / UTR"
                  value={
                    f.transactionId
                  }
                  onChange={(v) =>
                    update(
                      "transactionId",
                      v
                    )
                  }
                />

                <Field
                  label="UPI ID"
                  value={f.upi}
                  onChange={(v) =>
                    update(
                      "upi",
                      v
                    )
                  }
                />
              </div>
            </Card>

            <Card title="Bank account details">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Bank Name"
                  value={f.bank}
                  onChange={(v) =>
                    update(
                      "bank",
                      v
                    )
                  }
                />

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Bank Account Number
                  </label>

                  <div className="relative">
                    <input
                      className="w-full rounded-lg border px-3 py-2 pr-16 text-sm"
                      type={
                        showAccount
                          ? "text"
                          : "password"
                      }
                      value={
                        f.account
                      }
                      onChange={(e) =>
                        update(
                          "account",
                          e.target
                            .value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowAccount(
                          !showAccount
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600"
                    >
                      {showAccount
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                <Field
                  label="IFSC Code"
                  value={f.ifsc}
                  onChange={(v) =>
                    update(
                      "ifsc",
                      v
                    )
                  }
                />
              </div>
            </Card>

            <Card title="Fixed document template">
              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div>
                  <b>Subject:</b>{" "}
                  {FIXED_SUBJECT}
                </div>

                <p className="mt-3 whitespace-pre-wrap">
                  {FIXED_BODY}
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                The subject, classification and
                notice wording are fixed. Recipient
                and transaction information is
                entered manually.
              </p>
            </Card>

            <Card title="Case review officer">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Officer Name"
                  value={
                    f.officer
                  }
                  onChange={(v) =>
                    update(
                      "officer",
                      v
                    )
                  }
                />

                <Field
                  label="Designation"
                  value={
                    f.designation
                  }
                  onChange={(v) =>
                    update(
                      "designation",
                      v
                    )
                  }
                />

                <Field
                  label="Organization"
                  value={
                    f.organization
                  }
                  onChange={(v) =>
                    update(
                      "organization",
                      v
                    )
                  }
                />

                <Field
                  label="Department"
                  value={
                    f.department
                  }
                  onChange={(v) =>
                    update(
                      "department",
                      v
                    )
                  }
                />

                <Field
                  label="Office Address"
                  value={
                    f.address
                  }
                  onChange={(v) =>
                    update(
                      "address",
                      v
                    )
                  }
                />
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveDraft}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-medium"
              >
                <Save
                  size={16}
                  className="mr-2 inline"
                />
                Save Draft
              </button>

              <button
                onClick={
                  downloadPdf
                }
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <Download
                  size={16}
                  className="mr-2 inline"
                />
                Generate & Download PDF
              </button>

              <button
                onClick={() =>
                  window.print()
                }
                className="rounded-lg border bg-white px-4 py-2 text-sm"
              >
                <Printer
                  size={16}
                  className="mr-2 inline"
                />
                Print
              </button>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between no-print">
              <div>
                <h2 className="font-semibold">
                  Live A4 Preview
                </h2>

                <p className="text-xs text-slate-500">
                  Fixed template with submitted
                  recipient and transaction details.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                A4
              </span>
            </div>

            <div className="overflow-auto rounded-xl border bg-slate-200 p-3">
              <NoticePreview f={f} />
            </div>
          </section>
        </div>

        <section className="mt-8 no-print">
          <h2 className="mb-3 text-lg font-bold">
            Recent Drafts
          </h2>

          <div className="overflow-x-auto rounded-xl border bg-white">
            {docs.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                No saved drafts yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="p-3">
                      Reference
                    </th>

                    <th className="p-3">
                      Recipient
                    </th>

                    <th className="p-3">
                      Category
                    </th>

                    <th className="p-3">
                      Saved
                    </th>

                    <th className="p-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {docs.map(
                    (d) => (
                      <tr
                        key={d.id}
                        className="border-b last:border-0"
                      >
                        <td className="p-3 font-medium">
                          {
                            d.reference ||
                            "—"
                          }
                        </td>

                        <td className="p-3">
                          {d.name ||
                            "—"}
                        </td>

                        <td className="p-3">
                          {
                            d.category
                          }
                        </td>

                        <td className="p-3 text-slate-500">
                          {new Date(
                            d.savedAt
                          ).toLocaleString()}
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() =>
                              setF(d)
                            }
                            className="mr-3 text-blue-600"
                          >
                            <Eye
                              size={15}
                              className="mr-1 inline"
                            />

                            Open
                          </button>

                          <button
                            onClick={() =>
                              remove(
                                d.id
                              )
                            }
                            className="text-red-600"
                          >
                            <Trash2
                              size={15}
                              className="mr-1 inline"
                            />

                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-900">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}

        {required && (
          <span className="text-red-500">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-200"
      />
    </div>
  );
}

function NoticePreview({
  f,
}: {
  f: Form;
}) {
  return (
    <div className="a4-page text-[10.5px] leading-5">

      {/* PUBLIC REFERENCE HEADER */}

      <div className="border-b-2 border-slate-800 pb-2">
        

        <div className="mt-1 text-[11px] font-bold text-slate-900">
          Ministry of Home Affairs — Government of India
        </div>

        <div className="text-[8px] text-slate-500">
          North Block, New Delhi - 110001, India
        </div>

        <div className="mt-1 text-[8px] font-bold text-slate-700">
          Indian Cyber Crime Coordination Centre
          (I4C) — Public Reference
        </div>

        <div className="text-[8px] text-slate-500">
          5th Floor, NDCC-II Building, Jai Singh
          Road, New Delhi - 110001
        </div>


      </div>

      {/* DOCUMENT TITLE */}

      <div className="mt-3 flex items-end justify-between border-b pb-2">
        <div className="text-lg font-bold tracking-widest text-slate-900">
          TRANSACTION REVIEW NOTICE
        </div>

        <div className="text-right text-[9px] text-slate-500">
          <div>
            <b>CASE NO.</b>{" "}
            {f.reference ||
              "—"}
          </div>

          <div>
            Notice date:{" "}
            {fmtDate(f.date)}
          </div>
        </div>
      </div>

      {/* SECTION 1 */}

      <div className="mt-3">
        <h3 className="border-b pb-1 text-[10px] font-bold tracking-wide">
          1. RECIPIENT / SUBJECT DETAILS
        </h3>

        <div className="mt-1 grid grid-cols-2 gap-x-6 text-[10px]">
          <div>
            <b>Full Name:</b>{" "}
            {f.name ||
              "—"}
          </div>

          <div>
            <b>Phone:</b>{" "}
            {f.phone ||
              "—"}
          </div>

          <div>
            <b>Email:</b>{" "}
            {f.email ||
              "—"}
          </div>

          <div>
            <b>Status:</b>{" "}
            Information requested for review
          </div>
        </div>
      </div>

      {/* SECTION 2 */}

      <div className="mt-3">
        <h3 className="border-b pb-1 text-[10px] font-bold tracking-wide">
          2. REPORTED TRANSACTION
        </h3>

        <div className="mt-1 grid grid-cols-2 gap-x-6 text-[10px]">
          <div>
            <b>Amount:</b>{" "}
            {f.amount
              ? `₹ ${f.amount}`
              : "—"}
          </div>

          <div>
            <b>Transaction Date:</b>{" "}
            {f.transactionDate
              ? fmtDate(
                  f.transactionDate
                )
              : "—"}
          </div>

          <div>
            <b>Transaction ID / UTR:</b>{" "}
            {f.transactionId ||
              "—"}
          </div>

          <div>
            <b>UPI ID:</b>{" "}
            {f.upi ||
              "—"}
          </div>

          <div>
            <b>Bank:</b>{" "}
            {f.bank ||
              "—"}
          </div>

          <div>
            <b>IFSC:</b>{" "}
            {f.ifsc ||
              "—"}
          </div>

          <div>
            <b>Account:</b>{" "}
            {f.account
              ? maskAccount(
                  f.account
                )
              : "—"}
          </div>

          <div>
            <b>Classification:</b>{" "}
            {f.category ||
              "Financial Transaction Review"}
          </div>
        </div>
      </div>

      {/* SECTION 3 */}

      <div className="mt-3">
        <h3 className="border-b pb-1 text-[10px] font-bold tracking-wide">
          3. NOTICE
        </h3>

        <p className="mt-1 text-[9.5px] leading-4">
          This notice records transaction
          information supplied for case review.
          The recipient is requested to review
          the details above and provide any
          relevant explanation or supporting
          information through the appropriate
          authorized channel.
        </p>

        <p className="mt-2 text-[9px] leading-4">
          If, after verification of the transaction
          records and completion of the applicable
          investigation and legal process, the
          competent authority or court establishes
          that the conduct amounts to cheating and
          dishonestly inducing delivery of property,
          the applicable provisions of Section 318
          of the Bharatiya Nyaya Sanhita, 2023 may
          apply. In specified circumstances covered
          by Section 318(4), the punishment may
          extend to imprisonment of up to seven
          years and fine.
        </p>

        <p className="mt-2 text-[9px] leading-4">
          If the facts establish cheating by
          personation, Section 319 of the Bharatiya
          Nyaya Sanhita, 2023 may apply. Where the
          statutory requirements are established,
          the provision provides for imprisonment
          of up to five years, or fine, or both.
        </p>

        <p className="mt-2 text-[9px] leading-4">
          Where the verified facts satisfy the
          statutory requirements of identity theft
          or cheating by personation using a
          computer resource or communication
          device, Sections 66C or 66D of the
          Information Technology Act, 2000 may
          also be applicable. These provisions
          provide for imprisonment of up to three
          years and fine up to ₹1 lakh.
        </p>
      </div>

      {/* SECTION 4 */}

      <div className="mt-3">
        <h3 className="border-b pb-1 text-[10px] font-bold tracking-wide">
          4. LEGAL REFERENCE — VERIFY AGAINST THE CASE FACTS
        </h3>

        <div className="mt-1 space-y-1 text-[8.5px] leading-4">
          <div>
            • <b>IT Act §66C:</b> identity theft —
            imprisonment up to 3 years and fine
            up to ₹1 lakh, where the statutory
            elements are established.
          </div>

          <div>
            • <b>IT Act §66D:</b> cheating by
            personation using a computer resource
            or communication device — imprisonment
            up to 3 years and fine up to ₹1 lakh,
            where applicable.
          </div>

          <div>
            • <b>BNS §318:</b> cheating —
            punishment depends on the applicable
            subsection and established facts.
          </div>

          <div>
            • <b>BNS §319:</b> cheating by
            personation — punishment can extend
            to 5 years, or fine, or both, subject
            to statutory requirements.
          </div>
        </div>
      </div>

      {/* SECTION 5 */}

      <div className="mt-3 rounded border bg-slate-50 p-2 text-[8px] leading-3.5">
        <div className="font-bold">
          5. NATIONAL CYBERCRIME
          PUBLIC-REFERENCE CONTACTS
        </div>

        <div className="mt-1">
          Indian Cyber Crime Coordination Centre
          (I4C), Ministry of Home Affairs —
          5th Floor, NDCC-II Building, Jai Singh
          Road, New Delhi - 110001.
        </div>

        <div>
          National Cyber Crime Reporting Portal:{" "}
          <b>cybercrime.gov.in</b>
          &nbsp; | &nbsp;
          Helpline: <b>1930</b>
          &nbsp; | &nbsp;
          Emergency: <b>112</b>
        </div>
      </div>

      {/* CASE REVIEW OFFICER */}

      <div className="mt-3 border-t pt-2 text-[8px] leading-3.5 text-slate-600">
        <div>
          <b>Case Review Officer:</b>{" "}
          {f.officer ||
            "Arjun Mehta"}
        </div>

        <div>
          <b>Designation:</b>{" "}
          {f.designation ||
            "Case Review Officer"}
        </div>
      </div>
    </div>
  );
}