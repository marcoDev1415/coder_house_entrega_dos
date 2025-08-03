// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

// Elementos del DOM
const encryptTab = document.getElementById('encrypt-tab');
const decryptTab = document.getElementById('decrypt-tab');
const encryptPanel = document.getElementById('encrypt-panel');
const decryptPanel = document.getElementById('decrypt-panel');

// Elementos del panel de encriptación
const tokenToEncrypt = document.getElementById('token-to-encrypt');
const encryptBtn = document.getElementById('encrypt-btn');
const clearEncryptBtn = document.getElementById('clear-encrypt-btn');
const pasteEncryptBtn = document.getElementById('paste-encrypt-btn');

// Elementos del panel de desencriptación
const encryptedToken = document.getElementById('encrypted-token');
const ivInput = document.getElementById('iv-input');
const decryptBtn = document.getElementById('decrypt-btn');
const clearDecryptBtn = document.getElementById('clear-decrypt-btn');
const pasteDecryptBtn = document.getElementById('paste-decrypt-btn');

// Contenedor de resultados
const resultContainer = document.getElementById('result-container');

// Event Listeners para tabs
encryptTab.addEventListener('click', () => switchTab('encrypt'));
decryptTab.addEventListener('click', () => switchTab('decrypt'));

// Event Listeners para encriptación
encryptBtn.addEventListener('click', encryptToken);
clearEncryptBtn.addEventListener('click', clearEncryptForm);
pasteEncryptBtn.addEventListener('click', pasteTokenToEncrypt);

// Event Listeners para desencriptación
decryptBtn.addEventListener('click', decryptToken);
clearDecryptBtn.addEventListener('click', clearDecryptForm);
pasteDecryptBtn.addEventListener('click', pasteDecryptData);

// Función para cambiar entre tabs
function switchTab(activeTab) {
    if (activeTab === 'encrypt') {
        // Activar tab de encriptación
        encryptTab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-500', 'dark:border-blue-500');
        encryptTab.classList.remove('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300', 'dark:hover:text-gray-300');
        encryptTab.setAttribute('aria-selected', 'true');
        
        // Desactivar tab de desencriptación
        decryptTab.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-500', 'dark:border-blue-500');
        decryptTab.classList.add('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300', 'dark:hover:text-gray-300');
        decryptTab.setAttribute('aria-selected', 'false');
        
        // Mostrar/ocultar paneles
        encryptPanel.classList.remove('hidden');
        decryptPanel.classList.add('hidden');
    } else {
        // Activar tab de desencriptación
        decryptTab.classList.add('border-blue-600', 'text-blue-600', 'dark:text-blue-500', 'dark:border-blue-500');
        decryptTab.classList.remove('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300', 'dark:hover:text-gray-300');
        decryptTab.setAttribute('aria-selected', 'true');
        
        // Desactivar tab de encriptación
        encryptTab.classList.remove('border-blue-600', 'text-blue-600', 'dark:text-blue-500', 'dark:border-blue-500');
        encryptTab.classList.add('border-transparent', 'hover:text-gray-600', 'hover:border-gray-300', 'dark:hover:text-gray-300');
        encryptTab.setAttribute('aria-selected', 'false');
        
        // Mostrar/ocultar paneles
        decryptPanel.classList.remove('hidden');
        encryptPanel.classList.add('hidden');
    }
    
    // Limpiar resultados al cambiar de tab
    clearResults();
}

// Función para encriptar token
async function encryptToken() {
    const token = tokenToEncrypt.value.trim();
    
    if (!token) {
        showError('Por favor, pega un token JWT para encriptar');
        return;
    }

    // Mostrar loading
    showLoading('Encriptando token...');

    try {
        const response = await fetch(`${API_BASE_URL}/encrypt-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
            showEncryptResult(data);
        } else {
            showError(data.message || 'Error al encriptar el token');
        }

    } catch (error) {
        console.error('Error al encriptar token:', error);
        showError('Error de conexión con el servidor');
    }
}

// Función para desencriptar token
async function decryptToken() {
    const encrypted = encryptedToken.value.trim();
    const iv = ivInput.value.trim();
    
    if (!encrypted || !iv) {
        showError('Por favor, proporciona tanto el token encriptado como el IV');
        return;
    }

    // Mostrar loading
    showLoading('Desencriptando token...');

    try {
        const response = await fetch(`${API_BASE_URL}/decrypt-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                encryptedToken: encrypted,
                iv: iv 
            })
        });

        const data = await response.json();

        if (data.success) {
            showDecryptResult(data);
        } else {
            showError(data.message || 'Error al desencriptar el token');
        }

    } catch (error) {
        console.error('Error al desencriptar token:', error);
        showError('Error de conexión con el servidor');
    }
}

// Mostrar resultado de encriptación
function showEncryptResult(data) {
    const { encryptionId, encryptedToken, iv, algorithm, encryptedAt, originalTokenLength } = data.data;
    
    const encryptedDate = new Date(encryptedAt).toLocaleString('es-ES');
    
    const html = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 dark:bg-green-900/20 dark:border-green-800">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <h3 class="text-lg font-semibold text-green-800 dark:text-green-400">
                        🔒 Token Encriptado Exitosamente
                    </h3>
                    <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                        ${data.message}
                    </p>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Token Encriptado -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">🔐 Token Encriptado</h4>
                    <div class="space-y-3">
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Token:</span>
                            <div class="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono break-all">
                                ${encryptedToken}
                            </div>
                            <button type="button" class="copy-data mt-2 text-blue-600 hover:text-blue-800 text-xs" data-copy="${encryptedToken}">
                                📋 Copiar Token
                            </button>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">IV (Vector de Inicialización):</span>
                            <div class="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono break-all">
                                ${iv}
                            </div>
                            <button type="button" class="copy-data mt-2 text-blue-600 hover:text-blue-800 text-xs" data-copy="${iv}">
                                📋 Copiar IV
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Información de Encriptación -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">📊 Información de Encriptación</h4>
                    <div class="space-y-2">
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">ID de Encriptación:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2 font-mono">${encryptionId}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Algoritmo:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${algorithm}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${encryptedDate}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tamaño original:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${originalTokenLength} caracteres</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-400">⚠️ Importante</p>
                        <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            Guarda tanto el <strong>token encriptado</strong> como el <strong>IV</strong>. 
                            Ambos son necesarios para desencriptar el token original.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex gap-3">
                <button type="button" class="switch-to-decrypt text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    🔓 Ir a Desencriptar
                </button>
                <button type="button" class="copy-all-data text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" data-token="${encryptedToken}" data-iv="${iv}">
                    📋 Copiar Todo
                </button>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');

    // Agregar event listeners
    addCopyEventListeners();
    addSwitchTabEventListeners();
}

