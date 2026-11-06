/* ==========================================================================
   DI VALERIO CHOFERES - SCRIPT PRINCIPAL JAVASCRIPT
   ========================================================================== */

// Esperamos a que todo el contenido HTML esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function () {
    console.log('Sistema Di Valerio Choferes iniciado correctamente.');

    /* --------------------------------------------------------------------------
       1. VARIABLES GLOBALES DE ESTADO
       Guardamos en memoria el paso actual y la información del registro.
    -------------------------------------------------------------------------- */
    let pasoActual = 1; // Comenzamos siempre en el Paso 1
    const CLAVE_LOCALSTORAGE = 'divalerio_inscripciones_db'; // Clave para guardar en el navegador

    // Objeto para recopilar temporalmente los datos del alumno antes de guardar
    let datosInscripcion = {
        nombre: '',
        cedula: '',
        fechaNacimiento: '',
        telefono: '',
        correo: '',
        curso: '',
        modalidad: '',
        horario: '',
        fechaInicio: '',
        precio: '',
        duracion: '',
        numeroInscripcion: '',
        fechaRegistro: ''
    };

    /* --------------------------------------------------------------------------
       2. REFERENCIAS A ELEMENTOS DEL DOM (DOCUMENT OBJECT MODEL)
       "Capturamos" los elementos del HTML mediante sus IDs para poder interactuar
       con ellos mediante eventos y cambiar su contenido.
    -------------------------------------------------------------------------- */
    
    // Bloques de pasos del formulario
    const paso1 = document.getElementById('paso-1');
    const paso2 = document.getElementById('paso-2');
    const paso3 = document.getElementById('paso-3');
    const pantallaExito = document.getElementById('pantalla-exito');
    const formularioInscripcion = document.getElementById('formulario-inscripcion');

    // Indicadores visuales de la barra de progreso
    const indicadorPaso1 = document.getElementById('indicador-paso-1');
    const indicadorPaso2 = document.getElementById('indicador-paso-2');
    const indicadorPaso3 = document.getElementById('indicador-paso-3');
    const linea1 = document.getElementById('linea-1');
    const linea2 = document.getElementById('linea-2');

    // Botones de navegación entre pasos
    const btnPaso1Siguiente = document.getElementById('btn-paso1-siguiente');
    const btnPaso2Anterior = document.getElementById('btn-paso2-anterior');
    const btnPaso2Siguiente = document.getElementById('btn-paso2-siguiente');
    const btnPaso3Anterior = document.getElementById('btn-paso3-anterior');
    const btnNuevaInscripcion = document.getElementById('btn-nueva-inscripcion');

    // Campos del Paso 1 (Datos Personales)
    const inputNombre = document.getElementById('nombre');
    const inputCedula = document.getElementById('cedula');
    const inputFechaNacimiento = document.getElementById('fecha-nacimiento');
    const inputTelefono = document.getElementById('telefono');
    const inputCorreo = document.getElementById('correo');

    // Campos del Paso 2 (Programa y Horario)
    const selectCurso = document.getElementById('curso-seleccionado');
    const selectModalidad = document.getElementById('modalidad');
    const selectHorario = document.getElementById('horario');
    const inputFechaInicio = document.getElementById('fecha-inicio');

    // Elementos del Paso 3 (Resumen dinámico y Términos)
    const resumenNombre = document.getElementById('resumen-nombre');
    const resumenCedula = document.getElementById('resumen-cedula');
    const resumenTelefono = document.getElementById('resumen-telefono');
    const resumenCorreo = document.getElementById('resumen-correo');
    const resumenCurso = document.getElementById('resumen-curso');
    const resumenDuracion = document.getElementById('resumen-duracion');
    const resumenModalidad = document.getElementById('resumen-modalidad');
    const resumenHorario = document.getElementById('resumen-horario');
    const resumenFechaInicio = document.getElementById('resumen-fecha-inicio');
    const resumenPrecio = document.getElementById('resumen-precio');
    const checkTerminos = document.getElementById('terminos');

    // Elementos de la Pantalla de Éxito
    const exitoNombreAlumno = document.getElementById('exito-nombre-alumno');
    const exitoNumeroInscripcion = document.getElementById('exito-numero-inscripcion');

    // Elementos del Panel de Inscripciones (localStorage)
    const panelVacio = document.getElementById('panel-vacio');
    const panelListaInscripciones = document.getElementById('panel-lista-inscripciones');
    const contadorInscripciones = document.getElementById('contador-inscripciones');
    const btnLimpiarHistorial = document.getElementById('btn-limpiar-historial');
    const btnRecargarPanel = document.getElementById('btn-recargar-panel');

    // Formulario de Contacto
    const formularioContacto = document.getElementById('formulario-contacto');
    const alertaContacto = document.getElementById('contacto-mensaje-alerta');

    /* --------------------------------------------------------------------------
       3. FUNCIONES AUXILIARES DE VALIDACIÓN Y MANEJO DE ERRORES
       Facilitan mostrar avisos amigables debajo de cada campo si hay errores.
    -------------------------------------------------------------------------- */

    // Muestra un mensaje de error debajo del campo y le añade un borde rojo
    function mostrarError(inputElemento, idError, mensaje) {
        const errorSpan = document.getElementById(idError);
        if (errorSpan) {
            errorSpan.textContent = mensaje;
        }
        if (inputElemento) {
            inputElemento.classList.add('campo-error');
        }
    }

    // Limpia el mensaje de error y restaura el campo a su estado normal
    function limpiarError(inputElemento, idError) {
        const errorSpan = document.getElementById(idError);
        if (errorSpan) {
            errorSpan.textContent = '';
        }
        if (inputElemento) {
            inputElemento.classList.remove('campo-error');
        }
    }

    // Valida si un formato de correo electrónico es sintácticamente correcto
    function validarFormatoCorreo(correo) {
        // Expresión regular estándar básica para correos: texto@dominio.extension
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexCorreo.test(correo.trim());
    }

    // Formateador de moneda en Pesos Dominicanos (RD$)
    function formatearPrecioRD(numero) {
        return 'RD$' + Number(numero).toLocaleString('es-DO');
    }

    /* --------------------------------------------------------------------------
       4. CONTROL DE NAVEGACIÓN ENTRE PASOS (STEP WIZARD)
    -------------------------------------------------------------------------- */

    // Muestra un paso específico y oculta los demás
    // El parámetro 'hacerScroll' (por defecto true) decide si la pantalla se desplaza automáticamente
    function irAlPaso(numeroPaso, hacerScroll = true) {
        pasoActual = numeroPaso;

        // Ocultamos todos los pasos y la pantalla de éxito
        paso1.classList.add('oculto');
        paso2.classList.add('oculto');
        paso3.classList.add('oculto');
        pantallaExito.classList.add('oculto');
        formularioInscripcion.classList.remove('oculto');

        // Mostramos el paso solicitado
        if (numeroPaso === 1) {
            paso1.classList.remove('oculto');
        } else if (numeroPaso === 2) {
            paso2.classList.remove('oculto');
        } else if (numeroPaso === 3) {
            actualizarResumenPaso3();
            paso3.classList.remove('oculto');
        }

        // Actualizamos los círculos y líneas de progreso
        actualizarBarraDeProgreso(numeroPaso);

        // Solo desplazamos la pantalla si el usuario interactuó con los botones (hacerScroll === true)
        // Esto evita que al abrir o recargar la página se baje automáticamente
        if (hacerScroll) {
            const contenedorInscripcion = document.getElementById('inscripcion');
            if (contenedorInscripcion) {
                contenedorInscripcion.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // Actualiza los colores de los círculos (1, 2, 3) y las líneas conectoras
    function actualizarBarraDeProgreso(paso) {
        // Reiniciamos todas las clases
        indicadorPaso1.className = 'paso-indicador';
        indicadorPaso2.className = 'paso-indicador';
        indicadorPaso3.className = 'paso-indicador';
        linea1.classList.remove('completada');
        linea2.classList.remove('completada');

        if (paso === 1) {
            indicadorPaso1.classList.add('activo');
        } else if (paso === 2) {
            indicadorPaso1.classList.add('completado');
            linea1.classList.add('completada');
            indicadorPaso2.classList.add('activo');
        } else if (paso === 3) {
            indicadorPaso1.classList.add('completado');
            indicadorPaso2.classList.add('completado');
            linea1.classList.add('completada');
            linea2.classList.add('completada');
            indicadorPaso3.classList.add('activo');
        }
    }

    /* --------------------------------------------------------------------------
       5. VALIDACIÓN PASO 1 (DATOS PERSONALES)
    -------------------------------------------------------------------------- */
    function validarPaso1() {
        let esValido = true;

        // Validar Nombre Completo
        const nombreValor = inputNombre.value.trim();
        if (nombreValor === '') {
            mostrarError(inputNombre, 'error-nombre', 'Por favor ingresa tu nombre completo.');
            esValido = false;
        } else if (nombreValor.length < 3) {
            mostrarError(inputNombre, 'error-nombre', 'El nombre debe tener al menos 3 caracteres.');
            esValido = false;
        } else {
            limpiarError(inputNombre, 'error-nombre');
            datosInscripcion.nombre = nombreValor;
        }

        // Validar Cédula de Identidad
        const cedulaValor = inputCedula.value.trim();
        if (cedulaValor === '') {
            mostrarError(inputCedula, 'error-cedula', 'La cédula es requerida para el registro.');
            esValido = false;
        } else if (cedulaValor.length < 9) {
            mostrarError(inputCedula, 'error-cedula', 'Ingresa una cédula válida (Ej. 001-0000000-0).');
            esValido = false;
        } else {
            limpiarError(inputCedula, 'error-cedula');
            datosInscripcion.cedula = cedulaValor;
        }

        // Validar Fecha de Nacimiento
        const fechaNacimientoValor = inputFechaNacimiento.value;
        if (!fechaNacimientoValor) {
            mostrarError(inputFechaNacimiento, 'error-fecha-nacimiento', 'Selecciona tu fecha de nacimiento.');
            esValido = false;
        } else {
            // Verificar que tenga al menos 16 años (edad legal para aprendizaje vial en RD)
            const anioNacimiento = new Date(fechaNacimientoValor).getFullYear();
            const anioActual = new Date().getFullYear();
            const edad = anioActual - anioNacimiento;

            if (edad < 16) {
                mostrarError(inputFechaNacimiento, 'error-fecha-nacimiento', 'Debes tener al menos 16 años cumplidos para inscribirte.');
                esValido = false;
            } else if (edad > 95) {
                mostrarError(inputFechaNacimiento, 'error-fecha-nacimiento', 'Por favor verifica el año de nacimiento.');
                esValido = false;
            } else {
                limpiarError(inputFechaNacimiento, 'error-fecha-nacimiento');
                datosInscripcion.fechaNacimiento = fechaNacimientoValor;
            }
        }

        // Validar Teléfono
        const telefonoValor = inputTelefono.value.trim();
        if (telefonoValor === '') {
            mostrarError(inputTelefono, 'error-telefono', 'Ingresa un número telefónico de contacto.');
            esValido = false;
        } else if (telefonoValor.length < 8) {
            mostrarError(inputTelefono, 'error-telefono', 'El teléfono debe tener un formato válido (Ej. 809-555-0199).');
            esValido = false;
        } else {
            limpiarError(inputTelefono, 'error-telefono');
            datosInscripcion.telefono = telefonoValor;
        }

        // Validar Correo Electrónico
        const correoValor = inputCorreo.value.trim();
        if (correoValor === '') {
            mostrarError(inputCorreo, 'error-correo', 'El correo electrónico es obligatorio.');
            esValido = false;
        } else if (!validarFormatoCorreo(correoValor)) {
            mostrarError(inputCorreo, 'error-correo', 'El correo no tiene un formato válido (ejemplo@correo.com).');
            esValido = false;
        } else {
            limpiarError(inputCorreo, 'error-correo');
            datosInscripcion.correo = correoValor;
        }

        return esValido;
    }

    /* --------------------------------------------------------------------------
       6. VALIDACIÓN PASO 2 (PROGRAMA Y HORARIO)
    -------------------------------------------------------------------------- */
    function validarPaso2() {
        let esValido = true;

        // Validar selección de curso
        const cursoValor = selectCurso.value;
        if (cursoValor === '') {
            mostrarError(selectCurso, 'error-curso', 'Debes seleccionar el curso que deseas tomar.');
            esValido = false;
        } else {
            limpiarError(selectCurso, 'error-curso');
            
            // Leemos la opción seleccionada para obtener precio y duración
            const opcionSeleccionada = selectCurso.options[selectCurso.selectedIndex];
            datosInscripcion.curso = cursoValor;
            datosInscripcion.precio = opcionSeleccionada.getAttribute('data-precio') || '8500';
            datosInscripcion.duracion = opcionSeleccionada.getAttribute('data-duracion') || '4 semanas';
        }

        // Validar modalidad
        const modalidadValor = selectModalidad.value;
        if (modalidadValor === '') {
            mostrarError(selectModalidad, 'error-modalidad', 'Selecciona la modalidad de tu preferencia.');
            esValido = false;
        } else {
            limpiarError(selectModalidad, 'error-modalidad');
            datosInscripcion.modalidad = modalidadValor;
        }

        // Validar horario
        const horarioValor = selectHorario.value;
        if (horarioValor === '') {
            mostrarError(selectHorario, 'error-horario', 'Selecciona el horario en que deseas tomar clases.');
            esValido = false;
        } else {
            limpiarError(selectHorario, 'error-horario');
            datosInscripcion.horario = horarioValor;
        }

        // Validar fecha tentativa de inicio
        const fechaInicioValor = inputFechaInicio.value;
        if (!fechaInicioValor) {
            mostrarError(inputFechaInicio, 'error-fecha-inicio', 'Selecciona la fecha tentativa en la que deseas iniciar.');
            esValido = false;
        } else {
            // Verificar que no sea una fecha pasada
            const fechaSeleccionada = new Date(fechaInicioValor + 'T00:00:00');
            const fechaHoy = new Date();
            fechaHoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < fechaHoy) {
                mostrarError(inputFechaInicio, 'error-fecha-inicio', 'La fecha tentativa debe ser a partir de hoy.');
                esValido = false;
            } else {
                limpiarError(inputFechaInicio, 'error-fecha-inicio');
                datosInscripcion.fechaInicio = fechaInicioValor;
            }
        }

        return esValido;
    }

    /* --------------------------------------------------------------------------
       7. RESUMEN DINÁMICO PASO 3
       Toma los datos ingresados en el Paso 1 y Paso 2 y los pinta en el Paso 3.
    -------------------------------------------------------------------------- */
    function actualizarResumenPaso3() {
        resumenNombre.textContent = datosInscripcion.nombre || '-';
        resumenCedula.textContent = datosInscripcion.cedula || '-';
        resumenTelefono.textContent = datosInscripcion.telefono || '-';
        resumenCorreo.textContent = datosInscripcion.correo || '-';

        resumenCurso.textContent = datosInscripcion.curso || '-';
        resumenDuracion.textContent = datosInscripcion.duracion || '-';
        resumenModalidad.textContent = datosInscripcion.modalidad || '-';
        resumenHorario.textContent = datosInscripcion.horario || '-';
        resumenFechaInicio.textContent = datosInscripcion.fechaInicio || '-';

        // Formateamos el precio
        resumenPrecio.textContent = formatearPrecioRD(datosInscripcion.precio || 0);
    }

    /* --------------------------------------------------------------------------
       8. GENERACIÓN DE CÓDIGO Y CONFIRMACIÓN DE INSCRIPCIÓN
    -------------------------------------------------------------------------- */
    
    // Genera un número de inscripción profesional y único (ej: DVC-2026-4891)
    function generarNumeroInscripcion() {
        const anio = new Date().getFullYear();
        // Generamos un número aleatorio de 4 dígitos entre 1000 y 9999
        const aleatorio = Math.floor(1000 + Math.random() * 9000);
        return `DVC-${anio}-${aleatorio}`;
    }

    // Procesa la confirmación definitiva
    formularioInscripcion.addEventListener('submit', function (evento) {
        evento.preventDefault(); // Evitamos que la página se recargue

        // Validar que el usuario haya aceptado los términos y condiciones
        if (!checkTerminos.checked) {
            mostrarError(checkTerminos, 'error-terminos', 'Debes aceptar los términos y condiciones para continuar.');
            return;
        } else {
            limpiarError(checkTerminos, 'error-terminos');
        }

        // Generamos el número de inscripción y fecha del registro
        datosInscripcion.numeroInscripcion = generarNumeroInscripcion();
        datosInscripcion.fechaRegistro = new Date().toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // 1. Guardar en el almacenamiento local (localStorage)
        guardarInscripcionEnStorage(datosInscripcion);

        // 2. Mostrar datos en la Pantalla de Éxito
        exitoNombreAlumno.textContent = datosInscripcion.nombre;
        exitoNumeroInscripcion.textContent = datosInscripcion.numeroInscripcion;

        // 3. Ocultar el formulario y desplegar la pantalla de éxito
        formularioInscripcion.classList.add('oculto');
        pantallaExito.classList.remove('oculto');

        // Actualizar barra de progreso al 100% completado
        indicadorPaso3.classList.remove('activo');
        indicadorPaso3.classList.add('completado');

        // 4. Actualizar automáticamente la lista del panel inferior
        cargarInscripcionesDesdeStorage();
    });

    /* --------------------------------------------------------------------------
       9. MANEJO DE LOCALSTORAGE (BASE DE DATOS EN NAVEGADOR)
    -------------------------------------------------------------------------- */

    // Obtiene las inscripciones guardadas como un array de objetos
    function obtenerInscripcionesGuardadas() {
        const registros = localStorage.getItem(CLAVE_LOCALSTORAGE);
        if (registros) {
            try {
                return JSON.parse(registros); // Convertimos el texto JSON a un array de JavaScript
            } catch (error) {
                console.error('Error al parsear registros de localStorage:', error);
                return [];
            }
        }
        return [];
    }

    // Agrega una nueva inscripción al array y lo vuelve a guardar en localStorage
    function guardarInscripcionEnStorage(nuevaInscripcion) {
        const inscripciones = obtenerInscripcionesGuardadas();
        
        // Creamos una copia del objeto para evitar referencias mutables
        const inscripcionClonada = Object.assign({}, nuevaInscripcion);
        
        // La insertamos al inicio del array para que aparezcan primero las más recientes
        inscripciones.unshift(inscripcionClonada);

        // Guardamos de vuelta como texto mediante JSON.stringify
        localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(inscripciones));
    }

    // Dibuja en pantalla todas las inscripciones guardadas en el panel inferior
    function cargarInscripcionesDesdeStorage() {
        const inscripciones = obtenerInscripcionesGuardadas();

        // Actualizamos el número del contador
        contadorInscripciones.textContent = inscripciones.length;

        // Si no hay ninguna inscripción registrada
        if (inscripciones.length === 0) {
            panelVacio.classList.remove('oculto');
            panelListaInscripciones.classList.add('oculto');
            panelListaInscripciones.innerHTML = '';
            return;
        }

        // Si hay inscripciones, las mostramos
        panelVacio.classList.add('oculto');
        panelListaInscripciones.classList.remove('oculto');
        panelListaInscripciones.innerHTML = ''; // Limpiamos contenido previo

        // Recorremos el array y creamos una tarjeta para cada registro
        inscripciones.forEach(function (registro) {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'registro-card';

            tarjeta.innerHTML = `
                <div class="registro-header">
                    <span class="registro-codigo">${registro.numeroInscripcion}</span>
                    <span class="registro-badge"><i class="fa-solid fa-circle-check"></i> Confirmada</span>
                </div>
                <h4 class="registro-alumno">${registro.nombre}</h4>
                <div class="registro-curso"><i class="fa-solid fa-graduation-cap"></i> ${registro.curso}</div>
                <ul class="registro-detalles-lista">
                    <li><i class="fa-solid fa-id-card"></i> <strong>Cédula:</strong> ${registro.cedula}</li>
                    <li><i class="fa-solid fa-phone"></i> <strong>Teléfono:</strong> ${registro.telefono}</li>
                    <li><i class="fa-solid fa-envelope"></i> <strong>Correo:</strong> ${registro.correo}</li>
                    <li><i class="fa-solid fa-clock"></i> <strong>Horario:</strong> ${registro.horario}</li>
                    <li><i class="fa-solid fa-calendar-day"></i> <strong>Inicio:</strong> ${registro.fechaInicio}</li>
                    <li><i class="fa-solid fa-tag"></i> <strong>Inversión:</strong> ${formatearPrecioRD(registro.precio)}</li>
                </ul>
            `;

            panelListaInscripciones.appendChild(tarjeta);
        });
    }

    // Botón para limpiar el historial de inscripciones de demostración
    btnLimpiarHistorial.addEventListener('click', function () {
        const confirmacion = confirm('¿Estás seguro de que deseas vaciar el historial de inscripciones guardadas en este navegador?');
        if (confirmacion) {
            localStorage.removeItem(CLAVE_LOCALSTORAGE);
            cargarInscripcionesDesdeStorage();
        }
    });

    // Botón para recargar manualmente la lista
    btnRecargarPanel.addEventListener('click', function () {
        cargarInscripcionesDesdeStorage();
    });

    /* --------------------------------------------------------------------------
       10. EVENTOS DE LOS BOTONES DEL FORMULARIO
    -------------------------------------------------------------------------- */

    // Avanzar de Paso 1 a Paso 2
    btnPaso1Siguiente.addEventListener('click', function () {
        if (validarPaso1()) {
            irAlPaso(2);
        }
    });

    // Regresar de Paso 2 a Paso 1
    btnPaso2Anterior.addEventListener('click', function () {
        irAlPaso(1);
    });

    // Avanzar de Paso 2 a Paso 3
    btnPaso2Siguiente.addEventListener('click', function () {
        if (validarPaso2()) {
            irAlPaso(3);
        }
    });

    // Regresar de Paso 3 a Paso 2 (Modificar datos)
    btnPaso3Anterior.addEventListener('click', function () {
        irAlPaso(2);
    });

    // Botón "Realizar Otra Inscripción" tras la pantalla de éxito
    btnNuevaInscripcion.addEventListener('click', function () {
        // Limpiamos los campos del formulario
        formularioInscripcion.reset();
        checkTerminos.checked = false;

        // Reiniciamos el objeto
        datosInscripcion = {
            nombre: '',
            cedula: '',
            fechaNacimiento: '',
            telefono: '',
            correo: '',
            curso: '',
            modalidad: '',
            horario: '',
            fechaInicio: '',
            precio: '',
            duracion: '',
            numeroInscripcion: '',
            fechaRegistro: ''
        };

        // Volvemos al Paso 1
        irAlPaso(1);
    });

    /* --------------------------------------------------------------------------
       11. SELECCIÓN DE CURSO DESDE LAS TARJETAS SUPERIORES
       Al hacer clic en "Seleccionar curso" en cualquier tarjeta, se configura
       el select automáticamente y lleva al usuario directo a la inscripción.
    -------------------------------------------------------------------------- */
    const botonesSeleccionarCurso = document.querySelectorAll('.btn-seleccionar-curso');

    botonesSeleccionarCurso.forEach(function (boton) {
        boton.addEventListener('click', function () {
            const nombreCurso = this.getAttribute('data-nombre');
            const precioCurso = this.getAttribute('data-precio');
            const duracionCurso = this.getAttribute('data-duracion');

            // Asignamos el valor en el desplegable
            selectCurso.value = nombreCurso;
            datosInscripcion.curso = nombreCurso;
            datosInscripcion.precio = precioCurso;
            datosInscripcion.duracion = duracionCurso;

            // Si el Paso 1 ya está lleno y validado, podemos llevarlo directo al Paso 2
            if (validarPaso1()) {
                irAlPaso(2);
            } else {
                irAlPaso(1);
            }

            // Desplazamiento hacia la sección de inscripción
            const seccionInscripcion = document.getElementById('inscripcion');
            if (seccionInscripcion) {
                seccionInscripcion.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* --------------------------------------------------------------------------
       12. FORMULARIO DE CONTACTO (SIMULACIÓN DE ENVÍO)
    -------------------------------------------------------------------------- */
    if (formularioContacto) {
        formularioContacto.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const nombreContacto = document.getElementById('contacto-nombre').value.trim();
            const correoContacto = document.getElementById('contacto-correo').value.trim();
            const mensajeContacto = document.getElementById('contacto-mensaje').value.trim();

            if (!nombreContacto || !correoContacto || !mensajeContacto) {
                alertaContacto.className = 'alerta alerta-error';
                alertaContacto.textContent = 'Por favor completa tu nombre, correo y el mensaje.';
                alertaContacto.classList.remove('oculto');
                return;
            }

            // Simulación de envío exitoso
            alertaContacto.className = 'alerta alerta-exito';
            alertaContacto.innerHTML = `<i class="fa-solid fa-check-circle"></i> ¡Gracias <strong>${nombreContacto}</strong>! Hemos recibido tu mensaje. Te responderemos a la brevedad.`;
            alertaContacto.classList.remove('oculto');

            formularioContacto.reset();

            // Ocultar mensaje tras 6 segundos
            setTimeout(function () {
                alertaContacto.classList.add('oculto');
            }, 6000);
        });
    }

    /* --------------------------------------------------------------------------
       13. EFECTO DE NAVEGACIÓN ACTIVA AL HACER SCROLL
       Ilumina el enlace de navegación según la sección visible en pantalla.
    -------------------------------------------------------------------------- */
    const secciones = document.querySelectorAll('main section');
    const enlacesNav = document.querySelectorAll('.nav-menu .nav-enlace');

    window.addEventListener('scroll', function () {
        let seccionActual = '';
        const posicionScroll = window.scrollY + 120; // Compensación por la barra superior

        secciones.forEach(function (seccion) {
            const seccionTop = seccion.offsetTop;
            const seccionHeight = seccion.clientHeight;

            if (posicionScroll >= seccionTop && posicionScroll < seccionTop + seccionHeight) {
                seccionActual = seccion.getAttribute('id');
            }
        });

        enlacesNav.forEach(function (enlace) {
            enlace.classList.remove('activo');
            if (enlace.getAttribute('href') === '#' + seccionActual) {
                enlace.classList.add('activo');
            }
        });
    });

    /* --------------------------------------------------------------------------
       14. INICIALIZACIÓN AL ABRIR LA PÁGINA
    -------------------------------------------------------------------------- */
    // Configuramos la fecha mínima permitida en fecha tentativa como la fecha de hoy
    const inputFechaHoy = new Date().toISOString().split('T')[0];
    if (inputFechaInicio) {
        inputFechaInicio.setAttribute('min', inputFechaHoy);
    }

    // Cargamos los registros previos existentes en localStorage
    cargarInscripcionesDesdeStorage();

    // Arrancamos en el Paso 1 sin forzar el desplazamiento de la pantalla
    irAlPaso(1, false);

    // Aseguramos que la página siempre comience en la parte superior (Hero / Inicio)
    if (!window.location.hash || window.location.hash === '#inicio') {
        window.scrollTo(0, 0);
    }
});
