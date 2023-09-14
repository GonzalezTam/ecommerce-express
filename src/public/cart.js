/* eslint-disable no-undef */
const checkoutButton = document.getElementById('order-checkout-button');
const removeFromCartButton = document.getElementById('remove-from-cart-button');
const cartId = document.getElementById('my-cart').getAttribute('data-cart-id');

document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'remove-from-cart-button') {
    const productId = e.target.getAttribute('data-product-id');
    swal.fire({
      title: 'Are you sure?',
      text: 'You are about to remove this product from your cart',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        removeProductFromCart(cartId, productId);
      }
    });
  }
}, false);

checkoutButton.addEventListener('click', function (e) {
  if (cartId) checkProductAvailability(cartId);
  checkoutButton.disabled = true;
}, false);

const removeProductFromCart = async (cartId, productId) => {
  removeFromCartButton.disabled = true;
  fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 200) {
        Swal.fire({
          icon: 'success',
          showConfirmButton: false
        });
        document.location.reload();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: data.error
        });
        removeFromCartButton.disabled = false;
      }
    })
    .catch(err => console.error(err));
};

const checkProductAvailability = async (cartId) => {
  fetch(`/api/products/purchase/${cartId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        if (data.status === 404) throw new Error(data.error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          html: '<p>Cannot checkout, products not available. <br> Please remove them from your cart and try again.</p>'
        });
        checkoutButton.disabled = false;
        return;
      }
      if (data.result) {
        let timerInterval;
        Swal.fire({
          title: 'Thank you for your purchase!',
          html: 'Your order has been submitted!',
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            timerInterval = setInterval(() => {}, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          }
        });
        submitOrder(data.result);
      }
    })
    .catch(err => console.error(err));
};

const submitOrder = async (order) => {
  fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 201) {
        const ticketCode = data.result.ticket.code;
        const warning = order.operations.notEnoughRequested.length;
        document.location.href = warning > 0 ? `/purchase/${ticketCode}?warning=${warning}` : `/purchase/${ticketCode}`;
      } else {
        document.location.href = '/purchase/error';
      }
    });
};