// Mostrar resultado de desencriptación
function showDecryptResult(data) {
    const { decryptedToken, tokenData, decryptedAt } = data.data;
    const { userId, email, name, issuedAt, expiresAt, timeRemaining } = tokenData;
    
    const issuedDate = new Date(issuedAt).toLocaleString('es-ES');
    const expiresDate = new Date(expiresAt).toLocaleString('es-ES');
    const decryptedDate = new Date(decryptedAt).toLocaleString('es-ES');
    
    const statusColor = timeRemaining.isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    const statusText = timeRemaining.isExpired ? 'EXPIRADO' : 'VÁLIDO';
    const statusIcon = timeRemaining.isExpired ? '⏰' : '✅';
    
    const html = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3 flex-1">
                    <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-400">
                        🔓 Token Desencriptado Exitosamente
                    </h3>
                    <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        ${data.message}
                    </p>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Token Desencriptado -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">🔐 Token JWT Desencriptado</h4>
                    <div class="mb-3">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Token:</span>
                        <div class="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
                            ${decryptedToken}
                        </div>
                        <button type="button" class="copy-data mt-2 text-blue-600 hover:text-blue-800 text-xs" data-copy="${decryptedToken}">
                            📋 Copiar Token Desencriptado
                        </button>
                    </div>
                    
                    <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Estado:</span>
                            <span class="text-sm font-bold ${statusColor}">${statusIcon} ${statusText}</span>
                        </div>
                        ${!timeRemaining.isExpired ? `
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Tiempo restante: ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Información del Usuario -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">👤 Información del Usuario</h4>
                    <div class="space-y-2">
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">ID:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${userId}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${name}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${email}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Emitido:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${issuedDate}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Expira:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${expiresDate}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Desencriptado:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${decryptedDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 flex gap-3">
                <button type="button" class="switch-to-encrypt text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                    🔒 Ir a Encriptar
                </button>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');

    // Agregar event listeners
    addCopyEventListeners();
    addSwitchTabEventListeners();
}

// Funciones auxiliares
function showError(message) {
    const html = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-lg font-semibold text-red-800 dark:text-red-400">Error</h3>
                    <p class="text-sm text-red-700 dark:text-red-300 mt-1">${message}</p>
                </div>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
}

function showLoading(message) {
    const html = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
            <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-lg text-blue-800 dark:text-blue-400">${message}</span>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
}

function clearResults() {
    resultContainer.innerHTML = '';
    resultContainer.classList.add('hidden');
}

function clearEncryptForm() {
    tokenToEncrypt.value = '';
    clearResults();
}

function clearDecryptForm() {
    encryptedToken.value = '';
    ivInput.value = '';
    clearResults();
}

async function pasteTokenToEncrypt() {
    try {
        const text = await navigator.clipboard.readText();
        tokenToEncrypt.value = text;
        tokenToEncrypt.focus();
    } catch (error) {
        console.error('Error al pegar:', error);
        alert('No se pudo acceder al portapapeles. Pega manualmente el token.');
    }
}

async function pasteDecryptData() {
    try {
        const text = await navigator.clipboard.readText();
        // Intentar detectar si es JSON con datos de encriptación
        try {
            const data = JSON.parse(text);
            if (data.encryptedToken && data.iv) {
                encryptedToken.value = data.encryptedToken;
                ivInput.value = data.iv;
            } else {
                encryptedToken.value = text;
            }
        } catch {
            encryptedToken.value = text;
        }
        encryptedToken.focus();
    } catch (error) {
        console.error('Error al pegar:', error);
        alert('No se pudo acceder al portapapeles. Pega manualmente los datos.');
    }
}

function addCopyEventListeners() {
    // Copiar datos individuales
    document.querySelectorAll('.copy-data').forEach(button => {
        button.addEventListener('click', function() {
            const dataToCopy = this.getAttribute('data-copy');
            copyToClipboard(dataToCopy);
        });
    });

    // Copiar todos los datos
    document.querySelectorAll('.copy-all-data').forEach(button => {
        button.addEventListener('click', function() {
            const token = this.getAttribute('data-token');
            const iv = this.getAttribute('data-iv');
            const data = JSON.stringify({ encryptedToken: token, iv: iv }, null, 2);
            copyToClipboard(data);
        });
    });
}

function addSwitchTabEventListeners() {
    // Cambiar a tab de desencriptación
    document.querySelectorAll('.switch-to-decrypt').forEach(button => {
        button.addEventListener('click', () => {
            switchTab('decrypt');
        });
    });

    // Cambiar a tab de encriptación
    document.querySelectorAll('.switch-to-encrypt').forEach(button => {
        button.addEventListener('click', () => {
            switchTab('encrypt');
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copiado al portapapeles');
    });
}