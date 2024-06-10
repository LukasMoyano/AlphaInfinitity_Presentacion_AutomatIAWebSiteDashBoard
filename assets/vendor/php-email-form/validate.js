(function() {
    "use strict"; // Modo estricto para un código más seguro y sin errores

    // Selecciona todos los formularios con la clase 'php-email-form' y agrega un evento de escucha para el envío
    let forms = document.querySelectorAll('.php-email-form');

    forms.forEach(function(e) {
        e.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita el envío predeterminado del formulario

            let thisForm = this; // Hace referencia al formulario actual

            // Obtiene la URL de acción del formulario y la clave de reCAPTCHA si está presente
            let action = thisForm.getAttribute('action');
            let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

            // Verifica si la acción del formulario está definida
            if (!action) {
                displayError(thisForm, 'The form action property is not set!');
                return;
            }

            // Muestra el mensaje de carga y oculta los mensajes de error y éxito
            thisForm.querySelector('.loading').classList.add('d-block');
            thisForm.querySelector('.error-message').classList.remove('d-block');
            thisForm.querySelector('.sent-message').classList.remove('d-block');

            // Crea un objeto FormData para recopilar los datos del formulario
            let formData = new FormData(thisForm);

            // Verifica si se proporcionó una clave de reCAPTCHA
            if (recaptcha) {
                if (typeof grecaptcha !== "undefined") {
                    grecaptcha.ready(function() {
                        try {
                            // Ejecuta la validación de reCAPTCHA y envía el formulario si la validación es exitosa
                            grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                                .then(token => {
                                    formData.set('recaptcha-response', token);
                                    php_email_form_submit(thisForm, action, formData);
                                })
                        } catch (error) {
                            displayError(thisForm, error);
                        }
                    });
                } else {
                    displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
                }
            } else {
                // Envía el formulario directamente si no hay reCAPTCHA
                php_email_form_submit(thisForm, action, formData);
            }
        });
    });

    // Función para enviar el formulario al servidor
    function php_email_form_submit(thisForm, action, formData) {
        fetch(action, {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' } // Encabezado para indicar una solicitud AJAX
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    // Lanza un error si la respuesta no es satisfactoria
                    throw new Error(`${response.status} ${response.statusText} ${response.url}`);
                }
            })
            .then(data => {
                // Oculta el mensaje de carga y muestra el mensaje de éxito o error según la respuesta del servidor
                thisForm.querySelector('.loading').classList.remove('d-block');
                if (data.trim() == 'OK') {
                    thisForm.querySelector('.sent-message').classList.add('d-block');
                    thisForm.reset(); // Reinicia el formulario después de un envío exitoso
                } else {
                    throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
                }
            })
            .catch((error) => {
                // Muestra un mensaje de error en el formulario
                displayError(thisForm, error);
            });
    }

    // Función para mostrar un mensaje de error en el formulario
    function displayError(thisForm, error) {
        thisForm.querySelector('.loading').classList.remove('d-block');
        thisForm.querySelector('.error-message').innerHTML = error;
        thisForm.querySelector('.error-message').classList.add('d-block');
    }

})();