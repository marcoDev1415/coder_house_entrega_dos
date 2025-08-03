// Configuración del backend
const API_BASE_URL = 'http://localhost:3000';

export async function view_user() {
  const contenedor = document.getElementById("tabla-usuarios");
  if (!contenedor) return;

  try {
    // Mostrar indicador de carga
    contenedor.innerHTML = '<p class="text-center text-gray-500">Cargando usuarios...</p>';

    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    const usuarios = data.usuarios;

    if (!usuarios || usuarios.length === 0) {
      contenedor.innerHTML = '<p class="text-center text-gray-500">No hay usuarios registrados.</p>';
      return;
    }

    let html = `
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Apellido</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Token JWT</th>
            <th scope="col" class="px-6 py-3">Fecha Registro</th>
            <th scope="col" class="px-6 py-3">Eliminar</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < usuarios.length; i++) {
      const fechaFormateada = new Date(usuarios[i].fechaRegistro).toLocaleDateString('es-ES');
      const tokenCorto = usuarios[i].token ? usuarios[i].token.substring(0, 30) + '...' : 'N/A';
      
      html += `
       <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
          <td class="px-6 py-4">${usuarios[i].firstName || ''}</td>
          <td class="px-6 py-4">${usuarios[i].lastName || ''}</td>
          <td class="px-6 py-4">${usuarios[i].email || ''}</td>
          <td class="px-6 py-4">
            <div class="max-w-xs">
              <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded" title="${usuarios[i].token}">
                ${tokenCorto}
              </span>
              <button type="button" class="copy-token ml-2 text-blue-600 hover:text-blue-800 text-xs" data-token="${usuarios[i].token}">
                📋 Copiar
              </button>
            </div>
          </td>
          <td class="px-6 py-4 text-xs">${fechaFormateada}</td>
          <td class="px-6 py-4">
              <button type="button" class="delete-user text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" data-id="${usuarios[i].id}">
                Eliminar
              </button>
          </td>
        </tr>
      `;
    }

    html += `</tbody></table>`;
    contenedor.innerHTML = html;

    // Event listeners para eliminar usuarios
    const botonesEliminar = contenedor.querySelectorAll('.delete-user');
    botonesEliminar.forEach(button => {
      button.addEventListener('click', async function() {
        const userId = this.getAttribute('data-id');
        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
          await eliminarUsuario(userId);
        }
      });
    });

    // Event listeners para copiar tokens
    const botonesCopiar = contenedor.querySelectorAll('.copy-token');
    botonesCopiar.forEach(button => {
      button.addEventListener('click', function() {
        const token = this.getAttribute('data-token');
        copiarToken(token);
      });
    });

  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    contenedor.innerHTML = `
      <div class="text-center text-red-500 p-4">
        <p>Error al cargar usuarios: ${error.message}</p>
        <p class="text-sm mt-2">Asegúrate de que el servidor esté ejecutándose en puerto 3000.</p>
        <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>
    `;
  }
}

async function eliminarUsuario(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Usuario eliminado exitosamente');
      await view_user(); // Recargar la tabla
    } else {
      const data = await response.json();
      alert(data.message || 'Error al eliminar usuario');
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    alert('Error de conexión al eliminar usuario');
  }
}

function copiarToken(token) {
  navigator.clipboard.writeText(token).then(() => {
    alert('Token copiado al portapapeles');
  }).catch(err => {
    console.error('Error al copiar token:', err);
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = token;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Token copiado al portapapeles');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await view_user();
});
