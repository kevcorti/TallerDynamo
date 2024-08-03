document.addEventListener('DOMContentLoaded', function() {
    AWS.config.update({
        accessKeyId: '', 
        secretAccessKey: '',
        sessionToken: '',
        region: 'us-east-1'
    });

    const s3 = new AWS.S3();
    const bucketName = 'YOUR_BUCKET_NAME';x
    document.getElementById('inscripcionForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstN = document.getElementById('firstName').value;
        const lastN = document.getElementById('lastName').value;
        const idN = document.getElementById('idNumber').value;
        const emai = document.getElementById('email').value;
        const photo = document.getElementById('file-upload').files[0];
        console.log(firstName)

        const photoKey = `${Date.now()}_${photo.name}`;
        const params = {
            Bucket: "taller3",
            Key: photoKey,
            Body: photo,
        };

        s3.upload(params, async (err, data) => {
            if (err) {
                console.error('Error subiendo el archivo:', err);
            } else {
                console.log('Archivo subido con éxito:', data.Location);
                mostrarImagenEnGaleria(data.Location);

                try {
                    const response = await fetch('https://87tsdwdovf.execute-api.us-east-1.amazonaws.com/default/taller3', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                    
                        body: JSON.stringify({
                            id: idN,
                            email: emai,
                            firstName: firstN,
                            idNumber: idN,
                            lastName: lastN,
                            photo: data.Location
                        })
                    });

                    if (response.ok) {
                        alert('Inscripción exitosa');
                        cargarRegistros();
                    } else {
                        alert('Error en la inscripción');
                    }
                } catch (error) {
                    console.error('Error en la solicitud de inscripción:', error);
                    alert('Error en la inscripción');
                }
            }
        });
    });

    async function cargarRegistros() {
        try {
            const response = await fetch('https://87tsdwdovf.execute-api.us-east-1.amazonaws.com/default/taller3');
            
            if (response.ok) {
                const data = await response.json();
                const registrosList = document.getElementById('registrosList');
                registrosList.innerHTML = '';
    
                data.Items.forEach(registro => {
                    const li = document.createElement('li');
                    li.innerHTML = `${registro.firstName} ${registro.lastName} - ${registro.email}
                                    <img src="${registro.photo}" alt="Foto">`;
                    registrosList.appendChild(li);
                });
            } else {
                console.error('Error obteniendo los registros:', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud de carga de registros:', error);
        }
    }
    

    function mostrarImagenEnGaleria(url) {
        const galeria = document.getElementById('galeria');
        if (galeria) {
            const img = document.createElement('img');
            img.src = url;
            galeria.appendChild(img);
        } else {
            console.error('Elemento galeria no encontrado');
        }
    }
});
