// Attend que le document HTML soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupère le formulaire d'inscription
    const infoForm = document.getElementById('info');

    infoForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const fname = document.getElementById('fname').value;
        const lname = document.getElementById('lname').value;
        const bdate = document.getElementById('bdate').value;
        const pseudo = document.getElementById('pseudo').value;
        const pp = document.getElementById('pp').files[0];

        if (!pp) {
            document.getElementById('message').textContent = 'Please select a profile picture.';
            document.getElementById('message').style.color = 'red';
            return;
        }

        const formData = new FormData();
        formData.append('fname', fname);
        formData.append('lname', lname);
        formData.append('bdate', bdate);
        formData.append('pseudo', pseudo);
        formData.append('pp', pp);

        try {
            const response = await fetch('http://localhost:3000/home', {
                method: 'POST',
                body: formData
            });


            // Check if the response is ok and the content type is JSON before parsing
            if (response.ok ) {
            const result = await response.json();

            // Si la réponse est positive
                // Affiche un message de succès
                document.getElementById('message').textContent = 'Inscription complète!';
                document.getElementById('message').style.color = 'green';
                window.location.href = 'ok.html';

                
            } else {
                // If the response is not ok or not JSON, handle as error
                // Attempt to read the response as text to get more details
                const errorMessage = await response.text(); // This could be HTML or plain text
                console.error('Error response:', errorMessage);
                // Affiche un message d'erreur
                document.getElementById('message').textContent = result.message;
                document.getElementById('message').style.color = 'red';
            }
        } catch (error) {
            // Affiche un message d'erreur
            console.error('Erreur:', error);
            document.getElementById('message').textContent = 'Une erreur est survenue, veuillez réessayer plus tard.';
            document.getElementById('message').style.color = 'red';
        }

    });
    
});
