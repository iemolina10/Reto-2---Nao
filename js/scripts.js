function login(){
    var user, pass;

    user = document.getElementById('usuario').value;
    pass = document.getElementById('contraseña').value;

    if(user == "admin" && pass == "1234"){

      window.location= "cargadedatos.html";
    }

    else {

        alert("Usuario o contraseña incorrecta")
    }
}
