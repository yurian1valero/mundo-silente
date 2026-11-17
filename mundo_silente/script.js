// ==========================================
// 1. NAVEGACIÓN ENTRE VISTAS (SPA Simple)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const vistas = document.querySelectorAll('.vista');
    const enlacesNav = document.querySelectorAll('.nav-link, .nav-link-btn');

    function cambiarVista(targetId) {
        vistas.forEach(vista => {
            if (vista.id === targetId) {
                vista.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                vista.style.display = 'none';
            }
        });
    }

    enlacesNav.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            const target = enlace.getAttribute('data-target');
            if (target) {
                cambiarVista(target);
            }
        });
    });

    // ==========================================
    // 2. SÍNTESIS DE VOZ Y BOTÓN DE SILENCIAR
    // ==========================================
    let audioSilenciado = false;
    const btnToggleAudio = document.getElementById('btnToggleAudio');
    const audioIconState = document.getElementById('audioIconState');
    const audioAsText = document.getElementById('audioAsText');

    if (btnToggleAudio) {
        btnToggleAudio.addEventListener('click', () => {
            audioSilenciado = !audioSilenciado;
            if (audioSilenciado) {
                audioIconState.className = "fa-solid fa-volume-xmark";
                audioAsText.textContent = "Audio Silenciado";
            } else {
                audioIconState.className = "fa-solid fa-volume-high";
                audioAsText.textContent = "Audio Activado";
            }
        });
    }

    function hablarLetra(texto) {
        if (audioSilenciado) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Detener cualquier audio previo
            const utterance = new SpeechSynthesisUtterance(`Letra ${texto}`);
            utterance.lang = 'es-CO';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Vincular botones de micrófono en cada tarjeta
    const botonesVoz = document.querySelectorAll('.btn-speak');
    botonesVoz.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se abra el lightbox al presionar el micrófono
            const letra = btn.getAttribute('data-letra');
            hablarLetra(letra);
        });
    });

    // ==========================================
    // 3. VENTANA LIGHTBOX (VER SEÑA EN GRANDE)
    // ==========================================
    const tarjetas = document.querySelectorAll('.letter-card'); 
    const ventana = document.getElementById('lightbox'); 
    const imagenGrande = document.getElementById('lb-img'); 
    const letraGrande = document.getElementById('lb-letter'); 
    let indiceActual = 0; 

    function mostrarLetra(indice) { 
        indiceActual = (indice + tarjetas.length) % tarjetas.length; 
        const tarjeta = tarjetas[indiceActual]; 
        const imagen = tarjeta.querySelector('img'); 
        const nombreLetra = tarjeta.querySelector('.letter-name').textContent;

        imagenGrande.src = imagen.src; 
        imagenGrande.alt = imagen.alt; 
        letraGrande.textContent = nombreLetra; 
        
        // Opcional: Hablar la letra al abrirla en grande
        hablarLetra(nombreLetra);
    } 

    function abrir(indice) { 
        mostrarLetra(indice); 
        ventana.classList.add('open'); 
        ventana.setAttribute('aria-hidden', 'false'); 
    } 

    function cerrar() { 
        ventana.classList.remove('open'); 
        ventana.setAttribute('aria-hidden', 'true'); 
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } 

    tarjetas.forEach((tarjeta, indice) => { 
        tarjeta.addEventListener('click', () => abrir(indice)); 
        tarjeta.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter' || e.key === ' ') { 
                e.preventDefault(); 
                abrir(indice); 
            } 
        }); 
    }); 

    const btnClose = document.querySelector('.lb-close');
    const btnPrev = document.querySelector('.lb-prev');
    const btnNext = document.querySelector('.lb-next');

    if (btnClose) btnClose.addEventListener('click', cerrar); 
    if (btnPrev) btnPrev.addEventListener('click', () => mostrarLetra(indiceActual - 1)); 
    if (btnNext) btnNext.addEventListener('click', () => mostrarLetra(indiceActual + 1)); 

    ventana.addEventListener('click', (e) => { 
        if (e.target === ventana) cerrar(); 
    }); 

    document.addEventListener('keydown', (e) => { 
        if (!ventana.classList.contains('open')) return; 
        if (e.key === 'Escape') cerrar(); 
        if (e.key === 'ArrowLeft') mostrarLetra(indiceActual - 1); 
        if (e.key === 'ArrowRight') mostrarLetra(indiceActual + 1); 
    });

    // ==========================================
    // 4. MÓDULO DE TRADUCTOR INTERACTIVO
    // ==========================================
    const btnDeletrear = document.getElementById('btnDeletrear');
    const textoUsuario = document.getElementById('textoUsuario');
    const resultadoSeñas = document.getElementById('resultadoSeñas');
    const letrasValidas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'enie', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    if (btnDeletrear && textoUsuario && resultadoSeñas) {
        btnDeletrear.addEventListener('click', () => {
            const texto = textoUsuario.value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            resultadoSeñas.innerHTML = '';

            if (texto === '') {
                resultadoSeñas.innerHTML = '<p style="color: var(--earth-brown); font-size: 0.9rem;">Por favor, escribe una palabra válida.</p>';
                return;
            }

            for (let i = 0; i < texto.length; i++) {
                let char = texto[i];
                if (char === 'ñ') char = 'enie';

                if (letrasValidas.includes(char)) {
                    const contenedorMini = document.createElement('div');
                    contenedorMini.style.cssText = 'background: var(--nude-light); padding: 8px; border-radius: 10px; text-align: center; border: 1px solid var(--earth-sand);';
                    
                    const img = document.createElement('img');
                    img.src = `img/abecedario/${char}.png`;
                    img.alt = `Seña ${char === 'enie' ? 'Ñ' : char.toUpperCase()}`;
                    img.style.cssText = 'width: 50px; height: 50px; object-fit: contain; display: block; margin: 0 auto;';
                    
                    const label = document.createElement('span');
                    label.textContent = char === 'enie' ? 'Ñ' : char.toUpperCase();
                    label.style.cssText = 'font-family: "Quicksand", sans-serif; font-weight: 700; font-size: 0.8rem; color: var(--earth-brown); margin-top: 4px; display: block;';

                    contenedorMini.appendChild(img);
                    contenedorMini.appendChild(label);
                    resultadoSeñas.appendChild(contenedorMini);
                } else if (char === ' ') {
                    const espacio = document.createElement('div');
                    espacio.style.width = '15px';
                    resultadoSeñas.appendChild(espacio);
                }
            }
        });
    }
});