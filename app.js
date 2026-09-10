// BASE DE DATOS DE SOCIOS VIP (INCLUYE AL PROFESOR LUIS AGUIRRE)
const SOCIOS_VIP = [
    { pin: "VIP-LUIS-AGUIRRE-2026", nombre: "Prof. Luis Aguirre", rol: "Director & Asesor Honorario", nivel: "Honorary Executive Council" },
    { pin: "VIP-ERICK-2026", nombre: "Erick", rol: "Socio Fundador & Director", nivel: "Black Diamond" },
    { pin: "VIP-PATRICIO-2026", nombre: "Patricio", rol: "Socio Ejecutivo", nivel: "Platinum Premier" },
    { pin: "VIP-AURORA-2026", nombre: "Aurora", rol: "Socio Ejecutivo", nivel: "Platinum Premier" },
    { pin: "VIP-EMIR-2026", nombre: "Emir", rol: "Socio Ejecutivo", nivel: "Platinum Premier" },
    { pin: "VIP-ZAZA-2026", nombre: "Zaza", rol: "Socio Ejecutivo", nivel: "Platinum Premier" },
    { pin: "VIP-SEBASTIAN-2026", nombre: "Sebastián", rol: "Socio Ejecutivo", nivel: "Platinum Premier" }
];

let html5QrCode = null;
let carrito = [];

document.addEventListener("DOMContentLoaded", () => {
    // Restaurar Tema
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    actualizarBotonTema(savedTheme);

    // Restaurar Color
    const savedAccent = localStorage.getItem("accentColor");
    if (savedAccent) {
        document.documentElement.style.setProperty("--accent", savedAccent);
        document.documentElement.style.setProperty("--accent-hover", savedAccent);
    }

    // Restaurar Sesión VIP
    const activeVIP = localStorage.getItem("activeVipUser");
    if (activeVIP) {
        activarModoVIP(JSON.parse(activeVIP), false);
    }
});

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    actualizarBotonTema(newTheme);
}

function actualizarBotonTema(theme) {
    const btn = document.getElementById("btnTheme");
    if (btn) btn.innerHTML = theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
}

function cambiarPaletteTexto() {
    const colores = ["#2563eb", "#059669", "#7c3aed", "#db2777", "#ea580c", "#d4af37"];
    const colorAzar = colores[Math.floor(Math.random() * colores.length)];
    document.documentElement.style.setProperty("--accent", colorAzar);
    document.documentElement.style.setProperty("--accent-hover", colorAzar);
    localStorage.setItem("accentColor", colorAzar);
}

function filtrarMenu(categoria, elementoBoton) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    if (elementoBoton) elementoBoton.classList.add("active");

    const tarjetas = document.querySelectorAll(".menu-card");
    tarjetas.forEach(card => {
        const catCard = card.getAttribute("data-category");
        card.style.display = (categoria === "todos" || catCard === categoria) ? "block" : "none";
    });
}

function agregarAlPedido(nombre, precio) {
    carrito.push({ nombre, precio });
    actualizarCarritoGUI();
    document.getElementById("cartDrawer").style.display = "block";
}

function toggleCart() {
    const drawer = document.getElementById("cartDrawer");
    drawer.style.display = drawer.style.display === "block" ? "none" : "block";
}

