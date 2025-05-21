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
});