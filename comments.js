class CommentSystem {
    constructor() {
        this.comments = [];
        this.currentUser = null;
        this.maxComments = 3000;
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.userLikes = this.loadUserLikes(); // Cargar likes del usuario
        this.validDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@live.com'];
        this.renderComments(); // Añadir esta línea para mostrar comentarios al inicio
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Comment form
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addComment();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    handleLogin() {
        const email = document.getElementById('username').value.toLowerCase();
        const password = document.getElementById('password').value;

        // Verificar que sea un email válido
        if (!this.isValidEmail(email)) {
            this.showError('Por favor, ingresa un correo válido de Gmail o Microsoft');
            return;
        }

        // Verificar que el dominio sea permitido
        if (!this.isAllowedDomain(email)) {
            this.showError('Solo se permiten cuentas de Gmail o Microsoft');
            return;
        }

        // Si las validaciones pasan, hacer login
        if (email && password) {
            this.currentUser = email;
            localStorage.setItem('currentUser', email);
            this.updateUI(true);
            this.hideError();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isAllowedDomain(email) {
        return this.validDomains.some(domain => email.endsWith(domain));
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI(false);
    }

    addComment() {
        if (!this.currentUser) return;

        const commentText = document.getElementById('commentText').value;
        if (!commentText) return;

        const newComment = {
            id: Date.now(),
            user: this.currentUser,
            text: commentText,
            date: new Date().toISOString(),
            likes: 0
        };

        this.comments.unshift(newComment);
        if (this.comments.length > this.maxComments) {
            this.comments.pop();
        }

        this.saveToLocalStorage();
        this.renderComments();
        document.getElementById('commentText').value = '';
    }

    renderComments() {
        const commentsContainer = document.getElementById('commentsList');
        commentsContainer.innerHTML = '';

        this.comments.forEach(comment => {
            const likeKey = this.currentUser ? `${this.currentUser}-${comment.id}` : null;
            const hasLiked = this.userLikes[likeKey];
            
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <strong>${comment.user}</strong>
                    <span>${new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <div class="comment-body">${comment.text}</div>
                <div class="comment-footer">
                    ${this.currentUser ? `
                        <button 
                            onclick="commentSystem.likeComment(${comment.id})"
                            class="like-btn ${hasLiked ? 'liked' : ''}"
                            ${hasLiked ? 'disabled' : ''}
                        >
                            ${hasLiked ? '❤️' : '👍'} ${comment.likes}
                        </button>
                        ${comment.user === this.currentUser ? 
                            `<button class="delete-btn" onclick="commentSystem.deleteComment(${comment.id})">
                                🗑️ Borrar
                            </button>` : 
                            ''}
                    ` : `
                        <button class="like-btn" onclick="alert('Inicia sesión para dar like')">
                            👍 ${comment.likes}
                        </button>
                    `}
                </div>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }

    likeComment(id) {
        if (!this.currentUser) return; // Usuario debe estar logueado

        // Crear key única para el par usuario-comentario
        const likeKey = `${this.currentUser}-${id}`;

        // Verificar si el usuario ya dio like
        if (this.userLikes[likeKey]) {
            return; // Ya dio like, no hacer nada
        }

        const comment = this.comments.find(c => c.id === id);
        if (comment) {
            comment.likes++;
            this.userLikes[likeKey] = true; // Registrar el like
            this.saveToLocalStorage();
            this.saveUserLikes();
            this.renderComments();
        }
    }

    deleteComment(id) {
        // Verificar que el usuario esté logueado y sea el autor del comentario
        if (!this.currentUser) return;

        const comment = this.comments.find(c => c.id === id);
        if (comment && comment.user === this.currentUser) {
            // Filtrar el comentario a eliminar
            this.comments = this.comments.filter(c => c.id !== id);
            
            // Eliminar los likes asociados a este comentario
            Object.keys(this.userLikes).forEach(key => {
                if (key.includes(`-${id}`)) {
                    delete this.userLikes[key];
                }
            });

            // Guardar cambios y actualizar UI
            this.saveToLocalStorage();
            this.saveUserLikes();
            this.renderComments();
        }
    }

    loadFromLocalStorage() {
        const savedComments = localStorage.getItem('comments');
        if (savedComments) {
            this.comments = JSON.parse(savedComments);
        }
        
        this.currentUser = localStorage.getItem('currentUser');
        this.updateUI(!!this.currentUser);
    }

    saveToLocalStorage() {
        localStorage.setItem('comments', JSON.stringify(this.comments));
    }

    loadUserLikes() {
        const savedLikes = localStorage.getItem('userLikes');
        return savedLikes ? JSON.parse(savedLikes) : {};
    }

    saveUserLikes() {
        localStorage.setItem('userLikes', JSON.stringify(this.userLikes));
    }

    updateUI(isLoggedIn) {
        document.getElementById('loginSection').style.display = isLoggedIn ? 'none' : 'block';
        document.getElementById('commentSection').style.display = isLoggedIn ? 'block' : 'none';
        
        // Siempre mostrar la lista de comentarios
        document.getElementById('commentsList').style.display = 'block';
        
        if (isLoggedIn) {
            document.getElementById('userDisplay').textContent = `Usuario: ${this.currentUser}`;
        }
    }

    // Agregar método para manejar el login de Google
    handleGoogleLogin(response) {
        const decoded = jwt_decode(response.credential);
        const email = decoded.email;
        
        if (this.isAllowedDomain(email)) {
            this.currentUser = email;
            localStorage.setItem('currentUser', email);
            this.updateUI(true);
            this.hideError();
        } else {
            this.showError('Solo se permiten cuentas de Gmail');
        }
    }
}

// Función global para el callback de Google
function handleGoogleLogin(response) {
    commentSystem.handleGoogleLogin(response);
}

const commentSystem = new CommentSystem();