// Selección de elementos del DOM
import Swal from '../../../node_modules/sweetalert2';
import { getUserFromToken } from "../../../src/utils/auth.js";
const form = document.querySelector('form');
const editModal = document.getElementById('editModal');
const appointmentsTable = document.getElementById('appointmentsTable');


/**
 * Maneja la creación de una nueva cita y su envío al backend
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const newToken = localStorage.getItem("token");
  const newUser = newToken ? getUserFromToken(newToken) : null;
  const userId = newUser ? newUser.id : null;

  const data = {
    id_user: userId,
    employee_name: form.employee_preference.value,
    client_name: form.customer_name.value,
    start_date_time: form.appointment_date.value,
    end_date_time: form.appointment_date.value,
    service_type: form.appointment_type.value,
    status: 'Pendiente',
    appointment_location: form.place.value,
    creation_date_time: new Date().toISOString(),
    domicile_address: form.place.value === 'Domicilio' ? form.address.value : null,
  };

  try {
    const res = await fetch('http://localhost:3001/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Cita creada',
        text: 'La cita fue registrada correctamente',
        timer: 2000,
      });
      form.reset();
      loadAppointments(); // Actualizar la tabla de citas
    } else {
      alert('Error al crear la cita');
    }
  } catch (error) {
    console.error('Error al enviar los datos:', error);
  }
});

/**
 * Muestra o esconde el campo de dirección dependiendo de la selección de lugar
 */
document.addEventListener("DOMContentLoaded", function () {
  const placeSelect = document.getElementById("place");
  const addressField = document.getElementById("addressField");

  placeSelect.addEventListener("change", function () {
    addressField.style.display = this.value === "Domicilio" ? "block" : "none";
  });
});

/**
 * Carga y renderiza las opciones de empleados en el select
 */
