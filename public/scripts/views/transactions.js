const API_URL = 'http://localhost:3001/transactions';

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Enviar datos al backend
    await fetch(API_URL, {
        method: 'POST',
        body: formData, // Envía los datos como FormData
    });
    fetchTransactions();
    e.target.reset();
});


// Fetch all transactions
async function fetchTransactions() {
    const response = await fetch(API_URL);
    const transactions = await response.json();
    renderTransactions(transactions);
}

// Add a transaction
async function addTransaction(transaction) {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
    });
    fetchTransactions();
}

// Update a transaction
// Lógica para mostrar y ocultar el modal de edición
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editTransactionForm");
const cancelEditBtn = document.getElementById("cancelEdit");
let currentTransactionId = null; // Para almacenar el ID de la transacción en edición

// Mostrar el modal y cargar los datos de la transacción seleccionada
window.editTransaction = function (id) {
    currentTransactionId = id; // Guarda el ID de la transacción actual

    // Busca la transacción actual para rellenar el formulario
    fetch(`${API_URL}/${id}`)
        .then((response) => response.json())
        .then((transaction) => {
            const dbDate = transaction.transaction_date;

            // Convierte la fecha al objeto Date sin ajustar la zona horaria
            const localDate = new Date(`${dbDate.replace(" ", "T")}`); // Asegúrate de que sea en formato `YYYY-MM-DDTHH:mm:ss`

            // Extrae la fecha y hora en la zona horaria local
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Mes empieza desde 0
            const day = String(localDate.getDate()).padStart(2, '0');
            const hours = String(localDate.getHours()).padStart(2, '0');
            const minutes = String(localDate.getMinutes()).padStart(2, '0');

            // Formato para datetime-local: YYYY-MM-DDTHH:mm
            const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
            console.log("Fecha ajustada para el input:", formattedDateTime);

            // Asigna al campo del formulario
            document.getElementById("edit_transaction_date").value = formattedDateTime;
            document.getElementById("edit_amount").value = transaction.amount;
            document.getElementById("edit_description").value = transaction.description;
            document.getElementById("edit_transaction_type").value = transaction.transaction_type;
            document.getElementById("edit_category").value = transaction.category;
            document.getElementById("edit_payment_method").value = transaction.payment_method;
            editModal.classList.remove("hidden"); // Muestra el modal
        })
        .catch((error) => {
            console.error("Error fetching transaction data:", error);
        });
};

// Ocultar el modal
cancelEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editForm.reset();
});

// Enviar los datos editados
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(editForm);

    // Envía los datos como FormData (incluyendo archivo, si lo hay)
    await fetch(`${API_URL}/${currentTransactionId}`, {
        method: "PUT",
        body: formData, // Enviar como FormData para admitir archivos
    });

    // Oculta el modal y recarga las transacciones
    editModal.classList.add("hidden");
    fetchTransactions();
});

// Delete a transaction
window.deleteTransaction = async function (id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTransactions();
};

// Render transactions in the table
let balance = 0; // Variable global para el balance

function renderTransactions(transactions) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = transactions.map(transaction => {
        const date = new Date(transaction.transaction_date);

        // Formatear fecha y hora
        const formattedDate = date.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        // Formatear cantidad como moneda sin decimales
        const formattedAmount = transaction.amount.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        return `
    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
    <td class="px-4 py-4">
        <input type="checkbox" class="row-checkbox" data-type="${transaction.transaction_type}" data-amount="${transaction.amount}">
    </td>
    <td class="px-6 py-4" data-column="date_filter">${formattedDate} ${formattedTime}</td>
    <td class="px-6 py-4" data-column="amount_filter">${formattedAmount}</td>
    <td class="px-6 py-4" data-column="type_filter">${transaction.transaction_type}</td>
    <td class="px-6 py-4" data-column="category_filter">${transaction.category}</td>
    <td class="px-6 py-4" data-column="payment_filter">${transaction.payment_method}</td>
    <td class="px-6 py-4" data-column="description_filter">${transaction.description}</td>
    <td class="px-6 py-4">
        ${transaction.receipt ? `<a href="${transaction.receipt}" target="_blank">Ver Recibo</a>` : 'No receipt'}
    </td>
    <td class="px-6 py-4">
        <button class="font-medium text-blue-600 dark:text-blue-500 hover:underline" onclick="editTransaction(${transaction.id_transaction})">Editar</button>
        <br>
        <button class="font-medium text-red-600 dark:text-red-500 hover:underline" onclick="deleteTransaction(${transaction.id_transaction})">Eliminar</button>
    </td>
</tr>`;
    }).join('');

    addCheckboxEvents(); // Agregar eventos después de renderizar las filas
}

function addCheckboxEvents() {
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const balanceElement = document.getElementById('balance');

    // Función para recalcular el balance
    function recalculateBalance() {
        let newBalance = 0;

        rowCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const amount = parseFloat(checkbox.dataset.amount);
                const type = checkbox.dataset.type;
                newBalance += type === 'Ingreso' ? amount : -amount;
            }
        });

        // Actualizar el balance global y el elemento visual
        balance = newBalance;
        balanceElement.textContent = balance.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    // Agregar eventos a cada checkbox individual
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            recalculateBalance();
        });
    });

    // Agregar evento al checkbox de seleccionar todo
    selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        recalculateBalance(); // Recalcular el balance después de cambiar todos los estados
    });
}


// Initial fetch
fetchTransactions();