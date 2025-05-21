document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.component-card');

    cards.forEach(card => {
        const infoBtn = card.querySelector('.info-btn');
        const infoDetails = card.querySelector('.info-details');

        if (infoBtn && infoDetails) {
            infoBtn.addEventListener('click', () => {
                // Crear el modal
                const modalOverlay = document.createElement('div');
                modalOverlay.className = 'modal-overlay';

                const modalContent = document.createElement('div');
                modalContent.className = 'modal-content';

                // Clonar el contenido
                const contentClone = infoDetails.cloneNode(true);
                contentClone.style.display = 'block';

                // Agregar el título de la tarjeta al modal
                const title = document.createElement('h3');
                title.textContent = card.querySelector('h4').textContent;
                modalContent.appendChild(title);
                modalContent.appendChild(contentClone);
                
                modalOverlay.appendChild(modalContent);
                document.body.appendChild(modalOverlay);

                // Mostrar el modal con animación
                requestAnimationFrame(() => {
                    modalOverlay.classList.add('active');
                    modalContent.classList.add('active');
                });

                // Prevenir scroll del body
                document.body.style.overflow = 'hidden';

                // Cerrar modal al hacer clic fuera
                modalOverlay.addEventListener('click', (e) => {
                    if (e.target === modalOverlay) {
                        modalOverlay.classList.remove('active');
                        modalContent.classList.remove('active');
                        
                        // Restaurar scroll
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

    // Sistema de comentarios
    class CommentSystem {
        constructor(productId) {
            this.productId = productId;
            this.comments = [];
            this.loadComments();
            this.initializeListeners();
        }

        loadComments() {
            const savedComments = localStorage.getItem(`comments_${this.productId}`);
            if (savedComments) {
                this.comments = JSON.parse(savedComments);
                this.renderComments();
            }
        }

        saveComments() {
            localStorage.setItem(`comments_${this.productId}`, JSON.stringify(this.comments));
        }

        addComment(text, rating) {
            const comment = {
                id: Date.now(),
                text: text,
                rating: rating,
                date: new Date().toISOString(),
                likes: 0,
                replies: []
            };

            this.comments.unshift(comment);
            this.saveComments();
            this.renderComments();
        }

        renderComments() {
            const commentsList = document.querySelector('.comments-list');
            if (!commentsList) return;

            commentsList.innerHTML = this.comments.map(comment => `
                <div class="comment" data-id="${comment.id}">
                    <div class="comment-rating">
                        ${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-meta">
                        <span class="comment-date">${new Date(comment.date).toLocaleDateString()}</span>
                        <button class="like-btn" data-id="${comment.id}">
                            👍 ${comment.likes}
                        </button>
                    </div>
                </div>
            `).join('');

            this.initializeLikeButtons();
        }

        initializeListeners() {
            const form = document.getElementById('commentForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const text = document.getElementById('commentText').value;
                    const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
                    
                    if (text.trim()) {
                        this.addComment(text, parseInt(rating));
                        form.reset();
                    }
                });
            }
        }

        initializeLikeButtons() {
            document.querySelectorAll('.like-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const commentId = parseInt(button.dataset.id);
                    const comment = this.comments.find(c => c.id === commentId);
                    if (comment) {
                        comment.likes++;
                        this.saveComments();
                        this.renderComments();
                    }
                });
            });
        }
    }

    // Inicializar el sistema de comentarios
    const commentSystem = new CommentSystem('general');

    // Control del menú lateral
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    let isMenuVisible = true;

    // Función para alternar el menú
    function toggleMenu() {
        isMenuVisible = !isMenuVisible;
        
        if (!isMenuVisible) {
            // Ocultar sidebar y mostrar botón
            sidebar.classList.add('hidden');
            content.classList.add('expanded');
        } else {
            // Mostrar sidebar y ocultar botón
            sidebar.classList.remove('hidden');
            content.classList.remove('expanded');
        }
    }

    // Click en el documento
    document.addEventListener('click', (e) => {
        // Lista de elementos a ignorar
        const ignoreElements = [
            '.sidebar',           // Barra lateral
            '.component-card',    // Tarjetas de componentes
            '.info-btn',         // Botones de información
            '.comment-form',     // Formulario de comentarios
            '.comments-section', // Sección de comentarios
            '.modal-overlay',    // Modal
            '.modal-content',    // Contenido del modal
            'button',           // Cualquier botón
            'input',           // Campos de entrada
            'textarea'         // Áreas de texto
        ];

        // Verificar si el clic fue en un elemento a ignorar
        const shouldIgnore = ignoreElements.some(selector => {
            const element = e.target.closest(selector);
            return element !== null;
        });

        // Si no es un elemento a ignorar y no está dentro del sidebar
        if (!shouldIgnore && !sidebar.contains(e.target)) {
            toggleMenu();
        }
    });

    // Evitar que los clics dentro del sidebar cierren el menú
    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Obtener todos los botones de información y cierre
    const infoButtons = document.querySelectorAll('.info-btn');
    const closeButtons = document.querySelectorAll('.close-btn');

    // Agregar evento click a los botones de información
    infoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.component-card');
            const content = card.querySelector('.card-content');
            
            // Agregar clase para mostrar el contenido
            content.style.display = 'block';
            content.style.maxHeight = content.scrollHeight + 'px';
        });
    });

    // Agregar evento click a los botones de cierre
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const content = this.closest('.card-content');
            
            // Ocultar el contenido
            content.style.maxHeight = '0';
            setTimeout(() => {
                content.style.display = 'none';
            }, 300); // Tiempo de la animación
        });
    });
});