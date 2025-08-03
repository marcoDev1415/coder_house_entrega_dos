function validator(email, password, password_two) {
    if (password !== password_two) {
        Swal.fire({
            icon: 'warning',
            title: 'Error de Validación',
            text: 'Las contraseñas no coinciden',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }
    if (email.indexOf('@') === -1) {
        Swal.fire({
            icon: 'warning',
            title: 'Email Inválido',
            text: 'Por favor ingresa un email válido',
            confirmButtonColor: '#3085d6'
        });
        return false;
    } if(email === null || email === ''){
        Swal.fire({
            icon: 'warning',
            title: 'Campo Requerido',
            text: 'El email es obligatorio',
            confirmButtonColor: '#3085d6'
        });
        return false;
    }
    return true;
}

// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

export async function add_user(first_name, last_name, email, password, confirm_password) {
    if (validator(email, password, confirm_password)) {
        try {
            // Mostrar indicador de carga
            const submitButton = document.getElementById('Submit');
            if (submitButton) {
                submitButton.textContent = 'Agregando...';
                submitButton.disabled = true;
            }

            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: first_name,
                    lastName: last_name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Usuario agregado exitosamente:", data);
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Registrado!',
                    html: `
                        <div class="text-left">
                            <p class="mb-2"><strong>✅ Usuario:</strong> ${data.usuario.firstName} ${data.usuario.lastName}</p>
                            <p class="mb-2"><strong>📧 Email:</strong> ${data.usuario.email}</p>
                            <p class="mb-2"><strong>🔐 JWT Token:</strong></p>
                            <div class="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                                ${data.usuario.token.substring(0, 50)}...
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#10b981',
                    confirmButtonText: '¡Perfecto!'
                });
                
                // Limpiar formulario después de éxito
                document.getElementById('first_name').value = '';
                document.getElementById('last_name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                document.getElementById('confirm_password').value = '';
            } else {
                console.error("Error del servidor:", data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error del Servidor',
                    text: data.message || "Error al registrar usuario",
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: "No se pudo conectar con el servidor. Asegúrate de que esté ejecutándose en puerto 3000.",
                confirmButtonColor: '#ef4444'
            });
        } finally {
            // Restaurar botón
            const submitButton = document.getElementById('Submit');
            if (submitButton) {
                submitButton.textContent = 'Agregar';
                submitButton.disabled = false;
            }
        }
    }
}
