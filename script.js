document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const dropdown = document.querySelector(".dropdown");
  const cartItemCountSpan = document.getElementById("cart-item-count");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    });
  }

  if (dropdown) {
    dropdown.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle("open");
      }
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768 && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          if (dropdown) {
            dropdown.classList.remove("open");
          }
          if (menuToggle) {
            const icon = menuToggle.querySelector("i");
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
          }
        }
      });
    });
  }

  let cart = [];

  function loadCart() {
    try {
      const storedCart = localStorage.getItem("fusionRackCart");
      if (storedCart) {
        cart = JSON.parse(storedCart);
      }
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
      cart = [];
    }
    updateCartCount();
  }

  function saveCart() {
    localStorage.setItem("fusionRackCart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartItemCountSpan) {
      cartItemCountSpan.textContent = `(${totalItems})`;
    }
  }

  function addToCart(product) {
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    alert(`${product.name} added to cart!`);
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    if (document.body.classList.contains("cart-page")) {
      renderCartItems();
    }
  }

  function updateQuantity(productId, newQuantity) {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      const parsedQuantity = parseInt(newQuantity);
      if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
        item.quantity = parsedQuantity;
      } else if (parsedQuantity <= 0) {
        removeFromCart(productId);
        return;
      }
      saveCart();
      if (document.body.classList.contains("cart-page")) {
        renderCartItems();
      }
    }
  }

  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
      };

      if (
        product.id &&
        product.name &&
        !isNaN(product.price) &&
        product.image
      ) {
        addToCart(product);
      } else {
        console.error(
          "Missing or invalid product data for Add to Cart:",
          product
        );
        alert("Could not add item to cart. Missing product information.");
      }
    });
  });

  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalSpan = document.getElementById("cart-total");
  const cartSummaryDiv = document.getElementById("cart-summary");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const checkoutBtn = document.getElementById("checkout-btn");

  function renderCartItems() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      emptyCartMessage.classList.remove("hidden");
      cartSummaryDiv.classList.add("hidden");
    } else {
      emptyCartMessage.classList.add("hidden");
      cartSummaryDiv.classList.remove("hidden");

      let total = 0;
      cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" />
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease-quantity" data-id="${
                      item.id
                    }">-</button>
                    <input type="number" value="${
                      item.quantity
                    }" min="1" class="quantity-input" data-id="${item.id}" />
                    <button class="quantity-btn increase-quantity" data-id="${
                      item.id
                    }">+</button>
                </div>
                <div class="item-price">₹${(item.price * item.quantity).toFixed(
                  2
                )}</div>
                <button class="remove-item-btn" data-id="${
                  item.id
                }">Remove</button>
            `;
        cartItemsContainer.appendChild(itemElement);
        total += item.price * item.quantity;
      });

      cartTotalSpan.textContent = total.toFixed(2);

      document.querySelectorAll(".decrease-quantity").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          const input = cartItemsContainer.querySelector(
            `.quantity-input[data-id="${id}"]`
          );
          if (input) updateQuantity(id, parseInt(input.value) - 1);
        });
      });

      document.querySelectorAll(".increase-quantity").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = e.target.dataset.id;
          const input = cartItemsContainer.querySelector(
            `.quantity-input[data-id="${id}"]`
          );
          if (input) updateQuantity(id, parseInt(input.value) + 1);
        });
      });

      document.querySelectorAll(".quantity-input").forEach((input) => {
        input.addEventListener("change", (e) => {
          const id = e.target.dataset.id;
          updateQuantity(id, e.target.value);
        });
      });

      document.querySelectorAll(".remove-item-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          removeFromCart(e.target.dataset.id);
        });
      });
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length > 0) {
        alert("Proceeding to checkout! (This is a placeholder action)");
        cart = [];
        saveCart();
        renderCartItems();
      } else {
        alert("Your cart is empty. Please add items before checking out.");
      }
    });
  }

  loadCart();

  if (document.body.classList.contains("cart-page")) {
    renderCartItems();
  }
});
