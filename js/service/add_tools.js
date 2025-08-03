// Script para agregar herramientas (APIs) con encriptación automática
// Conecta con el backend para encriptar las API keys automáticamente

// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

// Obtener referencias a los inputs y al formulario
const form = document.getElementById('form-add-tool');
const inputApiKey = document.getElementById('api_key');
const inputNombreApi = document.getElementById('nombre_api');

// Función para guardar una nueva API Key (con encriptación automática)
async function addTool(event) {
    event.preventDefault();
    
    // Obtener valores de los inputs
    const api_key = inputApiKey.value.trim();
    const nombre_api = inputNombreApi.value.trim();
    
    if (!api_key || !nombre_api) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Por favor, completa todos los campos requeridos.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // Mostrar indicador de carga
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Encriptando y guardando...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api-keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre_api: nombre_api,
                api_key: api_key
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log("API Key agregada y encriptada:", data);
            Swal.fire({
                icon: 'success',
                title: '¡API Key Agregada!',
                html: `
                    <div class="text-left">
                        <p class="mb-2"><strong>✅ API:</strong> ${data.data.nombre_api}</p>
                        <p class="mb-2"><strong>🔐 Encriptación:</strong> AES-256-CBC</p>
                        <p class="mb-2"><strong>👀 Preview:</strong></p>
                        <div class="bg-gray-100 p-2 rounded text-xs font-mono">
                            ${data.data.api_key_preview}
                        </div>
                        <p class="text-xs text-gray-600 mt-2">📅 ${new Date(data.data.fechaCreacion).toLocaleString('es-ES')}</p>
                    </div>
                `,
                confirmButtonColor: '#10b981',
                confirmButtonText: '¡Excelente!'
            });
            
            // Limpiar formulario
            form.reset();
        } else {
            console.error("Error del servidor:", data);
            Swal.fire({
                icon: 'error',
                title: 'Error del Servidor',
                text: data.message,
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
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Asignar evento si el formulario existe
if (form && inputApiKey && inputNombreApi) {
    form.addEventListener('submit', addTool);
}
