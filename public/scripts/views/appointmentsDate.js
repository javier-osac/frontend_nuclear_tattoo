document.addEventListener('DOMContentLoaded', () => {
  const dateInputs = [
    document.getElementById('appointment_date'),
    document.getElementById('edit_appointment_date'),
  ];

  // Obtener la fecha y hora actual en la zona horaria local
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes en formato 2 dígitos
  const day = String(now.getDate()).padStart(2, '0'); // Día en formato 2 dígitos
  const hours = String(now.getHours()).padStart(2, '0'); // Horas en formato 2 dígitos
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Minutos en formato 2 dígitos

  // Construir la fecha mínima en formato "YYYY-MM-DDTHH:mm"
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Establecer el atributo min para los inputs de fecha si existen
  dateInputs.forEach((input) => {
    if (input) {
      input.min = formattedDate;
    }
  });
});