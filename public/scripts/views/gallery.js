
let deleteMode = false;
    // Función para inicializar la galería
   // Variables globales para modal
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const prevImage = document.getElementById("prevImage");
const nextImage = document.getElementById("nextImage");
let currentIndex = 0;
let isAnimating = false;
let images = []; // Lo llenaremos en initGallery

// Solo se ejecuta 1 vez al cargar la página
let modalEventsInitialized = false;
function initModalEvents() {
   if (modalEventsInitialized) return;  
  modalEventsInitialized = true;

  closeModal.addEventListener("click", closeModalFunc);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalFunc();
  });
  prevImage.addEventListener("click", () => navigate(-1));
  nextImage.addEventListener("click", () => navigate(1));
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("hidden")) {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") closeModalFunc();
    }
  });
}

// Funciones del modal (abierto, cerrado, navegación)
function openModal(index) {
  if (deleteMode) {
    console.log("Modo eliminar activo. No se puede abrir el modal.");
    return;
  }
  currentIndex = index;
  modalImg.src = images[currentIndex].src;
  modal.classList.remove("hidden");
}
function closeModalFunc() {
  modal.classList.add("hidden");
}
function navigate(direction) {
  if (!modal.classList.contains("hidden") && !isAnimating) {
    isAnimating = true;
    let animationClass = direction === 1 ? "slide-out-left" : "slide-out-right";

    modalImg.classList.add(animationClass);

    setTimeout(() => {
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = images.length - 1;
      if (currentIndex >= images.length) currentIndex = 0;

      modalImg.src = images[currentIndex].src;
      modalImg.classList.remove(animationClass);
      modalImg.classList.add(direction === 1 ? "slide-in-right" : "slide-in-left");

      setTimeout(() => {
        modalImg.classList.remove("slide-in-right", "slide-in-left");
        isAnimating = false;
      }, 300);
    }, 300);
  }
}

// Se ejecuta cada vez que cargas las imágenes (cada vez que actualizas la galería)
function initGallery() {
  images = document.querySelectorAll("#galeria img");
  if (!images.length) return;

  images.forEach((img, index) => {
    if (!img.classList.contains('event-binded')) {
      img.addEventListener("click", () => openModal(index));
      img.classList.add('event-binded');
    }
  });
}



// Modal "Agregar Imagen"
let addImageModalInitialized = false;

function initAddImageModal(){
 if (addImageModalInitialized) return;
  addImageModalInitialized = true;

  const addImageModal = document.getElementById("addImageModal");
  const openAddBtn = document.querySelector(".agregar-imagen");
  const cancelAddBtn = document.getElementById("cancelAddImage");

openAddBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addImageModal.classList.remove("hidden");
});

cancelAddBtn.addEventListener("click", () => {
  addImageModal.classList.add("hidden");
});

// Cerrar modal al hacer clic fuera del contenido
addImageModal.addEventListener("click", (e) => {
  if (e.target === addImageModal) {
    addImageModal.classList.add("hidden");
  }
});
}

//script para guardar imagenes en el section

document.getElementById('addImageForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('http://localhost:3001/gallery', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      alert('Imagen subida correctamente');
      mostrarImagenes();
      form.reset();
      document.getElementById('addImageModal').classList.add('hidden');
    } else {
      alert('Error al subir imagen');
    }
  } catch (err) {
    console.error(err);
    alert('Error del servidor');
  }
});

async function mostrarImagenes() {
    let contenedor: HTMLElement | null = null;

  for (let i = 0; i < 10; i++) { // Intentar durante ~1s
    contenedor = document.getElementById('galeria');
    if (contenedor) break;
    await new Promise(r => setTimeout(r, 100)); // Espera 100ms
  }

  if (!contenedor) {
    
    console.warn("Contenedor 'galeria' no encontrado después de varios intentos.");
    return;
  }
   contenedor.innerHTML = ""; // ✅ Limpiar el contenedor solo si existe


  try {
    const response = await fetch('http://localhost:3001/  gallery');
    const data = await response.json();
    console.log('Datos recibidos:', data);

    data.forEach((img) => {
      
      const elemento = document.createElement('img');
      elemento.src = 'http://localhost:3001' + img.image_url;
      elemento.alt = img.tittle;
      elemento.loading = 'lazy';
      elemento.dataset.id = img.gallery_id; //identificar imagen por id
      elemento.classList.add('rounded-lg', 'shadow-lg', 'mx-2', 'my-2');
      elemento.style.maxWidth = '250px';
      elemento.style.height = 'auto';
      contenedor.appendChild(elemento);
    });
      initGallery();
  } catch (error) {
    console.error('Error al cargar imágenes:', error);
  }
}



//script para eliminar Imagenes
let deleteModeInitialized = false;
function initDeleteMode() {
  if (deleteModeInitialized) return; // evita reinicializar
  deleteModeInitialized = true;

  const btnToggleDeleteMode = document.getElementById('btnToggleDeleteMode');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  const galeria = document.getElementById('galeria');


const selectedImages = new Set();

btnToggleDeleteMode.addEventListener('click', () => {
  deleteMode = !deleteMode;
  selectedImages.clear();
  btnConfirmDelete.style.display = deleteMode ? 'inline-block' : 'none';

  // Cambiar apariencia de las imágenes para modo selección
  [...galeria.querySelectorAll('img')].forEach(img => {
    img.style.cursor = deleteMode ? 'pointer' : 'default';
    if (!deleteMode) {
      img.classList.remove('selected-to-delete');
    }
  });

  btnToggleDeleteMode.textContent = deleteMode ? 'Cancelar eliminación' : 'Eliminar imágenes';
});

galeria.addEventListener('click', (e) => {
  if (!deleteMode) return; 

  const target = e.target;
  if (target.tagName === 'IMG') {
    const id = target.dataset.id;
     if (!id) return; 

    if (selectedImages.has(id)) {
      selectedImages.delete(id);
      target.classList.remove('selected-to-delete');
    } else {
      selectedImages.add(id);
      target.classList.add('selected-to-delete');
    }
    return
  }
});


btnConfirmDelete.addEventListener('click', async () => {
  if (selectedImages.size === 0) {
    alert('No has seleccionado imágenes para eliminar.');
    return;
  }

  if (!confirm(`¿Seguro que quieres eliminar ${selectedImages.size} imagen(es)?`)) {
    return;
  }

  // Llamar a la API para eliminar todas las imágenes seleccionadas
  for (const id of selectedImages) {
    try {
      const res = await fetch(`http://localhost:3001/gallery/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) {
        console.error(`Error al eliminar imagen con id ${id}: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error de red al eliminar imagen con id ${id}:`, error);
    }
  }

  alert('Imágenes eliminadas correctamente');
  selectedImages.clear();
  deleteMode = false;
  btnConfirmDelete.style.display = 'none';
  btnToggleDeleteMode.textContent = 'Eliminar imágenes';

  // Recargar galería
  mostrarImagenes();
});
}


// Cada vez que cambie la página (swap)
const onSwap = () => {
  mostrarImagenes();       // refresca imágenes y llama initGallery()
  initAddImageModal();     // botones modal "Agregar"
  initDeleteMode();        // botones "Eliminar"
  initModalEvents(); // eventos globales del modal (cerrar, flechas, teclado)
};
document.addEventListener("astro:after-swap", onSwap);

document.addEventListener("DOMContentLoaded", onSwap);



