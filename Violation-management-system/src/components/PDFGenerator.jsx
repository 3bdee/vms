import jsPDF from "jspdf";

export const generateViolationPDF = (record) => {
  const pdf = new jsPDF();

  // Set font
  pdf.setFont("helvetica");

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 51, 102);
  pdf.text("Groupe Scolaire ALHIKMA", 20, 30);

  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text("N° 5, Secteur C, Hay El Houda, Agadir, Maroc", 20, 40);
  pdf.text("Tél: 212 528 32 01 21", 20, 50);

  // Line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 60, 190, 60);

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(0, 51, 102);
  pdf.text("FICHE DE VIOLATION", 105, 80, { align: "center" });

  // Student information
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  let yPosition = 110;

  pdf.setFont("helvetica", "bold");
  pdf.text("Informations de l'élève:", 20, yPosition);

  pdf.setFont("helvetica", "normal");
  yPosition += 15;
  pdf.text(
    `Nom complet: ${record.firstName} ${record.lastName}`,
    30,
    yPosition
  );

  yPosition += 10;
  pdf.text(`Niveau: ${record.level}`, 30, yPosition);

  yPosition += 10;
  pdf.text(
    `Date de l'infraction: ${new Date(record.violationTime).toLocaleString(
      "fr-FR"
    )}`,
    30,
    yPosition
  );

  // Violation details
  yPosition += 25;
  pdf.setFont("helvetica", "bold");
  pdf.text("Détails de la violation:", 20, yPosition);

  pdf.setFont("helvetica", "normal");
  yPosition += 15;
  pdf.text(`Violation: ${record.violationName}`, 30, yPosition);

  yPosition += 10;
  pdf.text(`Sanction: ${record.punishmentName}`, 30, yPosition);

  yPosition += 10;
  pdf.text(`Enseignant(e): ${record.teacherName}`, 30, yPosition);

  // Signature section
  yPosition += 40;
  pdf.setFont("helvetica", "bold");
  pdf.text("Signature du responsable:", 20, yPosition);

  // Signature line
  pdf.setDrawColor(0, 0, 0);
  pdf.line(80, yPosition + 5, 150, yPosition + 5);

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Document généré le ${new Date().toLocaleString("fr-FR")}`,
    105,
    280,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `Violation_${record.firstName}_${record.lastName}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
