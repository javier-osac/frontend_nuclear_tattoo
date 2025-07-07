import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

document.getElementById("exportAppointmentsPDF").addEventListener("click", () => {
  const doc = new jsPDF();

  const headers = [
    ["Cliente", "Empleado", "Servicio", "Estado", "Lugar", "Fecha"]
  ];

  const rows = [];

  const visibleRows = Array.from(document.querySelectorAll("#appointmentsTable tr")).filter(
    (row) => row.offsetParent !== null
  );

  visibleRows.forEach((row) => {
    const cells = row.querySelectorAll("td, th"); // Incluye <th> para cliente
    const data = [
      cells[0]?.textContent.trim(), // Cliente
      cells[1]?.textContent.trim(), // Empleado
      cells[2]?.textContent.trim(), // Servicio
      cells[3]?.textContent.trim(), // Estado
      cells[4]?.textContent.trim(), // Lugar
      cells[5]?.textContent.trim(), // Fecha
    ];
    rows.push(data);
  });

  doc.text("Listado de Citas", 14, 14);
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [220, 53, 69] }, // Color rojo para encabezado
  });

  doc.save("listado_de_citas.pdf");
});
