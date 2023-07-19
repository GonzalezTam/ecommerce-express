/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let productsArray = [];
let userCart;
let socket;

document.onreadystatechange = async () => {
  const products = (location.pathname === '/productsmanager') ? '/products/manager' : '/products';
  await fetch(`http://localhost:3000/api${products}?limit=all`)
    .then(res => res.json())
    .then(data => {
      productsArray = data.products.payload;
    })
    .catch(err => console.log(err));
};

const managerContainer = document.getElementById('manager-container');
const managerSubContainer = document.getElementById('manager-sub-container');
const managerTitle = document.getElementById('manager-title');
const submitProduct = document.getElementById('submitProduct');
const updateProduct = document.getElementById('updateProduct');
const removeProduct = document.getElementsByClassName('remove-product');
const editProduct = document.getElementsByClassName('edit-product');
const cart = document.getElementById('my-cart');
const title = document.getElementById('title');
const category = document.getElementById('category');
const description = document.getElementById('description');
const price = document.getElementById('price');
const stock = document.getElementById('stock');
const code = document.getElementById('code');
const adminPanelButton = document.getElementById('adminPanel-button');

document.addEventListener('click', function (e) {
  if (e.target.matches('.remove-product')) delete_product(e.target.dataset.id);
  if (e.target.matches('.edit-product')) edit_product(e.target.dataset.id);
  if (userCart && userCart._id) {
    if (e.target.matches('.add-to-cart')) update_cart(e.target.dataset.id);
  } else {
    if (e.target.matches('.add-to-cart')) create_cart(e.target.dataset.id);
  }
  if (e.target.matches('#adminPanel-button')) {
    e.preventDefault();
    document.location.href = '/productsmanager';
  }
}, false);

socket = io();
socket.on('new_product', data => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  document.location.href = `/productsmanager?${urlParams}`;
});
socket.on('update_product', data => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  document.location.href = `/productsmanager?${urlParams}`;
});
socket.on('delete_product', data => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  document.location.href = `/productsmanager?${urlParams}`;
});
socket.on('cartCreated', data => {
  userCart = { _id: data._id, products: data.products };
  const userCartLength = userCart.products?.length || 0;
  cart.innerHTML = '🛒 (' + userCartLength + ')';
});
socket.on('cartUpdated', data => {
  userCart = { _id: data._id, products: data.products };
  let userCartLength = 0;
  for (const p of userCart.products) {
    userCartLength += p.quantity;
  }
  cart.innerHTML = '🛒 (' + userCartLength + ')';
});

async function delete_product (id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, remove it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        fetch(`http://localhost:3000/api/products/${id}`, {
          method: 'delete'
        }).then(async (response) => {
          const data = await response.json();
          if (data.status === 200) {
            const swalNoConfirmButton = Swal.mixin({
              showConfirmButton: false
            });
            swalNoConfirmButton.fire(
              'Deleted!',
              'Product has been deleted.',
              'success',
              setTimeout(() => {
                socket = io();
                socket.emit('productDelete', data.deletedProduct);
              }, 1000)
            );
          } else if (data.status === 400) {
            console.error(data.error);
            Swal.fire(
              'Ups!',
              'Something went wrong.',
              'error'
            );
          } else {
            Swal.fire(
              'Ups!',
              'Something went wrong.',
              'error'
            );
            throw new Error('Unexpected response');
          }
        });
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    }
  });
}

async function edit_product (id) {
  const product = productsArray.find(p => p._id === id);
  managerTitle.innerHTML = 'Edit product or <a href="/productsmanager">create new</a>';
  title.value = product.title;
  category.value = product.category;
  description.value = product.description;
  price.value = product.price;
  stock.value = product.stock;
  code.value = product.code;
  updateProduct.disabled = false;
  updateProduct.dataset.id = id;
  submitProduct.disabled = true;
}

async function create_cart (id) {
  // console.log('first_in_cart', id);
  try {
    const body = {
      products: [
        {
          productId: id,
          quantity: 1
        }
      ]
    };
    const response = await fetch('http://localhost:3000/api/carts', {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 200) {
      const data = await response.json();
      socket = io();
      socket.emit('cartCreated', data.cartCreated);
    } else if (response.status === 400) {
      const data = await response.json();
      console.error(data.error);
    } else {
      throw new Error('Unexpected response');
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

async function update_cart (id) {
  const cartId = userCart._id;
  const productId = id;
  try {
    const response = await fetch(`http://localhost:3000/api/carts/${cartId}/products/${productId}`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 200) {
      const fetchUpdatedCart = await fetch(`http://localhost:3000/api/carts/${cartId}`);
      const dataUpdatedCart = await fetchUpdatedCart.json();
      socket = io();
      socket.emit('cartUpdated', dataUpdatedCart.cart);
    } else if (response.status === 400) {
      const data = await response.json();
      console.error(data.error);
    } else {
      throw new Error('Unexpected response');
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

submitProduct?.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!title.value || !category.value || !description.value || !price.value || !stock.value || !code.value) {
    Swal.fire(
      'Ups!',
      'All fields are required.',
      'error'
    );
  } else {
    try {
      const body = {
        title: title.value,
        category: category.value,
        description: description.value,
        price: parseInt(price.value),
        stock: parseInt(stock.value),
        code: code.value
      };
      fetch('http://localhost:3000/api/products', {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      }).then(async (response) => {
        const data = await response.json();
        if (data.status === 201) {
          const swalNoConfirmButton = Swal.mixin({
            showConfirmButton: false
          });
          swalNoConfirmButton.fire(
            'Success!',
            'A new product has been added.',
            'success',
            setTimeout(() => {
              socket = io();
              socket.emit('productSubmit', data.newProduct);
            }, 1000)
          );
        } else if (data.status === 400) {
          Swal.fire(
            'Ups!',
            'Something went wrong.',
            'error'
          );
          console.error(data.error);
        } else {
          throw new Error(data.error || 'Unexpected response');
        }
      });
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }
});

updateProduct?.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!title.value || !category.value || !description.value || !price.value || !stock.value || !code.value) {
    Swal.fire(
      'Ups!',
      'All fields are required.',
      'error'
    );
  } else {
    try {
      const body = {
        title: title.value,
        category: category.value,
        description: description.value,
        price: parseInt(price.value),
        stock: parseInt(stock.value),
        code: code.value
      };
      const id = updateProduct.dataset.id;
      fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'put',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      }).then(async (response) => {
        const data = await response.json();
        if (data.status === 200) {
          const swalNoConfirmButton = Swal.mixin({
            showConfirmButton: false
          });
          swalNoConfirmButton.fire(
            'Success!',
            'Product has been updated.',
            'success',
            setTimeout(() => {
              socket = io();
              socket.emit('productUpdate', data.updatedProduct);
            }, 1000)
          );
        } else if (data.status === 400) {
          console.error(data.error);
          Swal.fire(
            'Ups!',
            'Something went wrong.',
            'error'
          );
        } else {
          Swal.fire(
            'Ups!',
            'Something went wrong.',
            'error'
          );
          throw new Error('Unexpected response');
        }
      });
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }
});
