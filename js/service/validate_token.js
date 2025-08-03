// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

// Elementos del DOM
const tokenInput = document.getElementById('token-input');
const validateBtn = document.getElementById('validate-btn');
const clearBtn = document.getElementById('clear-btn');
const pasteBtn = document.getElementById('paste-btn');
const resultContainer = document.getElementById('result-container');

// Event Listeners
validateBtn.addEventListener('click', validateToken);
clearBtn.addEventListener('click', clearForm);
pasteBtn.addEventListener('click', pasteFromClipboard);

// Función principal de validación
async function validateToken() {
    const token = tokenInput.value.trim();
    
    if (!token) {
        showError('Por favor, pega un token para validar');
        return;
    }

    // Mostrar loading
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/validate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.valid) {
            showValidResult(data);
        } else {
            showInvalidResult(data);
        }

    } catch (error) {
        console.error('Error al validar token:', error);
        showError('Error de conexión con el servidor');
    }
}

// Mostrar resultado válido
function showValidResult(data) {
    const { userId, email, name, issuedAt, expiresAt, timeRemaining } = data.data;
    
    const issuedDate = new Date(issuedAt).toLocaleString('es-ES');
    const expiresDate = new Date(expiresAt).toLocaleString('es-ES');
    
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
                        ✅ Token Válido
                    </h3>
                    <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                        ${data.message}
                    </p>
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Información del usuario -->
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
                    </div>
                </div>

                <!-- Información del token -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-3">🔐 Información del Token</h4>
                    <div class="space-y-2">
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Emitido:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${issuedDate}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Expira:</span>
                            <span class="text-sm text-gray-900 dark:text-white ml-2">${expiresDate}</span>
                        </div>
                        <div>
                            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo restante:</span>
                            <span class="text-sm text-green-600 dark:text-green-400 ml-2 font-mono">
                                ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cronómetro en tiempo real -->
            <div class="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div class="text-center">
                    <p class="text-sm text-green-700 dark:text-green-300 mb-2">⏱️ Tiempo restante en tiempo real:</p>
                    <div id="countdown-timer" class="text-2xl font-mono font-bold text-green-800 dark:text-green-400" data-expiry="${expiresAt}">
                        ${timeRemaining.hours}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}
                    </div>
                </div>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');

    // Iniciar countdown
    startCountdown(expiresAt);
}

// Mostrar resultado inválido
function showInvalidResult(data) {
    let iconColor = 'text-red-600 dark:text-red-400';
    let bgColor = 'bg-red-50 dark:bg-red-900/20';
    let borderColor = 'border-red-200 dark:border-red-800';
    let textColor = 'text-red-800 dark:text-red-400';
    let icon = '❌';
    
    if (data.message.includes('expirado')) {
        icon = '⏰';
        iconColor = 'text-orange-600 dark:text-orange-400';
        bgColor = 'bg-orange-50 dark:bg-orange-900/20';
        borderColor = 'border-orange-200 dark:border-orange-800';
        textColor = 'text-orange-800 dark:text-orange-400';
    }

    const html = `
        <div class="${bgColor} border ${borderColor} rounded-lg p-6">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="w-8 h-8 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-lg font-semibold ${textColor}">
                        ${icon} ${data.message}
                    </h3>
                    ${data.expiredAt ? `
                        <p class="text-sm ${textColor.replace('800', '700').replace('400', '300')} mt-1">
                            Token expiró el: ${new Date(data.expiredAt).toLocaleString('es-ES')}
                        </p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
}

// Mostrar error
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

// Mostrar loading
function showLoading() {
    const html = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
            <div class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-lg text-blue-800 dark:text-blue-400">Validando token...</span>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
}

// Limpiar formulario
function clearForm() {
    tokenInput.value = '';
    resultContainer.innerHTML = '';
    resultContainer.classList.add('hidden');
}

// Pegar desde portapapeles
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        tokenInput.value = text;
        tokenInput.focus();
    } catch (error) {
        console.error('Error al pegar desde portapapeles:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Portapapeles No Disponible',
            text: 'No se pudo acceder al portapapeles. Pega manualmente el token.',
            confirmButtonColor: '#f59e0b'
        });
    }
}

// Countdown timer en tiempo real
function startCountdown(expiryDate) {
    const countdownElement = document.getElementById('countdown-timer');
    if (!countdownElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(expiryDate).getTime();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            countdownElement.textContent = 'EXPIRADO';
            countdownElement.className = countdownElement.className.replace('text-green-800 dark:text-green-400', 'text-red-800 dark:text-red-400');
            clearInterval(interval);
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdownElement.textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}