function actualizarCarritoGUI() {
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotalAmount");
    
    if (carrito.length === 0) {
        container.innerHTML = `<p class="empty-cart">No has agregado elementos aún.</p>`;
        totalEl.innerText = "$0 MXN";
        return;
    }

    let html = "";
    let total = 0;
    carrito.forEach((item) => {
        total += item.precio;
        html += `
            <div class="cart-item-row">
                <span>${item.nombre}</span>
                <strong>$${item.precio} MXN</strong>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.innerText = `$${total} MXN`;
}

function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return;
    let mensaje = "Hola, me gustaría ordenar los siguientes platillos:\n";
    carrito.forEach(i => mensaje += `- ${i.nombre} ($${i.precio} MXN)\n`);
    const total = carrito.reduce((sum, i) => sum + i.precio, 0);
    mensaje += `Total: $${total} MXN`;

    const url = `https://wa.me/529988812345?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

function abrirModalVIP() {
    document.getElementById("modalVIP").style.display = "flex";
}

function cerrarModalVIP() {
    document.getElementById("modalVIP").style.display = "none";
    detenerEscanerQR();
    limpiarFeedback("msgVIP");
}

function cambiarTabVIP(tab, elemento) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    elemento.classList.add("active");

    if (tab === "pin") {
        document.getElementById("secPin").style.display = "block";
        document.getElementById("secQR").style.display = "none";
        detenerEscanerQR();
    } else {
        document.getElementById("secPin").style.display = "none";
        document.getElementById("secQR").style.display = "block";
        iniciarEscanerQR();
    }
}

function validarPinVIP() {
    const pin = document.getElementById("inputPinVIP").value.trim().toUpperCase();
    const socio = SOCIOS_VIP.find(s => s.pin === pin);

    if (socio) {
        activarModoVIP(socio, true);
    } else {
        mostrarFeedback("msgVIP", "PIN o Código VIP Inválido", "error");
    }
}

function iniciarEscanerQR() {
    if (typeof Html5Qrcode === "undefined") {
        mostrarFeedback("msgVIP", "Cargando librería de cámara...", "error");
        return;
    }

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
            const socio = SOCIOS_VIP.find(s => s.pin === decodedText.trim().toUpperCase());
            if (socio) {
                detenerEscanerQR();
                activarModoVIP(socio, true);
            } else {
                mostrarFeedback("msgVIP", "Código QR no registrado", "error");
            }
        },
        () => {}
    ).catch(() => {
        mostrarFeedback("msgVIP", "No se pudo acceder a la cámara", "error");
    });
}

function detenerEscanerQR() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
    }
}

function activarModoVIP(socio, mostrarNotificacion) {
    document.documentElement.setAttribute("data-vip", "true");
    localStorage.setItem("activeVipUser", JSON.stringify(socio));

    const banner = document.getElementById("vipBanner");
    document.getElementById("vipNombre").innerText = `¡Bienvenido, ${socio.nombre}!`;
    document.getElementById("vipMembresia").innerText = `Membresía ${socio.nivel} • ${socio.rol}`;
    banner.style.display = "flex";

    reproducirEfectosVIP();
    cerrarModalVIP();

    if (mostrarNotificacion) {
        alert(`✨ Acceso VIP Concedido. Bienvenido ${socio.nombre} (${socio.nivel})`);
    }
}

function reproducirEfectosVIP() {
    const audio = document.getElementById("soundVIP");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
    if (typeof confetti === "function") {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
}

function cerrarSesionVIP() {
    document.documentElement.removeAttribute("data-vip");
    localStorage.removeItem("activeVipUser");
    document.getElementById("vipBanner").style.display = "none";
    
    const savedAccent = localStorage.getItem("accentColor") || "#2563eb";
    document.documentElement.style.setProperty("--accent", savedAccent);
    document.documentElement.style.setProperty("--accent-hover", savedAccent);
}

function procesarReserva() {
    const nombre = document.getElementById("nombre").value;
    const fecha = document.getElementById("fecha").value;
    const personas = document.getElementById("personas").value;

    const esVIP = document.documentElement.getAttribute("data-vip") === "true";
    const mensaje = esVIP 
        ? `👑 ¡Reservación VIP Especial Confirmada para ${nombre}! Mesa reservada para ${personas} personas el ${fecha}. Beneficio aplicado: Descuento Ejecutivo & Cava Incluida.`
        : `¡Reservación Confirmada para ${nombre}! Te esperamos el ${fecha} (${personas} personas).`;

    mostrarFeedback("mensajeReserva", mensaje, "success");
    document.getElementById("formReserva").reset();
}

function enviarPostulacion() {
    const candidato = document.getElementById("candidatoNombre").value;
    const puesto = document.getElementById("puesto").value;

    mostrarFeedback("mensajeTrabajo", `¡Gracias ${candidato}! Hemos recibido tu candidatura para la vacante de ${puesto}.`, "success");
    document.getElementById("formTrabajo").reset();
}

function mostrarFeedback(idElemento, texto, tipo) {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.innerText = texto;
    el.className = `feedback-msg ${tipo}`;
}

function limpiarFeedback(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) {
        el.innerText = "";
        el.className = "feedback-msg";
    }
}