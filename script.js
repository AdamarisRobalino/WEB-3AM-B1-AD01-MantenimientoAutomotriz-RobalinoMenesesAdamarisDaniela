
// ==========================================
// AUTOSERVICE XYZ
// SISTEMA DE MANTENIMIENTOS
// ==========================================


// ==========================================
// CONTROL DE SESION Y ROLES
// ==========================================

function obtenerUsuarioActivo() {
    return sessionStorage.getItem("usuarioActivo");
}

function obtenerRolActivo() {
    return sessionStorage.getItem("rolUsuario");
}

function esAdministrador() {
    return obtenerRolActivo() === "administrador";
}

function esCliente() {
    return obtenerRolActivo() === "cliente";
}

function cerrarSesion() {
    sessionStorage.removeItem("usuarioActivo");
    sessionStorage.removeItem("rolUsuario");
    window.location.replace("login.html");
}


// ==========================================
// ALMACENAMIENTO DE CLIENTES
// ==========================================

function obtenerClientes() {
    try {
        const datos = localStorage.getItem("clientes");
        const clientes = datos ? JSON.parse(datos) : [];

        return Array.isArray(clientes) ? clientes : [];

    } catch (error) {
        console.error("Error al obtener clientes:", error);
        return [];
    }
}

function guardarClientes(clientes) {
    try {
        localStorage.setItem("clientes", JSON.stringify(clientes));
        return true;

    } catch (error) {
        console.error("Error al guardar clientes:", error);
        return false;
    }
}


// ==========================================
// ALMACENAMIENTO DE MANTENIMIENTOS
// ==========================================

function obtenerMantenimientos() {
    try {
        const datos = localStorage.getItem("mantenimientos");
        const registros = datos ? JSON.parse(datos) : [];

        return Array.isArray(registros) ? registros : [];

    } catch (error) {
        console.error("Error al leer mantenimientos:", error);
        return [];
    }
}

function guardarMantenimientos(registros) {
    try {
        localStorage.setItem("mantenimientos", JSON.stringify(registros));
        return true;

    } catch (error) {
        console.error("Error al guardar mantenimientos:", error);
        return false;
    }
}


// ==========================================
// FUNCIONES GENERALES
// ==========================================

function obtenerFechaActual() {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => {
        const equivalencias = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return equivalencias[caracter];
    });
}


// ==========================================
// REGISTRO DE MANTENIMIENTOS
// ==========================================

const tablaSolicitudesCliente = document.getElementById("tablaSolicitudesCliente");

function mostrarSolicitudesCliente() {
    if (!tablaSolicitudesCliente) return;

    const usuario = obtenerUsuarioActivo();
    if (!usuario || !esCliente()) return;

    const solicitudes = obtenerMantenimientos().filter(registro =>
        String(registro.usuarioPropietario || "").toLowerCase() === usuario.toLowerCase()
    );

    if (solicitudes.length === 0) {
        tablaSolicitudesCliente.innerHTML = '<tr><td colspan="5" class="text-center">Aún no tienes solicitudes registradas.</td></tr>';
        return;
    }

    tablaSolicitudesCliente.innerHTML = solicitudes
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map(registro => `
            <tr>
                <td>${escaparHTML(registro.codigo)}</td>
                <td>${escaparHTML(registro.tipo)}</td>
                <td>${escaparHTML(`${registro.marca} ${registro.modelo} (${registro.anio})`)}</td>
                <td>${escaparHTML(registro.fecha)}</td>
                <td>${escaparHTML(registro.estado || "Pendiente")}</td>
            </tr>
        `).join("");
}
const formulario = document.getElementById("formMantenimiento");

