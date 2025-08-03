import { add_user } from '../service/add_user.js'

const ButtonForm = document.getElementById('Submit');
let usuarios = [];

ButtonForm.addEventListener('click', async (e) =>{
    e.preventDefault();
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    console.log('Datos a enviar:', { firstName, lastName, email });

    // La función add_user ahora es asíncrona y maneja su propia limpieza del formulario
    await add_user(firstName, lastName, email, password, confirmPassword);
})

