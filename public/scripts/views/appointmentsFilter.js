document.addEventListener("DOMContentLoaded", () => {
      const filterInputs = document.querySelectorAll(".filter-input");
      const tableBody = document.querySelector("#appointmentsTable");

      filterInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const columnFilter = input.dataset.column; // Obtener el filtro correspondiente
          const filterValue = input.value.toLowerCase();

          // Filtrar las filas de la tabla
          const rows = tableBody.querySelectorAll("tr");
          rows.forEach((row) => {
            const cell = row.querySelector(`[data-column="${columnFilter}"]`);
            if (cell) {
              const cellValue = cell.textContent.toLowerCase();
              row.style.display = cellValue.includes(filterValue) ? "" : "none";
            }
          });
        });
      });
    });