if (formulario) {

    if (!obtenerUsuarioActivo() || !esCliente()) {
        window.location.replace("login.html");

    } else {

        // Los datos personales ya están en la cuenta; reutilizarlos en la solicitud.
        const usuarioActivo = obtenerUsuarioActivo();
        const clienteActivo = obtenerClientes().find(cliente =>
            String(cliente.usuario || "").toLowerCase() === usuarioActivo.toLowerCase()
        );

        if (!clienteActivo) {
            cerrarSesion();
        } else {
            [
                ["nombre", clienteActivo.nombre],
                ["correo", clienteActivo.correo],
                ["telefono", clienteActivo.telefono]
            ].forEach(([id, valor]) => {
                const campo = document.getElementById(id);
                if (campo) {
                    campo.value = valor || "";
                    campo.readOnly = true;
                    campo.setAttribute("aria-readonly", "true");
                }
            });
        }

        mostrarSolicitudesCliente();

        const campoFecha = document.getElementById("fecha");

        if (campoFecha) {
            campoFecha.min = obtenerFechaActual();
        }

        formulario.addEventListener("submit", function(evento) {

            evento.preventDefault();

            if (!obtenerUsuarioActivo() || !esCliente()) {
                cerrarSesion();
                return;
            }

            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            const marca = document.getElementById("marca").value.trim();
            const modelo = document.getElementById("modelo").value.trim();
            const placa = document.getElementById("placa").value.trim().toUpperCase();
            const anio = Number(document.getElementById("anio").value);
            const tipo = document.getElementById("tipo").value;
            const fecha = document.getElementById("fecha").value;
            const prioridad = document.querySelector("input[name='prioridad']:checked")?.value;
            const autorizaContacto = document.getElementById("autorizaContacto").checked;
            const descripcion = document.getElementById("descripcion").value.trim();

            if (
                !nombre || !correo || !telefono || !marca ||
                !modelo || !placa || !anio || !tipo ||
                !fecha || !descripcion || !prioridad || !autorizaContacto
            ) {
                Swal.fire("Atención", "Completa todos los campos.", "warning");
                return;
            }

            if (!/^\d{10}$/.test(telefono)) {
                Swal.fire("Teléfono incorrecto", "Ingresa 10 dígitos.", "warning");
                return;
            }

            if (!/^[A-Z]{3}-?\d{3,4}$/.test(placa)) {
                Swal.fire("Placa incorrecta", "Usa el formato ABC-1234 o ABC-123.", "warning");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                Swal.fire("Correo incorrecto", "Ingresa un correo válido.", "warning");
                return;
            }

            if (anio < 1950 || anio > new Date().getFullYear()) {
                Swal.fire("Año incorrecto", "Ingresa un año válido.", "warning");
                return;
            }

            if (fecha < obtenerFechaActual()) {
                Swal.fire("Fecha incorrecta", "Selecciona una fecha actual o futura.", "warning");
                return;
            }

            const registros = obtenerMantenimientos();

            const nuevoMantenimiento = {
                id: Date.now(),
                codigo: "MNT-" + Date.now(),
                usuarioPropietario: obtenerUsuarioActivo(),
                nombre: nombre,
                correo: correo,
                telefono: telefono,
                marca: marca,
                modelo: modelo,
                placa: placa,
                anio: anio,
                tipo: tipo,
                fecha: fecha,
                prioridad: prioridad,
                autorizaContacto: autorizaContacto,
                descripcion: descripcion,
                estado: "Pendiente",
                fechaRegistro: new Date().toISOString()
            };

            registros.push(nuevoMantenimiento);

            if (guardarMantenimientos(registros)) {

                Swal.fire({
                    title: "¡Registro exitoso!",
                    html: `Tu solicitud fue registrada.<br>
                    Código: <strong>${escaparHTML(nuevoMantenimiento.codigo)}</strong>`,
                    icon: "success"
                });

                formulario.reset();
                mostrarSolicitudesCliente();

                if (campoFecha) {
                    campoFecha.min = obtenerFechaActual();
                }

            } else {
                Swal.fire("Error", "No se pudo guardar la solicitud.", "error");
            }

        });
    }
}


// ==========================================
// PANEL DE ADMINISTRACION
// ==========================================

const tablaMantenimientos = document.getElementById("tablaMantenimientos");
const buscarRegistro = document.getElementById("buscarRegistro");


// ==========================================
// CONTADORES
// ==========================================

function actualizarContadores(registros) {

    const total = document.getElementById("totalRegistros");
    const pendientes = document.getElementById("totalPendientes");
    const finalizados = document.getElementById("totalFinalizados");

    if (total) {
        total.textContent = registros.length;
    }

    if (pendientes) {
        pendientes.textContent = registros.filter(
            registro => registro.estado === "Pendiente"
        ).length;
    }

    if (finalizados) {
        finalizados.textContent = registros.filter(
            registro => registro.estado === "Finalizado"
        ).length;
    }
}


// ==========================================
// MOSTRAR MANTENIMIENTOS
// ==========================================

