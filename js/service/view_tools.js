// Script para mostrar las API Keys encriptadas del backend
// Muestra una tabla con las keys encriptadas y opción de desencriptar

// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

const tablaTools = document.getElementById('tabla-tools');

// Función principal para cargar y mostrar las API Keys
async function viewTools() {
    if (!tablaTools) return;

    try {
        // Mostrar indicador de carga
        tablaTools.innerHTML = '<p class="text-center text-gray-500">🔄 Cargando API Keys encriptadas...</p>';

        const response = await fetch(`${API_BASE_URL}/api-keys`);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        const apiKeys = data.data;

        if (!apiKeys || apiKeys.length === 0) {
            tablaTools.innerHTML = '<p class="text-center text-gray-500">No hay API Keys registradas.</p>';
        return;
    }

    let html = `
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Nombre API</th>
              <th scope="col" class="px-6 py-3">API Key Encriptada</th>
              <th scope="col" class="px-6 py-3">Fecha Creación</th>
              <th scope="col" class="px-6 py-3">Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

        for (let i = 0; i < apiKeys.length; i++) {
            const fechaFormateada = new Date(apiKeys[i].fechaCreacion).toLocaleDateString('es-ES');
            
        html += `
     <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                ${apiKeys[i].nombre_api || ''}
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded" title="API Key encriptada con AES-256-CBC">
                        🔐 ${apiKeys[i].api_key_preview}
                    </span>
                    <button type="button" class="decrypt-key text-blue-600 hover:text-blue-800 text-xs underline" data-id="${apiKeys[i].id}" data-name="${apiKeys[i].nombre_api}">
                        👁️ Ver Original
                    </button>
                </div>
                <div id="decrypted-${apiKeys[i].id}" class="hidden mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <!-- Aquí se mostrará la key desencriptada -->
                </div>
            </td>
            <td class="px-6 py-4 text-xs">
                ${fechaFormateada}
            </td>
        <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button type="button" class="copy-encrypted text-gray-600 hover:text-gray-800 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" data-encrypted="${apiKeys[i].api_key_encrypted}" data-iv="${apiKeys[i].iv}" title="Copiar datos encriptados">
                        📋 Enc.
                    </button>
                    <button type="button" class="delete-tool text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" data-id="${apiKeys[i].id}" data-name="${apiKeys[i].nombre_api}">
                        🗑️ Eliminar
                    </button>
                </div>
        </td>
      </tr>
    `;
    }

    html += `</tbody></table>`;
    tablaTools.innerHTML = html;

        // Agregar event listeners
        addEventListeners();

    } catch (error) {
        console.error("Error al cargar API Keys:", error);
        tablaTools.innerHTML = `
            <div class="text-center text-red-500 p-4">
                <p>❌ Error al cargar API Keys: ${error.message}</p>
                <p class="text-sm mt-2">Asegúrate de que el servidor esté ejecutándose en puerto 3000.</p>
                <button onclick="viewTools()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// Agregar event listeners a los botones
function addEventListeners() {
    // Event listeners para desencriptar
    const botonesDesencriptar = tablaTools.querySelectorAll('.decrypt-key');
    botonesDesencriptar.forEach(button => {
        button.addEventListener('click', async function() {
            const apiId = this.getAttribute('data-id');
            const apiName = this.getAttribute('data-name');
            await desencriptarApiKey(apiId, apiName, this);
        });
    });

    // Event listeners para copiar datos encriptados
    const botonesCopiarEnc = tablaTools.querySelectorAll('.copy-encrypted');
    botonesCopiarEnc.forEach(button => {
        button.addEventListener('click', function() {
            const encrypted = this.getAttribute('data-encrypted');
            const iv = this.getAttribute('data-iv');
            const dataToyCopy = JSON.stringify({ encryptedToken: encrypted, iv: iv }, null, 2);
            copiarAlPortapapeles(dataToyCopy, 'Datos encriptados copiados');
        });
    });

    // Event listeners para eliminar
    const botonesEliminar = tablaTools.querySelectorAll('.delete-tool');
    botonesEliminar.forEach(button => {
        button.addEventListener('click', async function() {
            const apiId = this.getAttribute('data-id');
            const apiName = this.getAttribute('data-name');
            
            const result = await Swal.fire({
                title: '¿Eliminar API Key?',
                html: `¿Estás seguro de que quieres eliminar la API <strong>"${apiName}"</strong>?<br><br><small class="text-red-600">⚠️ Esta acción no se puede deshacer</small>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '🗑️ Sí, eliminar',
                cancelButtonText: '❌ Cancelar'
            });

            if (result.isConfirmed) {
                await eliminarApiKey(apiId);
            }
        });
    });
}

// Función para desencriptar una API Key específica
async function desencriptarApiKey(apiId, apiName, button) {
    const originalText = button.textContent;
    button.textContent = '🔄 Desencriptando...';
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/decrypt-api-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: apiId })
        });

        const data = await response.json();

        if (data.success) {
            // Mostrar la key desencriptada
            const decryptedDiv = document.getElementById(`decrypted-${apiId}`);
            decryptedDiv.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-green-700 dark:text-green-300 font-medium">🔓 API Key Original:</p>
                        <p class="text-sm font-mono text-gray-900 dark:text-white mt-1 break-all bg-gray-50 dark:bg-gray-800 p-2 rounded border">${data.data.api_key_original}</p>
                    </div>
                    <button type="button" class="copy-original ml-2 text-green-600 hover:text-green-800 text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800" data-key="${data.data.api_key_original}">
                        📋 Copiar
                    </button>
                </div>
                <p class="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">✅ Desencriptado: ${new Date(data.data.desencriptadoEn).toLocaleString('es-ES')}</p>
            `;
            decryptedDiv.classList.remove('hidden');

            // Agregar event listener al botón de copiar original
            const copyButton = decryptedDiv.querySelector('.copy-original');
            copyButton.addEventListener('click', function() {
                const originalKey = this.getAttribute('data-key');
                copiarAlPortapapeles(originalKey, 'API Key original copiada');
            });

            button.textContent = '🔒 Ocultar';
            button.onclick = () => {
                decryptedDiv.classList.add('hidden');
                button.textContent = '👁️ Ver Original';
                button.onclick = () => desencriptarApiKey(apiId, apiName, button);
            };

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al Desencriptar',
                text: data.message,
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (error) {
        console.error('Error al desencriptar API Key:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo desencriptar la API Key. Verifica tu conexión.',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        button.disabled = false;
        if (button.textContent.includes('Desencriptando')) {
            button.textContent = originalText;
        }
    }
}

// Función para eliminar API Key
async function eliminarApiKey(apiId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api-keys/${apiId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡API Key Eliminada!',
                text: data.message,
                confirmButtonColor: '#10b981',
                timer: 2000,
                showConfirmButton: false
            });
            await viewTools(); // Recargar la tabla
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al Eliminar',
                text: data.message,
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (error) {
        console.error('Error al eliminar API Key:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo eliminar la API Key. Verifica tu conexión.',
            confirmButtonColor: '#ef4444'
        });
    }
}

// Función auxiliar para copiar al portapapeles
function copiarAlPortapapeles(texto, mensaje) {
    navigator.clipboard.writeText(texto).then(() => {
        Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: mensaje,
            confirmButtonColor: '#10b981',
            timer: 1500,
            showConfirmButton: false
        });
    }).catch(err => {
        console.error('Error al copiar:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: mensaje,
            confirmButtonColor: '#10b981',
            timer: 1500,
            showConfirmButton: false
        });
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    viewTools();
});
