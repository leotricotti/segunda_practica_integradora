// Crear una instancia del socket
const socketIo = io();

// Mensaje que indica que el cliente se ha conectado
socketIo.emit("mesagge", "Hola soy un cliente");

// Obtener el formulario de agregar producto
const form = document.getElementById("add-product-form");
form.addEventListener("submit", handleSubmit);

// Función para manejar el envío del formulario
async function handleSubmit(e) {
  e.preventDefault();

  const { title, description, code, price, stock, category, thumbnail } =
    form.elements;
  if (
    !title.value ||
    !description.value ||
    !code.value ||
    !price.value ||
    !stock.value ||
    !category.value ||
    !thumbnail.value
  ) {
    return Swal.fire({
      icon: "error",
      title: "Lo siento...",
      text: "Todos los campos son necesarios!",
      focusConfirm: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
    });
  } else {
    const product = {
      title: title.value,
      description: description.value,
      code: code.value,
      price: price.value,
      stock: stock.value,
      category: category.value,
      thumbnail: thumbnail.value,
    };
    const response = await fetch("/api/realtimeproducts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal! Vuelve a intentarlo",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Producto agregado con exito!",
        showConfirmButton: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
      });
    }
  }
  refreshPage();
  // Limpiar todos los campos del formulario
  for (let i = 0; i < form.elements.length; i++) {
    form.elements[i].value = "";
  }
}

// Función para actualizar la lista de productos
async function updateProductList(products) {
  if (products.length > 0) {
    const productList = document.getElementById("products-list");
    productList.innerHTML = "";

    products.forEach((product) => {
      const container = document.createElement("div");
      container.classList.add("list-group-item");
      //Capturar la url de la imagen
      const imageUrl = product.thumbnail[0]["img1"];

      container.innerHTML = `
        <div class="d-flex w-100 justify-content-between flex-column">
          <h2 class="mb-1 subtitle">${product.title}</h2>
          <p class="mb-1"><strong>Descripción:</strong> ${product.description}</p>
          <p class="mb-1"><strong>Codigo:</strong> ${product.code}</p>
          <p class="mb-1"><strong>Precio:</strong> ${product.price}</p>
          <p class="mb-1"><strong>Status:</strong> ${product.status}</p>
          <p class="mb-1"><strong>Stock:</strong> ${product.stock}</p>
          <p class="mb-1"><strong>Categoria:</strong> ${product.category}</p>
        </div>
        <img src="${imageUrl}" alt="img" width="150" class="thumbnail position-absolute me-5 mt-5 end-0 top-0">
        <button type="button" class="btn btn-primary delete-product-btn">Eliminar</button>
      `;

      const btnEliminar = container.querySelector(".delete-product-btn");
      btnEliminar.addEventListener("click", () => {
        eliminarProducto(product.id);
      });
      productList.appendChild(container);
    });
  } else {
    container.innerHTML = `
    <h1 class="title">Aún no has agrregado productos</h1>
  `;
  }
}

// Obtener la lista de productos
socketIo.on("products", (products) => {
  updateProductList(products);
});

// Eliminar un producto de la lista de productos
function eliminarProducto(id) {
  socketIo.emit("deleteProduct", id);
  socketIo.on("products", (products) => {
    updateProductList(products);
  });
  Swal.fire({
    icon: "success",
    title: "Producto eliminado con exito!",
    showConfirmButton: true,
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
  });
}

// Paginación
const btnNextPage = document.getElementById("next-page");

let page = 1;
socketIo.emit("nextPage", page);

const nextPage = () => {
  page++;
  socketIo.emit("nextPage", page);
};

//Ir a productos
const goToProducts = () => {
  window.location.href = "/api/products?page=1";
};

//Refrescar pagina
const refreshPage = () => {
  window.location.reload();
};
