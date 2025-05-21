document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.component-card');

    cards.forEach(card => {
        const infoBtn = card.querySelector('.info-btn');
        const cardContent = card.querySelector('.card-content');

        if (infoBtn && cardContent) {
            infoBtn.addEventListener('click', () => {
                // Crear overlay
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';

                // Crear contenido modal
                const modalContent = document.createElement('div');
                modalContent.className = 'modal-content';

                // Obtener título e ícono
                const title = card.querySelector('.card-header h4').textContent;
                const icon = card.querySelector('.card-header i').cloneNode(true);
                
                // Crear encabezado del modal
                const modalHeader = document.createElement('div');
                modalHeader.className = 'modal-header';
                modalHeader.appendChild(icon);
                modalHeader.innerHTML += `<h4>${title}</h4>`;

                // Clonar el contenido
                const content = cardContent.querySelector('.info-details').cloneNode(true);
                
                // Construir modal
                modalContent.appendChild(modalHeader);
                modalContent.appendChild(content);
                modalOverlay.appendChild(modalContent);
                document.body.appendChild(modalOverlay);

                // Prevenir scroll del body
                document.body.style.overflow = 'hidden';

                // Mostrar modal con animación
                requestAnimationFrame(() => {
                    modalOverlay.classList.add('active');
                    modalContent.classList.add('active');
                });

                // Cerrar al hacer clic fuera
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                        modalOverlay.classList.remove('active');
                        modalContent.classList.remove('active');
                        document.body.style.overflow = '';
                        
                        setTimeout(() => {
                            document.body.removeChild(modalOverlay);
                        }, 300);
                    }
                });

                // Cerrar con ESC
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        modalOverlay.click();
                    }
                });
            });
        }
    });

    // Configuración de Google Sign-In
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: "32579672627-<resto>.apps.googleusercontent.com"
        }).then(() => {
            console.log('Autenticación de Google inicializada correctamente');
            
            // Renderizar el botón de Google
            google.accounts.id.renderButton(
                document.getElementById("googleSignIn"),
                { 
                    theme: "outline", 
                    size: "large",
                    width: 250 
                }
            );
        }).catch(error => {
            console.error('Error al inicializar Google Auth:', error);
        });
    });
});

function handleGoogleLogin(response) {
    const decoded = jwt_decode(response.credential);
    const email = decoded.email;
    
    if (email.endsWith('@gmail.com')) {
        // Login exitoso
        localStorage.setItem('currentUser', email);
        updateUI(true);
    } else {
        showError('Solo se permiten cuentas de Gmail');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function updateUI(isLoggedIn) {
    document.getElementById('loginSection').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('commentSection').style.display = isLoggedIn ? 'block' : 'none';
    if (isLoggedIn) {
        document.getElementById('userDisplay').textContent = `Usuario: ${localStorage.getItem('currentUser')}`;
    }
}