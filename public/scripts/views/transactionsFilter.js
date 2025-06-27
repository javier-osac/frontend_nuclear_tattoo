document.addEventListener("DOMContentLoaded", () => {
    const filterInputs = document.querySelectorAll(".filter-input");
    const tableBody = document.querySelector("tbody");
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    const balanceElement = document.getElementById("balance");

    function applyFilters() {
        const filters = {};
        filterInputs.forEach((input) => {
            const columnFilter = input.dataset.column || "date_filter"; // Default to 'date_filter' for the date column
            filters[columnFilter] = input.value.trim().toLowerCase();
        });

        const rows = tableBody.querySelectorAll("tr");

        rows.forEach((row) => {
            let isRowVisible = true;

            for (const [column, filterValue] of Object.entries(filters)) {
                if (!filterValue) continue;

                const cell = row.querySelector(`[data-column="${column}"]`);
                if (cell) {
                    const cellValue = cell.textContent.trim().toLowerCase();

                    if (column === "date_filter") {
                        // Validate partial date format and perform filtering
                        if (!filterDate(cellValue, filterValue)) {
                            isRowVisible = false;
                            break;
                        }
                    } else if (!cellValue.includes(filterValue)) {
                        isRowVisible = false;
                        break;
                    }
                }
            }

            row.hidden = !isRowVisible;
        });

        updateCheckboxSelection();
        recalculateBalance(); // Recalculate balance after filters are applied
    }

    function filterDate(cellValue, filterValue) {
        // Support filtering with partial dates
        const normalizedCellDate = normalizeDate(cellValue);

        // Allow partial matching with "startsWith"
        return normalizedCellDate.startsWith(filterValue);
    }

    function normalizeDate(dateText) {
        // Normalize dates from DD/MM/YYYY to DD/MM/YYYY format
        if (!dateText) return "";
        const [day, month, year] = dateText.split("/");

        // Return the original format if already valid
        if (day && month && year) {
            return `${day}/${month}/${year}`;
        }

        return dateText; // Return as-is for partial dates
    }

    function updateCheckboxSelection() {
        const rowCheckboxes = tableBody.querySelectorAll(".row-checkbox");
        const visibleRows = Array.from(rowCheckboxes).filter((checkbox) => !checkbox.closest("tr").hidden);

        visibleRows.forEach((checkbox) => {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change"));
        });

        const allChecked = visibleRows.every((checkbox) => checkbox.checked);
        const someChecked = visibleRows.some((checkbox) => checkbox.checked);

        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && someChecked;
    }

    function toggleSelectAll(event) {
        const isChecked = event.target.checked;
        const rowCheckboxes = tableBody.querySelectorAll(".row-checkbox");

        rowCheckboxes.forEach((checkbox) => {
            const row = checkbox.closest("tr");
            if (!row.hidden) {
                checkbox.checked = isChecked;
                row.classList.toggle("selected", isChecked);
            }
        });

        recalculateBalance(); // Recalculate balance after toggling all selections
    }

    function recalculateBalance() {
        const rowCheckboxes = tableBody.querySelectorAll(".row-checkbox");
        let newBalance = 0;

        rowCheckboxes.forEach((checkbox) => {
            const row = checkbox.closest("tr");
            if (!row.hidden && checkbox.checked) { // Consider only visible rows and checked checkboxes
                const amount = parseFloat(checkbox.dataset.amount);
                const type = checkbox.dataset.type;
                newBalance += type === "Ingreso" ? amount : -amount;
            }
        });

        balanceElement.textContent = newBalance.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    filterInputs.forEach((input) => {
        input.addEventListener("input", applyFilters);
    });

    selectAllCheckbox.addEventListener("change", toggleSelectAll);

    const rowCheckboxes = document.querySelectorAll(".row-checkbox");
    rowCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            recalculateBalance();
        });
    });
});
