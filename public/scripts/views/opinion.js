import { getUserFromToken } from "../../../src/utils/auth.js";
import Swal from '../../../node_modules/sweetalert2';

const token = localStorage.getItem("token");
const user = token ? getUserFromToken(token) : null;
const hasPermission = user && user.permissions.includes("see_comments");

// Función para enviar una nueva opinión
async function submitOpinion(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const opinion = {
    name: formData.get("name"),
    qualification: formData.get("rating"),
    opinion_date: formData.get("visit_date"),
    service: formData.get("service"),
    description: formData.get("comment"),
  };

  try {
    const response = await fetch('http://localhost:3001/opinion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opinion),
    });

    if (!response.ok) {
      throw new Error('Error al enviar la opinión');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Opinión enviada',
      text: 'Gracias por compartir tu experiencia',
    });

    form.reset();
    fetchOpinions();
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo enviar la opinión',
    });
  }
}

// Función para obtener opiniones desde la API
async function fetchOpinions() {
    try {
        const response = await fetch('http://localhost:3001/opinion');
        if (!response.ok) {
            throw new Error('Error al obtener las opiniones');
        }
        const opinions = await response.json();
        renderOpinions(opinions);
    } catch (error) {
        console.error('Error:', error);
    }
}

function attachDeleteEvent() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            deleteOpinion(id);
        });
    });
}

// Llama a attachDeleteEvent después de renderizar las opiniones
function renderOpinions(opinions) {
    const tbody = document.querySelector('#protected-section table tbody');
    tbody.innerHTML = opinions.map(opinion => {
        const opinionDate = new Date(opinion.opinion_date);

        const formattedDate = opinionDate.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        return `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-6 py-4">${opinion.name}</td>
            <td class="px-6 py-4">${formattedDate}</td>
            <td class="px-6 py-4">${opinion.service}</td>
            <td class="px-6 py-4">${'⭐'.repeat(opinion.qualification)}</td>
            <td class="px-6 py-4">${opinion.description}</td>
            ${hasPermission
                ? `<td class="px-6 py-4">
                        <button class="delete-button font-medium text-red-600 dark:text-red-500 hover:underline" data-id="${opinion.id_opinion}">
                            Eliminar
                        </button>
                    </td>`
                : ''
            }
        </tr>`;
    }).join('');

    // Asocia el evento solo si hasPermission es verdadero
    if (hasPermission) {
        attachDeleteEvent();
    }
}


// Llamar a la función para obtener y renderizar las opiniones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchOpinions();

    // Asociar evento de envío al formulario
    const form = document.querySelector('form');
    form.addEventListener('submit', submitOpinion);
});

// Función para eliminar una opinión
async function deleteOpinion(id) {
  const result = await Swal.fire({
    title: '¿Eliminar opinión?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`http://localhost:3001/opinion/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la opinión');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Eliminada',
      text: 'La opinión fue eliminada correctamente',
    });

    fetchOpinions();
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: 'No se pudo eliminar la opinión',
    });
  }
}