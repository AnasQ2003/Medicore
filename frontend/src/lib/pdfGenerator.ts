import { jsPDF } from "jspdf";

export interface PDFChartBar {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: number[];
}

export interface PDFChart {
  title: string;
  bars: PDFChartBar[];
}

export interface PDFSection {
  title?: string;
  subtitle?: string;
  items?: { label: string; value: string }[];
  table?: { headers: string[]; rows: string[][] };
  notes?: string[];
  charts?: PDFChart[];
}

export function generateGenericPDF(
  docTitle: string,
  category: string,
  sections: PDFSection[],
  filename: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("MediCore HMS", 14, 13);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Official Medical Document • ${category}`, 14, 20);

  const dateStr = new Date().toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 20, { align: "right" });

  y = 36;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(docTitle, 14, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Sections
  sections.forEach((sec) => {
    // Page boundary check
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    if (sec.title) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, y - 4, pageWidth - 28, 8, "F");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(sec.title.toUpperCase(), 16, y + 1.5);
      y += 9;
    }

    if (sec.subtitle) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(sec.subtitle, 14, y);
      y += 6;
    }

    if (sec.items && sec.items.length > 0) {
      const col1X = 16;
      const col2X = pageWidth / 2 + 5;
      let isCol1 = true;

      sec.items.forEach((item) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }

        const currX = isCol1 ? col1X : col2X;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`${item.label}:`, currX, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(item.value), currX + doc.getTextWidth(`${item.label}: `) + 1, y);

        if (!isCol1) {
          y += 6;
        }
        isCol1 = !isCol1;
      });

      if (!isCol1) y += 6;
      y += 2;
    }

    if (sec.table) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      const headers = sec.table.headers;
      const rows = sec.table.rows;
      const colWidth = (pageWidth - 28) / headers.length;

      // Table Header
      doc.setFillColor(51, 65, 85);
      doc.rect(14, y, pageWidth - 28, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      headers.forEach((h, idx) => {
        doc.text(h, 16 + idx * colWidth, y + 5);
      });
      y += 7;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);

      rows.forEach((row, rIdx) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }

        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, pageWidth - 28, 7, "F");
        }

        row.forEach((cell, cIdx) => {
          doc.text(String(cell), 16 + cIdx * colWidth, y + 5);
        });
        y += 7;
      });

      y += 4;
    }

    // Graphical Bar Charts rendered into PDF
    if (sec.charts) {
      sec.charts.forEach((chart) => {
        if (y > pageHeight - 45) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`📊 ${chart.title}`, 14, y);
        y += 6;

        chart.bars.forEach((b) => {
          if (y > pageHeight - 25) {
            doc.addPage();
            y = 20;
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(b.label, 16, y + 3);

          const barMax = b.max || 100;
          const barWidthMax = 95; // mm
          const currentBarWidth = Math.min(barWidthMax, (b.value / barMax) * barWidthMax);

          // Track background
          doc.setFillColor(226, 232, 240);
          doc.roundedRect(65, y, barWidthMax, 4, 1, 1, "F");

          // Bar fill with custom or default color
          const [r, g, bl] = b.color || [14, 165, 233];
          doc.setFillColor(r, g, bl);
          if (currentBarWidth > 0) {
            doc.roundedRect(65, y, currentBarWidth, 4, 1, 1, "F");
          }

          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          const valDisplay = b.unit ? `${b.value} ${b.unit}` : `${b.value}`;
          doc.text(valDisplay, 68 + barWidthMax, y + 3);

          y += 7;
        });

        y += 4;
      });
    }

    if (sec.notes) {
      sec.notes.forEach((n) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(`• ${n}`, 16, y);
        y += 5;
      });
      y += 2;
    }
  });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "MediCore HMS Enterprise System • Confidentially Prepared • Valid Without Stamp",
      14,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(cleanFilename);
}
