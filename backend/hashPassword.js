// hashPassword.js
const bcrypt = require('bcrypt');

const plainPassword = '654321'; // <-- ¡CAMBIA ESTO!
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error al generar el hash:", err);
        return;
    }
    console.log("Tu contraseña en texto plano:", plainPassword);
    console.log("Tu HASH seguro (copia esto):", hash);
});