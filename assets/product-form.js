if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
      
        // Extract the product ID from the URL
        const URL = window.location.href;
        const productId = URL.split('=')[1];
      
        // Check if the submit button is disabled
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;
      
        // Handle error messages if any
        this.handleErrorMessage();
      
        // Disable the submit button and show loading state
        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');
      
        // Prepare fetch configuration
        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];
      
        // Create form data from the form
        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;
      
        // Add the product to the cart
        fetch(`${routes.cart_add_url}`, config)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((response) => {
            if (response.status) {
              // Handle cart error
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
      
              // Show sold-out message if applicable
              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButton.querySelector('span').classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              // Redirect to cart page if cart is not available
              window.location = window.routes.cart_url;
              return;
            }
      
            // Check if the added product's ID is 40729870794823
            if (formData.get('id') === '40729870794823') {
              console.log("Inside IF")
              // Add another product with ID 6975226249287 to the cart
              fetch(`${routes.cart_add_url}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: '40729619562567', // ID of the additional product to be added
                  quantity: 1, // Quantity of the additional product
                }),
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  return response.json();
                })
                .then((response) => {
                  // Handle the response if needed
                })
                .catch((error) => {
                  console.error('Error adding additional product to cart:', error);
                });
            }
      
            // Publish cart update event if no error
            if (!this.error) {
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
              this.error = false;
            }
      
            // Handle quick add modal if applicable
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          })
          .finally(() => {
            // Reset button state and hide loading spinner
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }
      

      
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", function() {

  document.querySelector(".select__select").selectedIndex = 0;

 
  var radios = document.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => {
    radio.checked = false;
  });

 
  var ulElement = document.querySelector('.ul_parent');
  if (ulElement) {
    var thumbnail = ulElement.querySelector('li:nth-child(2)');
    if (thumbnail) {
      thumbnail.style.display = 'none';
    }
  }
});
