const form = document.querySelector('form');
const editModal = document.getElementById('editModal');
    

    //CREAR LA CITA Y ENVIARLA AL BACKEND CON UN FECTCH
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();   
      
      const data = {
        id_user: 2,
        employee_name: form.employee_preference.value,
        client_name: form.customer_name.value,
        start_date_time: form.appointment_date.value,
        end_date_time: form.appointment_date.value,
        service_type: form.appointment_type.value,
        status: 'Pendiente',
        appointment_location: form.place.value,
        creation_date_time: new Date().toISOString(),
        domicile_address: form.place.value === 'Domicilio' ? form.address.value : null
      };
  
      const res = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (res.ok) {
        alert('Cita creada exitosamente');
        form.reset();
        loadAppointments(); // Cargar la tabla actualizada 
      } else {
        alert('Error al crear la cita');
      }
    });

    //SCRIPT PARA AGREGAR UNA DIRECCION AL SELECCIONAR EL CAMPO DE DOMICILIO EN EL FORMULARIO DE AGENDA.
    document.addEventListener("DOMContentLoaded", function () {
    const placeSelect = document.getElementById("place");
    const addressField = document.getElementById("addressField");

    placeSelect.addEventListener("change", function () {
      if (this.value === "Domicilio") {
        addressField.style.display = "block";
      } else {
        addressField.style.display = "none";
      }
    });
  });


    //SCRIPT PARA AGREGAR AGENDAMIENTO EN EL LISTADO DE CITAS (TABLE).
    const appointmentsTable = document.getElementById('appointmentsTable')
  
    async function loadAppointments() {
      const updatedAppointments = await fetch('http://localhost:3001/appointments');
      const appointments = await updatedAppointments.json();
  
      // Limpia las filas anteriores
      appointmentsTable.innerHTML = '';
  
      // Inserta las nuevas filas
      appointments.forEach((appointment) => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', appointment.id_appointment); 
        row.setAttribute('data-start', appointment.start_date_time); // fecha y hora completa
        row.setAttribute('data-address', appointment.address || ''); // asegúrate que el backend devuelve este campo

        row.classList.add(
          'bg-white',
          'border-b',
          'dark:bg-gray-800',
          'dark:border-gray-700',
          'border-gray-200'
        );
        // se puede usar si quieres
        
  
        row.innerHTML = `
          <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            ${appointment.client_name}
          </th>
          <td class="px-6 py-4">${appointment.employee_name}</td>
          <td class="px-6 py-4">${appointment.service_type}</td>
          <td class="px-6 py-4">${appointment.status}</td>
          <td class="px-6 py-4">
            ${appointment.appointment_location === 'local'
              ? 'Local Nuclear Tattoo'
              : appointment.domicile_address || 'Domicilio'}
          </td>

          
        <td class="px-6 py-4">
        ${new Date(appointment.start_date_time).toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} - ${new Date(appointment.start_date_time).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
        </td>

          <td class="px-6 py-4">
            <a href="javascript:void(0)" 
            class="btn-edit font-medium text-blue-600 dark:text-blue-500 hover:underline" 
            data-id="${appointment.id_appointment}">
            Editar
          </a>

            <a href="javascript:void(0)" 
              class="eliminar-cita font-medium text-red-600 dark:text-red-500 hover:underline ml-4" 
              data-id="${appointment.id_appointment}">
              Eliminar
            </a>
          </td>
        `;
  
        appointmentsTable.appendChild(row);
      });
    }

  //SCRIPT PARA ELIMINAR LAS CITAS.
    document.addEventListener('click', async (e) => {
      if (e.target.matches('.eliminar-cita')) {
        e.preventDefault();
  
        const id = e.target.dataset.id;
  
        if (!id) {
          console.error('No se encontró el id de la cita');
          return;
        }
  
        const confirmed = confirm('¿Estás seguro de eliminar esta cita?');
        if (!confirmed) return;
  
        const res = await fetch(`http://localhost:3001/appointments/${id}`, {
          method: 'DELETE',
        });
              if (res.ok) {
        alert('Cita eliminada exitosamente');
        loadAppointments();
      } else {
        alert('Error al eliminar la cita');
      }
      

      }
    });
    
    // Cargar citas al cargar la página
    document.addEventListener('DOMContentLoaded', loadAppointments);
   //SCRIPT PARA EDITAR LAS CITAS
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('btn-edit')) {
    event.preventDefault();

    const row = event.target.closest('tr');
    const appointmentId = row.getAttribute('data-id'); 
    editForm.dataset.id = appointmentId; 

    const clientName = row.querySelector('th').textContent.trim();
    const employeeName = row.querySelectorAll('td')[0].textContent.trim();
    const serviceType = row.querySelectorAll('td')[1].textContent.trim();
    const appointmentLocationText = row.querySelectorAll('td')[3].textContent.trim().toLowerCase();
    const address = row.querySelectorAll('td')[3].textContent.trim();
    const startDateTime = row.getAttribute('data-start');

       // Convertir fecha y hora a formato compatible con datetime-local
    const rawDate = new Date(startDateTime);
    const offsetDate = new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000);
    const formattedDateTime = offsetDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

  //logica para agregar valor al campo de direccion.
    let appointmentLocation = 'domicilio';
    if (appointmentLocationText === 'local nuclear tattoo') {
      appointmentLocation = 'local';
    }  else if (appointmentLocationText === 'domicilio') {
  appointmentLocation = 'domicilio';
}
    // Asignar valores al modal
    document.getElementById('edit_customer_name').value = clientName;
    document.getElementById('edit_employee_preference').value = employeeName;
    document.getElementById('edit_appointment_type').value = serviceType.toLowerCase(); 
    document.getElementById('edit_appointment_date').value = formattedDateTime;
    document.getElementById('edit_place').value = appointmentLocation;
    

    // Mostrar u ocultar campo de dirección
    if (appointmentLocation === 'domicilio') {
      document.getElementById('edit_addressField').style.display = 'block';
      document.getElementById('edit_address').value = address;
    } else {
      document.getElementById('edit_addressField').style.display = 'none';
      document.getElementById('edit_address').value = '';
    }
    
    // CAMBIAR MOSTRAR/OCULTAR DIRECCIÓN SI SE CAMBIA EN EL SELECT DEL MODAL

    document.getElementById('edit_place').addEventListener('change', function () {
      const selectedValue = this.value;
      const addressField = document.getElementById('edit_address');
      const addressContainer = document.getElementById('edit_addressField');

      let lastAddressValue = ''; // almacenar la dirección temporalmente

      if (selectedValue === 'domicilio') {
        addressContainer.style.display = 'block';

        // Restaurar la dirección anterior si existe
        if (lastAddressValue) {
          addressField.value = lastAddressValue;
        }

      } else {
        addressContainer.style.display = 'none';

        // Guardar dirección antes de limpiar
        lastAddressValue = addressField.value;
        addressField.value = '';
      }

      
    });

    
    
    // Mostrar el modal
    document.getElementById('editModal').classList.remove('hidden');
  }
});
document.getElementById('cancelEdit').addEventListener('click', function () {
  //  limpia el formulario (Opcional)
  document.getElementById('edit_addressField').style.display = 'none'; // oculta dirección
  editModal.classList.add('hidden');
});



//logica para guardar datos cambiados al editar. 
const editForm = document.getElementById('editAppointmentForm');

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  const id = editForm.dataset.id; 

  const data = {
  id_user: 2,
  employee_name: editForm.edit_employee_preference.value,
  client_name: editForm.edit_customer_name.value,
  start_date_time: new Date(editForm.edit_appointment_date.value).toISOString(),
  end_date_time: new Date(editForm.edit_appointment_date.value).toISOString(),
  service_type: editForm.edit_appointment_type.value,
  status: 'Pendiente',
  appointment_location: editForm.edit_place.value,
  creation_date_time: new Date().toISOString(),
  domicile_address: editForm.edit_place.value === 'domicilio' ? editForm.edit_address.value : null
};


const res = await fetch(`http://localhost:3001/appointments/${id}`,{
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data), 
});

if (res.ok) {
  alert('Cita actualizada exitosamente');
  editForm.reset();
  document.getElementById('editModal').classList.add('hidden');
  loadAppointments(); // recargar tabla
} else {
  alert('Error al actualizar la cita');
}
});

