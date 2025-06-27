// Variables globales
let deleteMode = false;
let currentIndex = 0;
let isAnimating = false;
let images = [];

// ----------------------
// Inicialización de Modales
// ----------------------
function initModalEvents() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");
  const prevImage = document.getElementById("prevImage");
  const nextImage = document.getElementById("nextImage");

  if (!modal || !modalImg || !closeModal || !prevImage || !nextImage) return;

  // Cerrar modal
  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // Navegación en el modal
  prevImage.addEventListener("click", () => navigate(-1));
  nextImage.addEventListener("click", () => navigate(1));

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("hidden")) {
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") modal.classList.add("hidden");
    }
  });
}

// Abrir el modal con una imagen específica
function openModal(index) {
  if (deleteMode) return;

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");

  currentIndex = index;
  modalImg.src = images[currentIndex].src;
  modal.classList.remove("hidden");
}

// Navegación entre imágenes en el modal
function navigate(direction) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");

  if (!modal || !modalImg || isAnimating) return;

  isAnimating = true;
  const animationClass = direction === 1 ? "slide-out-left" : "slide-out-right";
  modalImg.classList.add(animationClass);

  setTimeout(() => {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    modalImg.src = images[currentIndex].src;
    modalImg.classList.remove(animationClass);
    modalImg.classList.add(direction === 1 ? "slide-in-right" : "slide-in-left");

    setTimeout(() => {
      modalImg.classList.remove("slide-in-right", "slide-in-left");
      isAnimating = false;
    }, 300);
  }, 300);
}

// ----------------------
// Inicialización de la Galería
// ----------------------
function initGallery() {
  images = document.querySelectorAll("#galeria img");
  images.forEach((img, index) => {
    if (!img.classList.contains("event-binded")) {
      img.addEventListener("click", () => openModal(index));
      img.classList.add("event-binded");
    }
  });
}

// ----------------------
// Modal para Agregar Imagen
// ----------------------
function initAddImageModal() {
  const addImageModal = document.getElementById("addImageModal");
  const openAddBtn = document.querySelector(".agregar-imagen");
  const cancelAddBtn = document.getElementById("cancelAddImage");

  if (!addImageModal || !openAddBtn || !cancelAddBtn) return;

  // Abrir modal para agregar imagen
  openAddBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addImageModal.classList.remove("hidden");
  });

  // Cerrar modal al cancelar
  cancelAddBtn.addEventListener("click", () => {
    addImageModal.classList.add("hidden");
  });

  // Cerrar modal al hacer clic fuera del formulario
  addImageModal.addEventListener("click", (e) => {
    if (e.target === addImageModal) {
      addImageModal.classList.add("hidden");
    }
  });

  // Manejo del formulario de agregar imagen
  const form = document.getElementById("addImageForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        const response = await fetch("http://localhost:3001/gallery", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          alert("Imagen subida correctamente");
          mostrarImagenes();
          form.reset();
          addImageModal.classList.add("hidden");
        } else {
          alert("Error al subir imagen");
        }
      } catch (err) {
        console.error(err);
        alert("Error del servidor");
      }
    });
  }
}

// ----------------------
// Mostrar Imágenes
// ----------------------
async function mostrarImagenes() {
  let contenedor = null;
  for (let i = 0; i < 10; i++) {
    contenedor = document.getElementById("galeria");
    if (contenedor) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (!contenedor) return;
  contenedor.innerHTML = "";

  try {
    const response = await fetch("http://localhost:3001/gallery");
    const data = await response.json();

    data.forEach((img) => {
      const elemento = document.createElement("img");
      elemento.src = "http://localhost:3001" + img.image_url;
      elemento.alt = img.tittle;
      elemento.loading = "lazy";
      elemento.dataset.id = img.gallery_id;
      elemento.classList.add("rounded-lg", "shadow-lg", "mx-2", "my-2");
      elemento.style.maxWidth = "250px";
      elemento.style.height = "auto";
      contenedor.appendChild(elemento);
    });

    initGallery();
  } catch (error) {
    console.error("Error al cargar imágenes:", error);
  }
}

// ----------------------
// Modo de Eliminación
// ----------------------
function initDeleteMode() {
  const btnToggleDeleteMode = document.getElementById("btnToggleDeleteMode");
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");
  const galeria = document.getElementById("galeria");

  if (!btnToggleDeleteMode || !btnConfirmDelete || !galeria) return;

  const selectedImages = new Set();

  // Alternar modo de eliminación
  btnToggleDeleteMode.addEventListener("click", () => {
    deleteMode = !deleteMode;
    selectedImages.clear();
    btnConfirmDelete.style.display = deleteMode ? "inline-block" : "none";

    [...galeria.querySelectorAll("img")].forEach((img) => {
      img.style.cursor = deleteMode ? "pointer" : "default";
      img.classList.remove("selected-to-delete");
    });

    btnToggleDeleteMode.textContent = deleteMode
      ? "Cancelar eliminación"
      : "Eliminar imágenes";
  });

  // Selección de imágenes para eliminar
  galeria.addEventListener("click", (e) => {
    if (!deleteMode) return;
    const target = e.target;
    if (target.tagName === "IMG") {
      const id = target.dataset.id;
      if (!id) return;

      if (selectedImages.has(id)) {
        selectedImages.delete(id);
        target.classList.remove("selected-to-delete");
      } else {
        selectedImages.add(id);
        target.classList.add("selected-to-delete");
      }
    }
  });

  // Confirmar eliminación de imágenes
  btnConfirmDelete.addEventListener("click", async () => {
    if (selectedImages.size === 0) {
      alert("No has seleccionado imágenes para eliminar.");
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar ${selectedImages.size} imagen(es)?`)) return;

    for (const id of selectedImages) {
      try {
        const res = await fetch(`http://localhost:3001/gallery/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (!result.success) {
          console.error(`Error al eliminar imagen con id ${id}: ${result.message}`);
        }
      } catch (error) {
        console.error(`Error de red al eliminar imagen con id ${id}:`, error);
      }
    }

    alert("Imágenes eliminadas correctamente");
    selectedImages.clear();
    deleteMode = false;
    btnConfirmDelete.style.display = "none";
    btnToggleDeleteMode.textContent = "Eliminar imágenes";
    mostrarImagenes();
  });
}

// ----------------------
// Eventos de Inicialización
// ----------------------
const onSwap = () => {
  mostrarImagenes();
  initAddImageModal();
  initDeleteMode();
  initModalEvents();
};

document.addEventListener("astro:after-swap", onSwap);
document.addEventListener("DOMContentLoaded", onSwap);