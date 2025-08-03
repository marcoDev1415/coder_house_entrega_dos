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
        alert('Por favor, completa todos los campos.');
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
            alert(`✅ API "${data.data.nombre_api}" agregada exitosamente!\n🔐 API Key encriptada automáticamente con AES-256-CBC\n👀 Preview: ${data.data.api_key_preview}`);
            
            // Limpiar formulario
            form.reset();
        } else {
            console.error("Error del servidor:", data);
            alert(`❌ Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("❌ Error de conexión con el servidor. Asegúrate de que esté ejecutándose en puerto 3000.");
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
