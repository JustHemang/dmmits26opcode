import { jsPDF } from "jspdf";
import type { ResumeData } from "@/types";

const INK: [number, number, number] = [23, 37, 84];
const GRAY: [number, number, number] = [90, 100, 120];
const ACCENT: [number, number, number] = [37, 99, 235];

const MARGIN = 44;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function heading(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...ACCENT);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  return y + 7;
}

export function downloadResumePdf(r: ResumeData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  const name = clean(r.name) || "Your Name";
  doc.text(name, MARGIN, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  if (clean(r.headline)) doc.text(clean(r.headline), MARGIN, y);

  const contact = [r.email, r.phone, r.location, r.linkedin].map(clean).filter(Boolean);
  if (contact.length) {
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(contact.join("  |  "), MARGIN, y);
  }

  y += 6;
  doc.setDrawColor(225, 230, 240);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  if (clean(r.summary)) {
    y = heading(doc, "Professional Summary", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(clean(r.summary), CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.6 + 6;
  }

  if (r.projects.some((p) => clean(p.name) || clean(p.description))) {
    y = heading(doc, "Projects", y);
    for (const p of r.projects) {
      if (!clean(p.name) && !clean(p.description)) continue;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(clean(p.name), MARGIN, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...GRAY);
      const lines = doc.splitTextToSize(clean(p.description), CONTENT_W);
      doc.text(lines, MARGIN, y);
      y += lines.length * 4.6 + 4;
    }
  }

  if (r.certifications.some((c) => clean(c.name))) {
    y = heading(doc, "Certifications", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    for (const c of r.certifications) {
      if (!clean(c.name)) continue;
      const meta = [clean(c.name), c.issuer, c.year].filter(Boolean).join("  ·  ");
      doc.text(meta, MARGIN, y);
      y += 5.5;
    }
  }

  if (r.skills.length) {
    y = heading(doc, "Skills", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const skills = r.skills.map((s) => s.name).join("  ·  ");
    const lines = doc.splitTextToSize(skills, CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.6 + 4;
  }

  const safeName = name.replace(/[^a-z0-9]+/gi, "_").toLowerCase() || "resume";
  doc.save(`${safeName}_resume.pdf`);
}