async function abrirEditorMantenimientoAdmin(id = null) {
    if (!esAdministrador()) return cerrarSesion();

    const registros = obtenerMantenimientos();
    const existente = id === null ? null : registros.find(item => Number(item.id) === Number(id));
    if (id !== null && !existente) return;

    const clientes = obtenerClientes().filter(cliente => (cliente.rol || "cliente") === "cliente");
    if (clientes.length === 0) {
        Swal.fire("Sin clientes", "Registra al menos un cliente antes de crear una solicitud.", "info");
        return;
    }

    const opcionesCliente = clientes.map(cliente => {
        const usuario = String(cliente.usuario || "");
        const nombre = String(cliente.nombre || usuario);
        const seleccionado = usuario === (existente?.usuarioPropietario || clientes[0].usuario) ? "selected" : "";
        return `<option value="${escaparHTML(usuario)}" ${seleccionado}>${escaparHTML(nombre)} (${escaparHTML(usuario)})</option>`;
    }).join("");
    const servicios = ["Cambio de aceite", "Revisión de frenos", "Diagnóstico automotriz", "Mantenimiento general"];
    const opcionesServicio = servicios.map(servicio => `<option ${servicio === existente?.tipo ? "selected" : ""}>${escaparHTML(servicio)}</option>`).join("");
    const marcas = ["Toyota", "Chevrolet", "Kia", "Hyundai", "Nissan", "Mazda", "Otra"];
    if (existente?.marca && !marcas.includes(existente.marca)) marcas.unshift(existente.marca);
    const opcionesMarca = marcas.map(marca => `<option ${marca === existente?.marca ? "selected" : ""}>${marca}</option>`).join("");

    const resultado = await Swal.fire({
        title: existente ? "Editar solicitud" : "Nueva solicitud",
        width: 760,
        showCancelButton: true,
        confirmButtonText: existente ? "Guardar cambios" : "Crear solicitud",
        cancelButtonText: "Cancelar",
        html: `
            <div class="text-start">
                <label class="form-label" for="adminCliente">Cliente</label>
                <select id="adminCliente" class="form-select mb-2">${opcionesCliente}</select>
                <div class="row g-2">
                    <div class="col-md-6"><label class="form-label" for="adminPlaca">Placa</label><input id="adminPlaca" class="form-control" maxlength="8" placeholder="ABC-1234" value="${escaparHTML(existente?.placa || "")}"></div>
                    <div class="col-md-6"><label class="form-label" for="adminMarca">Marca</label><select id="adminMarca" class="form-select">${opcionesMarca}</select></div>
                    <div class="col-md-6"><label class="form-label" for="adminModelo">Modelo</label><input id="adminModelo" class="form-control" value="${escaparHTML(existente?.modelo || "")}"></div>
                    <div class="col-md-6"><label class="form-label" for="adminAnio">Año</label><input id="adminAnio" type="number" min="1950" max="${new Date().getFullYear()}" class="form-control" value="${escaparHTML(existente?.anio || "")}"></div>
                    <div class="col-md-6"><label class="form-label" for="adminTipo">Servicio</label><select id="adminTipo" class="form-select">${opcionesServicio}</select></div>
                    <div class="col-md-6"><label class="form-label" for="adminFecha">Fecha</label><input id="adminFecha" type="date" class="form-control" value="${escaparHTML(existente?.fecha || "")}"></div>
                    <div class="col-12"><label class="form-label" for="adminPrioridad">Prioridad</label><select id="adminPrioridad" class="form-select"><option ${!existente || existente.prioridad === "Normal" ? "selected" : ""}>Normal</option><option ${existente?.prioridad === "Urgente" ? "selected" : ""}>Urgente</option></select></div>
                    <div class="col-12"><label class="form-label" for="adminDescripcion">Descripción</label><textarea id="adminDescripcion" class="form-control" rows="3">${escaparHTML(existente?.descripcion || "")}</textarea></div>
                </div>
            </div>`,
        preConfirm: () => {
            const valor = id => document.getElementById(id).value.trim();
            const cliente = clientes.find(item => String(item.usuario) === valor("adminCliente"));
            const placa = valor("adminPlaca").toUpperCase();
            const anio = Number(valor("adminAnio"));
            const fecha = valor("adminFecha");

            if (!cliente || !/^[A-Z]{3}-?\d{3,4}$/.test(placa)) {
                Swal.showValidationMessage("Selecciona un cliente e ingresa una placa válida (ABC-1234 o ABC-123). ");
                return false;
            }
            if (!valor("adminModelo") || anio < 1950 || anio > new Date().getFullYear()) {
                Swal.showValidationMessage("Completa el modelo y un año válido.");
                return false;
            }
            if (!valor("adminTipo") || !fecha || fecha < obtenerFechaActual() || !valor("adminDescripcion")) {
                Swal.showValidationMessage("Completa el servicio, una fecha actual o futura y la descripción.");
                return false;
            }
            return {
                cliente, placa, anio, fecha,
                marca: valor("adminMarca"), modelo: valor("adminModelo"),
                tipo: valor("adminTipo"), prioridad: valor("adminPrioridad"),
                descripcion: valor("adminDescripcion")
            };
        }
    });

    if (!resultado.isConfirmed || !resultado.value || !esAdministrador()) return;
    const datos = resultado.value;
    if (existente) {
        Object.assign(existente, {
            usuarioPropietario: datos.cliente.usuario,
            nombre: datos.cliente.nombre,
            correo: datos.cliente.correo,
            telefono: datos.cliente.telefono,
            placa: datos.placa,
            marca: datos.marca,
            modelo: datos.modelo,
            anio: datos.anio,
            tipo: datos.tipo,
            fecha: datos.fecha,
            prioridad: datos.prioridad,
            descripcion: datos.descripcion
        });
    } else {
        registros.push({
            id: Date.now(), codigo: "MNT-" + Date.now(),
            usuarioPropietario: datos.cliente.usuario,
            nombre: datos.cliente.nombre, correo: datos.cliente.correo,
            telefono: datos.cliente.telefono, placa: datos.placa,
            marca: datos.marca, modelo: datos.modelo, anio: datos.anio,
            tipo: datos.tipo,
            fecha: datos.fecha,
            prioridad: datos.prioridad, autorizaContacto: true,
            descripcion: datos.descripcion, estado: "Pendiente",
            fechaRegistro: new Date().toISOString()
        });
    }

    if (guardarMantenimientos(registros)) {
        mostrarMantenimientos(buscarRegistro ? buscarRegistro.value : "");
        Swal.fire("Guardado", existente ? "La solicitud fue actualizada." : "La solicitud fue creada.", "success");
    } else {
        Swal.fire("Error", "No se pudo guardar la solicitud.", "error");
    }
}
function mostrarMantenimientos(filtro = "") {

    if (!tablaMantenimientos) {
        return;
    }

    if (!obtenerUsuarioActivo() || !esAdministrador()) {
        window.location.replace("login.html");
        return;
    }

    const registros = obtenerMantenimientos();

    actualizarContadores(registros);

    const texto = filtro.toLowerCase().trim();

    const filtrados = registros.filter(registro =>
        String(registro.placa).toLowerCase().includes(texto) ||
        String(registro.codigo).toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
        tablaMantenimientos.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No se encontraron solicitudes.
                </td>
            </tr>
        `;
        return;
    }

    tablaMantenimientos.innerHTML = filtrados.map(registro => {

        const codigo = escaparHTML(registro.codigo);
        const nombre = escaparHTML(registro.nombre);
        const vehiculo = escaparHTML(
            `${registro.marca} ${registro.modelo} (${registro.anio})`
        );
        const fecha = escaparHTML(registro.fecha);
        const estado = registro.estado || "Pendiente";

        return `
            <tr>
                <td>${codigo}</td>
                <td>${nombre}</td>
                <td>${vehiculo}</td>
                <td>${fecha}</td>

                <td>
                    <select class="form-select form-select-sm cambiar-estado"
                            data-id="${registro.id}">

                        <option value="Pendiente" ${estado === "Pendiente" ? "selected" : ""}>
                            Pendiente
                        </option>

                        <option value="En revisión" ${estado === "En revisión" ? "selected" : ""}>En revisión</option>
<option value="En proceso" ${estado === "En proceso" ? "selected" : ""}>
                            En proceso
                        </option>
                        <option value="Cancelado" ${estado === "Cancelado" ? "selected" : ""}>Cancelado</option>

                        <option value="Finalizado" ${estado === "Finalizado" ? "selected" : ""}>
                            Finalizado
                        </option>

                    </select>
                </td>

                <td>
                    <button class="btn btn-info btn-sm ver-detalle"
                            data-id="${registro.id}">
                        Ver
                    </button>

                    <button class="btn btn-warning btn-sm editar-registro" data-id="${registro.id}">Editar</button>
                    <button class="btn btn-danger btn-sm eliminar-registro"
                            data-id="${registro.id}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// ==========================================
// BUSCAR MANTENIMIENTOS
// ==========================================

if (buscarRegistro) {

    buscarRegistro.addEventListener("input", function() {
        mostrarMantenimientos(this.value);
    });

}


// ==========================================
// CAMBIAR ESTADO Y ELIMINAR MANTENIMIENTOS
// ==========================================

const botonCrearMantenimientoAdmin = document.getElementById("crearMantenimientoAdmin");
if (botonCrearMantenimientoAdmin) {
    botonCrearMantenimientoAdmin.addEventListener("click", () => abrirEditorMantenimientoAdmin());
}
if (tablaMantenimientos) {

    tablaMantenimientos.addEventListener("change", function(evento) {

        if (!esAdministrador()) {
            cerrarSesion();
            return;
        }

        if (evento.target.classList.contains("cambiar-estado")) {

            const id = Number(evento.target.dataset.id);
            const registros = obtenerMantenimientos();

            const registro = registros.find(item => item.id === id);

            if (registro) {

                registro.estado = evento.target.value;

                if (guardarMantenimientos(registros)) {
                    mostrarMantenimientos(
                        buscarRegistro ? buscarRegistro.value : ""
                    );
                }
            }
        }
    });


    tablaMantenimientos.addEventListener("click", function(evento) {

        if (!esAdministrador()) {
            cerrarSesion();
            return;
        }

        const boton = evento.target.closest("button");

        if (!boton) {
            return;
        }

        if (boton.classList.contains("editar-registro")) {
            abrirEditorMantenimientoAdmin(Number(boton.dataset.id));
            return;
        }

        const id = Number(boton.dataset.id);
        const registros = obtenerMantenimientos();

        const registro = registros.find(item => item.id === id);

        if (!registro) {
            return;
        }


        // VER DETALLES

        if (boton.classList.contains("ver-detalle")) {

            Swal.fire({
                title: "Detalles del mantenimiento",

                html: `
                    <div style="text-align:left">
                        <p><strong>Código:</strong> ${escaparHTML(registro.codigo)}</p>
                        <p><strong>Cliente:</strong> ${escaparHTML(registro.nombre)}</p>
                        <p><strong>Correo:</strong> ${escaparHTML(registro.correo)}</p>
                        <p><strong>Teléfono:</strong> ${escaparHTML(registro.telefono)}</p>
                        <p><strong>Vehículo:</strong> ${escaparHTML(registro.marca)} ${escaparHTML(registro.modelo)}</p>
                        <p><strong>Placa:</strong> ${escaparHTML(registro.placa)}</p>
                        <p><strong>Año:</strong> ${escaparHTML(registro.anio)}</p>
                        <p><strong>Tipo:</strong> ${escaparHTML(registro.tipo)}</p>
                        <p><strong>Prioridad:</strong> ${escaparHTML(registro.prioridad || "Normal")}</p>
                        <p><strong>Fecha:</strong> ${escaparHTML(registro.fecha)}</p>
                        <p><strong>Descripción:</strong> ${escaparHTML(registro.descripcion)}</p>
                        <p><strong>Estado:</strong> ${escaparHTML(registro.estado)}</p>
                    </div>
                `,

                icon: "info"
            });
        }


        // ELIMINAR MANTENIMIENTO

        if (boton.classList.contains("eliminar-registro")) {

            Swal.fire({
                title: "¿Eliminar solicitud?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"

            }).then(resultado => {

                if (resultado.isConfirmed && esAdministrador()) {

                    const actualizados = obtenerMantenimientos().filter(
                        item => item.id !== id
                    );

                    if (guardarMantenimientos(actualizados)) {

                        mostrarMantenimientos(
                            buscarRegistro ? buscarRegistro.value : ""
                        );

                        Swal.fire(
                            "Eliminado",
                            "La solicitud fue eliminada.",
                            "success"
                        );
                    }
                }
            });
        }

    });
}


// ==========================================
// GESTION DE CLIENTES
// ==========================================

const tablaClientes = document.getElementById("tablaClientes");
const buscarCliente = document.getElementById("buscarCliente");
const totalClientes = document.getElementById("totalClientes");


// ==========================================
// MOSTRAR CLIENTES REGISTRADOS
// ==========================================

function mostrarClientes(filtro = "") {

    if (!tablaClientes) {
        return;
    }

    if (!obtenerUsuarioActivo() || !esAdministrador()) {
        window.location.replace("login.html");
        return;
    }

    const clientes = obtenerClientes();

    if (totalClientes) {
        totalClientes.textContent = clientes.length;
    }

    const texto = filtro.toLowerCase().trim();

    const filtrados = clientes.filter(cliente => {

        const nombre = String(cliente.nombre || "").toLowerCase();
        const correo = String(cliente.correo || "").toLowerCase();
        const usuario = String(cliente.usuario || "").toLowerCase();

        return nombre.includes(texto) ||
            correo.includes(texto) ||
            usuario.includes(texto);
    });

    if (filtrados.length === 0) {

        tablaClientes.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No hay clientes registrados.
                </td>
            </tr>
        `;

        return;
    }

    tablaClientes.innerHTML = filtrados.map(cliente => {

        return `
            <tr>
                <td>${escaparHTML(cliente.nombre)}</td>
                <td>${escaparHTML(cliente.correo)}</td>
                <td>${escaparHTML(cliente.telefono)}</td>
                <td>${escaparHTML(cliente.usuario)}</td>
                <td>
                    <span class="badge bg-success">
                        ${escaparHTML(cliente.rol || "cliente")}
                    </span>
                </td>
                <td><span class="badge ${cliente.activo === false ? "bg-secondary" : "bg-success"}">${cliente.activo === false ? "Deshabilitada" : "Activa"}</span></td>
                <td>
                    <button class="btn btn-outline-warning btn-sm cambiar-estado-cliente" data-id="${cliente.id}">${cliente.activo === false ? "Habilitar" : "Deshabilitar"}</button>
                    <button
                        class="btn btn-danger btn-sm eliminar-cliente"
                        data-id="${cliente.id}">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// ==========================================
// BUSCAR CLIENTES
// ==========================================

if (buscarCliente) {

    buscarCliente.addEventListener("input", function() {
        mostrarClientes(this.value);
    });

}


// ==========================================
// ELIMINAR CLIENTES
// ==========================================

if (tablaClientes) {

    tablaClientes.addEventListener("click", function(evento) {

        if (!esAdministrador()) {
            cerrarSesion();
            return;
        }

        const boton = evento.target.closest(".eliminar-cliente, .cambiar-estado-cliente");

        if (!boton) {
            return;
        }

        const id = Number(boton.dataset.id);

        if (boton.classList.contains("cambiar-estado-cliente")) {
            const clientes = obtenerClientes();
            const cliente = clientes.find(item => Number(item.id) === id);
            if (!cliente) return;
            const deshabilitar = cliente.activo !== false;
            Swal.fire({
                title: deshabilitar ? "¿Deshabilitar cuenta?" : "¿Habilitar cuenta?",
                text: deshabilitar ? "El usuario ya no podrá iniciar sesión." : "El usuario podrá iniciar sesión otra vez.",
                icon: "warning", showCancelButton: true,
                confirmButtonText: deshabilitar ? "Deshabilitar" : "Habilitar",
                cancelButtonText: "Cancelar"
            }).then(resultado => {
                if (!resultado.isConfirmed || !esAdministrador()) return;
                cliente.activo = !deshabilitar;
                if (guardarClientes(clientes)) mostrarClientes(buscarCliente ? buscarCliente.value : "");
            });
            return;
        }

        Swal.fire({
            title: "¿Eliminar cliente?",
            text: "El cliente será eliminado de la lista de usuarios registrados.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"

        }).then(resultado => {

            if (resultado.isConfirmed && esAdministrador()) {

                const clientes = obtenerClientes();

                const actualizados = clientes.filter(
                    cliente => Number(cliente.id) !== id
                );

                if (guardarClientes(actualizados)) {

                    mostrarClientes(
                        buscarCliente ? buscarCliente.value : ""
                    );

                    Swal.fire(
                        "Eliminado",
                        "El cliente fue eliminado correctamente.",
                        "success"
                    );

                } else {

                    Swal.fire(
                        "Error",
                        "No se pudo eliminar el cliente.",
                        "error"
                    );
                }
            }
        });
    });
}


// ==========================================
// CERRAR SESION
// ==========================================

const botonCerrarSesion = document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", cerrarSesion);
}


// ==========================================
// INICIALIZAR PANELES
// ==========================================

mostrarMantenimientos();
mostrarClientes();


// ==========================================
// FUNCIONES DISPONIBLES
// ==========================================

window.listarMantenimientos = obtenerMantenimientos;

window.buscarMantenimiento = function(placa) {
    return obtenerMantenimientos().filter(
        registro => registro.placa === placa.toUpperCase()
    );
};

window.guardarMantenimientos = guardarMantenimientos;

window.listarClientes = obtenerClientes;