async function loadEmployeeOptions() {
  try {
    // Realiza el fetch a la API para obtener los usuarios
    const response = await fetch('http://localhost:3001/users');
    const users = await response.json();

    // Filtra los usuarios con id_role 1 o 2
    const employees = users.filter(user => user.id_role === 1 || user.id_role === 2);

    // Obtén el elemento select
    const employeeSelect = document.getElementById('employee_preference');

    // Limpiar opciones previas
    employeeSelect.innerHTML = `
      <option value="">Seleccione un empleado</option>
    `;

    // Agregar nuevas opciones
    employees.forEach(employee => {
      const option = document.createElement('option');
      option.value = employee.name; // Cambia esto según el campo que contenga el nombre
      option.textContent = employee.name; // Cambia esto según el campo que contenga el nombre
      employeeSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar las opciones de empleados:', error);
  }
}

// Llama a la función al cargar la página o cuando sea necesario
document.addEventListener('DOMContentLoaded', loadEmployeeOptions);

/**
 * Carga y renderiza las opciones de empleados en el select del MODAL
 */
async function loadEditEmployeeOptions() {
  try {
    // Realiza el fetch a la API para obtener los usuarios
    const response = await fetch('http://localhost:3001/users');
    const users = await response.json();

    // Filtra los usuarios con id_role 1 o 2
    const employees = users.filter(user => user.id_role === 1 || user.id_role === 2);

    // Obtén el elemento select
    const employeeSelect = document.getElementById('edit_employee_preference');

    // Limpiar opciones previas
    employeeSelect.innerHTML = `
      <option value="">Seleccione un empleado</option>
    `;

    // Agregar nuevas opciones
    employees.forEach(employee => {
      const option = document.createElement('option');
      option.value = employee.name; // Cambia esto según el campo que contenga el nombre
      option.textContent = employee.name; // Cambia esto según el campo que contenga el nombre
      employeeSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar las opciones de empleados:', error);
  }
}

// Llama a la función al cargar la página o cuando sea necesario
document.addEventListener('DOMContentLoaded', loadEditEmployeeOptions);


/**
 * Carga y renderiza la lista de citas en la tabla
 */
async function loadAppointments() {
  try {
    // Obtener el token del usuario
    const newToken = localStorage.getItem("token");
    const newUser = newToken ? getUserFromToken(newToken) : null;
    const userId = newUser ? newUser.id : null;

    if (!userId) {
      console.error("No se pudo obtener el ID del usuario. Verifica el token.");
      return;
    }

    // Solicitar citas al backend
    const response = await fetch(`http://localhost:3001/appointments/id_user/${userId}`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("No se encontraron citas para este usuario.");
        appointmentsTable.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; font-size: 1.5rem; font-weight: bold; margin-top: 20px; padding-top: 20px;">
          No se encontraron citas.
        </td>
      </tr>`;
        return;
      }
      throw new Error(`Error al cargar las citas: ${response.statusText}`);
    }


    const appointments = await response.json();

    // Limpiar tabla
    appointmentsTable.innerHTML = '';

    if (appointments.length === 0) {
      appointmentsTable.innerHTML = `<tr><td colspan="7">No se encontraron citas.</td></tr>`;
      return;
    }

    // Obtener el token del usuario y verificar sus permisos
    const token = localStorage.getItem("token");
    const user = token ? getUserFromToken(token) : null;
    const userPermissions = user ? user.permissions : [];

    // Función para determinar los botones visibles según los permisos
    const getButtonsByPermission = (permissions, appointmentId) => {
      const buttons = [];

      if (permissions.includes("total_appointments_manage")) {
        buttons.push(`
          <a href="javascript:void(0)" class="btn-confirm font-medium text-green-600 dark:text-green-500 hover:underline" data-id="${appointmentId}">Confirmar</a>
          <br>
          <a href="javascript:void(0)" class="btn-cancel font-medium text-purple-600 dark:text-purple-500 hover:underline" data-id="${appointmentId}">Cancelar</a>
          <br>
          <a href="javascript:void(0)" class="btn-edit font-medium text-blue-600 dark:text-blue-500 hover:underline" data-id="${appointmentId}">Editar</a>
          <br>
          <a href="javascript:void(0)" class="eliminar-cita font-medium text-red-600 dark:text-red-500 hover:underline " data-id="${appointmentId}">Eliminar</a>
        `);
      } else if (permissions.includes("partial_appointments_manage")) {
        buttons.push(`
          <a href="javascript:void(0)" class="btn-confirm font-medium text-green-600 dark:text-green-500 hover:underline" data-id="${appointmentId}">Confirmar</a>
          <br>
          <a href="javascript:void(0)" class="btn-cancel font-medium text-purple-600 dark:text-purple-500 hover:underline" data-id="${appointmentId}">Cancelar</a>
          <br>
          <a href="javascript:void(0)" class="btn-edit font-medium text-blue-600 dark:text-blue-500 hover:underline" data-id="${appointmentId}">Editar</a>
        `);
      } else if (permissions.includes("client_appointments_manage")) {
        buttons.push(`
          <a href="javascript:void(0)" class="btn-edit font-medium text-blue-600 dark:text-blue-500 hover:underline" data-id="${appointmentId}">Editar</a>
        `);
      }

      return buttons.join("");
    };

    // Agregar filas nuevas con lógica de permisos
    appointments.forEach((appointment) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", appointment.id_appointment);
      row.setAttribute("data-start", appointment.start_date_time);
      row.setAttribute("data-address", appointment.address || "");
      row.classList.add("bg-white", "border-b", "dark:bg-gray-800", "dark:border-gray-700", "border-gray-200");

      const buttons = getButtonsByPermission(userPermissions, appointment.id_appointment);

      row.innerHTML = `
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" data-column="client_filter">
          ${appointment.client_name}
        </th>
        <td class="px-6 py-4" data-column="employee_filter">${appointment.employee_name}</td>
        <td class="px-6 py-4" data-column="service_filter">${appointment.service_type}</td>
        <td class="px-6 py-4" data-column="status_filter">${appointment.status}</td>
        <td class="px-6 py-4" data-column="appointment_filter">
          ${appointment.appointment_location === "Local Nuclear Tattoo"
          ? "Local Nuclear Tattoo"
          : appointment.domicile_address || "Domicilio"}
        </td>
        <td class="px-6 py-4" data-column="start_date_filter">
          ${new Date(appointment.start_date_time).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })} - ${new Date(appointment.start_date_time).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </td>
        <td class="px-6 py-4">${buttons}</td>
      `;
      appointmentsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error al cargar las citas:", error);
    appointmentsTable.innerHTML = `<tr><td colspan="7">Error al cargar las citas.</td></tr>`;
  }
}

/**
 * Maneja la eliminación de una cita al hacer clic en "Eliminar"
 */
document.addEventListener('click', async (e) => {
  if (e.target.matches('.eliminar-cita')) {
    e.preventDefault();

    const id = e.target.dataset.id;
    if (!id) {
      console.error('No se encontró el id de la cita');
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar cita?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'La cita fue eliminada exitosamente.',
          confirmButtonText: 'OK'
        });
        loadAppointments();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la cita.'
        });
      }
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado.'
      });
    }
  }
});


/**
 * Maneja la confirmación de una cita al hacer clic en "Confirmar"
 */
document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-confirm')) {
    e.preventDefault();

    const id = e.target.dataset.id;
    if (!id) {
      console.error('No se encontró el id de la cita');
      return;
    }

    const result = await Swal.fire({
      title: '¿Confirmar cita?',
      text: '¿Estás seguro de que deseas confirmar esta cita?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#38a169', // verde
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmada' }),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Cita confirmada',
          text: 'La cita fue confirmada correctamente',
          confirmButtonText: 'OK'
        });
        loadAppointments();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo confirmar la cita.'
        });
      }
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado.'
      });
    }
  }
});

/**
 * Maneja la cancelación de una cita al hacer clic en "Cancelar"
 */
document.addEventListener('click', async (e) => {
  if (e.target.matches('.btn-cancel')) {
    e.preventDefault();

    const id = e.target.dataset.id;
    if (!id) {
      console.error('No se encontró el id de la cita');
      return;
    }

    const result = await Swal.fire({
      title: '¿Cancelar cita?',
      text: '¿Estás seguro de que deseas cancelar esta cita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#f59e0b', // amarillo
      cancelButtonColor: '#6b7280' // gris
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelada' }),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Cita cancelada',
          text: 'La cita fue cancelada exitosamente',
          confirmButtonText: 'OK'
        });
        loadAppointments();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cancelar la cita.'
        });
      }
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado.'
      });
    }
  }
});

// Cargar citas al cargar la página
document.addEventListener('DOMContentLoaded', loadAppointments);

/**
 * Maneja la apertura del modal de edición de citas
 */
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('btn-edit')) {
    event.preventDefault();

    const row = event.target.closest('tr');
    const appointmentId = row.getAttribute('data-id');
    editForm.dataset.id = appointmentId;

    const clientName = row.querySelector('th').textContent.trim();
    const employeeName = row.querySelectorAll('td')[0].textContent.trim();
    const serviceType = row.querySelectorAll('td')[1].textContent.trim();
    const status = row.querySelectorAll('td')[2].textContent.trim();
    const appointmentLocationText = row.querySelectorAll('td')[3].textContent.trim();
    const startDateTime = row.getAttribute('data-start');
    const address = appointmentLocationText === 'Domicilio' ? row.getAttribute('data-address') : '';

    // Convertir fecha y hora a formato compatible con datetime-local
    const rawDate = new Date(startDateTime);
    const offsetDate = new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000);
    const formattedDateTime = offsetDate.toISOString().slice(0, 16);

    // Determinar ubicación de la cita
    const appointmentLocation = appointmentLocationText === 'Local Nuclear Tattoo'
      ? 'Local Nuclear Tattoo'
      : 'Domicilio';

    // Asignar valores al formulario del modal
    document.getElementById('edit_customer_name').value = clientName;
    document.getElementById('edit_employee_preference').value = employeeName;
    document.getElementById('edit_appointment_type').value = serviceType;
    document.getElementById('edit_status').value = status;
    document.getElementById('edit_appointment_date').value = formattedDateTime;
    document.getElementById('edit_place').value = appointmentLocation;

    const addressField = document.getElementById('edit_address');
    const addressContainer = document.getElementById('edit_addressField');

    if (appointmentLocation === 'Domicilio') {
      console.log('Dirección asignada:', appointmentLocationText); // Debug
      addressContainer.style.display = 'block';
      addressField.value = appointmentLocationText;
      addressField.disabled = false;
    } else {
      addressContainer.style.display = 'none';
      addressField.value = '';
      addressField.disabled = true;
    }

    // Manejar cambios en el campo de ubicación
    document.getElementById('edit_place').addEventListener('change', function () {
      const selectedValue = this.value;

      if (selectedValue === 'Domicilio') {
        addressContainer.style.display = 'block';
        addressField.disabled = false;
      } else {
        addressContainer.style.display = 'none';
        addressField.value = appointmentLocationText;
        addressField.disabled = true;
      }
    });

    // Mostrar el modal de edición
    document.getElementById('editModal').classList.remove('hidden');
  }
});

/**
 * Oculta el modal de edición al cancelar
 */
document.getElementById('cancelEdit').addEventListener('click', function () {
  document.getElementById('edit_addressField').style.display = 'none'; // Ocultar dirección
  editModal.classList.add('hidden');
});

/**
 * Maneja la actualización de citas al guardar los cambios desde el modal de edición
 */
const editForm = document.getElementById('editAppointmentForm');

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  const id = editForm.dataset.id;

  const newToken = localStorage.getItem("token");
  const newUser = newToken ? getUserFromToken(newToken) : null;
  const userId = newUser ? newUser.id : null;

  const data = {
    id_user: userId,
    employee_name: editForm.edit_employee_preference.value,
    client_name: editForm.edit_customer_name.value,
    start_date_time: editForm.edit_appointment_date.value,
    end_date_time: new Date(editForm.edit_appointment_date.value).toISOString(),
    service_type: editForm.edit_appointment_type.value,
    status: editForm.edit_status.value,
    appointment_location: editForm.edit_place.value,
    creation_date_time: new Date().toISOString(),
    domicile_address: editForm.edit_place.value === 'Domicilio' ? editForm.edit_address.value : null,
  };

  try {
    const res = await fetch(`http://localhost:3001/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Cita actualizada',
        text: 'Los cambios se guardaron correctamente',
        confirmButtonText: 'OK'
      });

      editForm.reset();
      document.getElementById('editModal').classList.add('hidden');
      loadAppointments(); // Recargar tabla
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la cita'
      });
    }
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: 'Hubo un problema al actualizar la cita'
    });
  }
});