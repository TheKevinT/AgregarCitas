let DB;
const form = document.querySelector('form'),
    nombreMascota = document.querySelector('#mascota'),
    nombreCliente = document.querySelector('#cliente'),
    telefono = document.querySelector('#telefono'),
    fecha = document.querySelector('#fecha'),
    hora = document.querySelector('#hora'),
    sintomas = document.querySelector('#sintomas'),
    citas = document.querySelector('#citas'),
    headingAdministra = document.querySelector('#administra');

//ESPERAR POR EL DOM READY
document.addEventListener('DOMContentLoaded', () => {
    //CREAR LA BASE DE DATOS ------nombre y version(usar numero enteros siempre)
    let crearDB = window.indexedDB.open('citas', 1);

    //SI HAY UN ERROR ENVIAR A CONSOLA
    crearDB.onerror = function() {
        console.log('error.....');
    }


    //SI TODO ESTA BIEN ENTONCES MUESTRA EN CONSOLA, Y ASIGNAR LA BASE DE DATOS
    crearDB.onsuccess = function() {

        //console.log('todo OK');

        //ASIGNAR LA BASE DE DATOS
        DB = crearDB.result;
        //console.log(DB);


        mostrarCitas();
    }

    //ESTE METODO SOLO CORRE UNA BESA Y ES IDEAL PARA CREAR EL SCHEMA
    crearDB.onupgradeneeded = function(e) {
        //EVENTO ES LA MISMA BASE DE DATOS
        let db = e.target.result;

        //DEFINIR EL OBJECT STORE, TOMA 2 PARAMETROS EL NOMBRE DE LA BASE DE DATOS Y SEGUNDO LAS OPCIONES
        //KEYPATH ES EL INDICE DE LA BASE DE DATOS
        let objectStore = db.createObjectStore('citas', { keyPath: 'key', autoIncrement: true });

        //crear los indices y campos de la base de datos, createIndex  : 3 PARAMTEROS, NOMBRE, KEYPATJ Y OPCIONES
        objectStore.createIndex('mascota', 'mascota', { unique: false });
        objectStore.createIndex('cliente', 'cliente', { unique: false });
        objectStore.createIndex('telefono', 'telefono', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        objectStore.createIndex('hora', 'hora', { unique: false });
        objectStore.createIndex('sintomas', 'sintomas', { unique: false });


    }



    //CUANDO EL FORMULARIO SE ENVIA
    form.addEventListener('submit', agregarDatos);

    //LEER DATOS DEL FORMULARIO 

    function agregarDatos(e) {
        e.preventDefault();

        //crear objeto con todos los datos para insertat en BASE DE DATOS

        const nuevaCita = {
            mascota: nombreMascota.value,
            cliente: nombreCliente.value,
            telefono: telefono.value,
            fecha: fecha.value,
            hora: hora.value,
            sintomas: sintomas.value

        }

        // console.log(nuevaCita);

        //EN INDEXDB SE UTILIZAN LAS TRANSACCIONES
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        //console.log(objectStore);

        //INSERTAR A LA BASE DE DATOS

        let peticion = objectStore.add(nuevaCita);
        console.log(peticion);


        //LIMPIAR AL FORM
        peticion.onsuccess = () => {
            form.reset();
        }

        transaction.oncomplete = () => {
            console.log('cita agregada');
            mostrarCitas();
        }

        transaction.onerror = () => {
            console.log('hubo un error');
        }


    }


    //FUNCION PARA MOSTRAR LAS CITAS

    function mostrarCitas() {

        //LIMPIAR CITAS ANTERIORES

        while (citas.firstChild) {
            citas.removeChild(citas.firstChild);
        }

        //CREAR OBJECTSTORE PARA HACER CONSULTA A LA BASE DE DATOS
        let objectStore = DB.transaction('citas').objectStore('citas');

        //esto retorna una peticion ---va a reorrer cada uno de los registros
        objectStore.openCursor().onsuccess = function(e) {
            //CURSOR SE VA A UBIAR EN EL REGISTRO INDICADO PARA ACCEDER A LOS DATOS

            let cursor = e.target.result;
            // console.log(cursor);

            if (cursor) {
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                citaHTML.classList.add('list-group-item');


                //INSERTAR EN HTML
                citaHTML.innerHTML = `
                
                <p class="font-weight-bold">Mascota:<span class="font-weight-normal">${cursor.value.mascota}</span> </p>
                <p class="font-weight-bold">Cliente:<span class="font-weight-normal">${cursor.value.cliente}</span> </p>
                <p class="font-weight-bold">Teléfono:<span class="font-weight-normal">${cursor.value.telefono}</span> </p>
                <p class="font-weight-bold">Fecha:<span class="font-weight-normal">${cursor.value.fecha}</span> </p>
                <p class="font-weight-bold">Hora:<span class="font-weight-normal">${cursor.value.hora}</span> </p>
                <p class="font-weight-bold">Síntomas:<span class="font-weight-normal">${cursor.value.sintomas}</span> </p>
                
                `;

                //BOTON DE BORRAR
                const botonBorrar = document.createElement('button');
                botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
                botonBorrar.innerHTML = '<span aria-hidden="true">x </span>Borrar';
                botonBorrar.onclick = borrarCita;
                citaHTML.appendChild(botonBorrar);




                //append en el padre

                citas.appendChild(citaHTML);


                //PARA QUE EL CURSOR CONTINUE Y CONTINUE HACIENDO LAS CONSULTAS

                cursor.continue();


            } else {

                if (!citas.firstChild) {
                    //CUANDO NO HAY REGISTROS
                    headingAdministra.textContent = 'Agrega citas para comenzar';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay registros';
                    citas.appendChild(listado);

                } else {
                    headingAdministra.textContent = 'administra tus citas';
                }
            }

        }

    }


    function borrarCita(e) {
        //PARA QUE MUESTRE EL ID QUE QUIERO ELIMINAR
        //NECESITA NUMBER PORQUE RETORNA UN STRING Y NECEISTAMOS UN NUMERO
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));

        //TRANSACCION PARA BORRAR

        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        //console.log(objectStore);

        //ELIMINAR DE LA BASE DE DATOS

        let peticion = objectStore.delete(citaID);


        //QUITAR DEL DOM

        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log(` se elimino la cita con el ID: ${ citaID } `);

            if (!citas.firstChild) {
                //CUANDO NO HAY REGISTROS
                headingAdministra.textContent = 'Agrega citas para comenzar';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                citas.appendChild(listado);

            } else {
                headingAdministra.textContent = 'administra tus citas';
            }
        }


    }



});