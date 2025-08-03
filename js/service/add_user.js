function validator(email, password, password_two) {
    if (password !== password_two) {
        alert("La contraseña no es la misma");
        return false;
    }
    if (email.indexOf('@') === -1) {
        alert("Email no válido");
        return false;
    } if(email === null || email === ''){
        alert("Email vacio");
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
                alert(`Usuario registrado exitosamente. JWT: ${data.usuario.token.substring(0, 50)}...`);
                
                // Limpiar formulario después de éxito
                document.getElementById('first_name').value = '';
                document.getElementById('last_name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                document.getElementById('confirm_password').value = '';
            } else {
                console.error("Error del servidor:", data);
                alert(data.message || "Error al registrar usuario");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión con el servidor. Asegúrate de que esté ejecutándose en puerto 3000.");
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
