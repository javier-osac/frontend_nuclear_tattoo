import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

document.getElementById("exportPDF").addEventListener("click", () => {
    const doc = new jsPDF();

    const headers = [
        ["Fecha", "Monto", "Tipo", "Categoría", "Método de Pago", "Descripción"]
    ];

    const rows = [];

    // Obtener todos los checkboxes seleccionados
    const selectedCheckboxes = Array.from(document.querySelectorAll(".row-checkbox:checked"));

    let targetRows;

    if (selectedCheckboxes.length > 0) {
        targetRows = selectedCheckboxes.map(checkbox => checkbox.closest("tr"));
    } else {
        targetRows = Array.from(document.querySelectorAll("table tbody tr")).filter((row) => {
            return row.offsetParent !== null;
        });
    }


    // Construir datos para PDF
    targetRows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        const data = [
            cols[1]?.textContent.trim(),
            cols[2]?.textContent.trim(),
            cols[3]?.textContent.trim(),
            cols[4]?.textContent.trim(),
            cols[5]?.textContent.trim(),
            cols[6]?.textContent.trim()
        ];
        rows.push(data);
    });

    if (rows.length === 0) {
        alert("No hay transacciones seleccionadas ni visibles para exportar.");
        return;
    }

    doc.text("Historial de Transacciones", 14, 14);
    autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save("historial_transacciones.pdf");
});
