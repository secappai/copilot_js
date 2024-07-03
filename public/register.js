document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var RePassword = document.getElementById('RePassword').value;

     // Sélection de l'élément pour afficher les messages
     var messageElement = document.getElementById('message');

     // Vérification que les mots de passe correspondent
     if (password !== RePassword) {
        messageElement.textContent = 'Les mots de passe ne correspondent pas.';
        messageElement.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, RePassword })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('message').textContent = 'Inscription réussie!';
            document.getElementById('message').style.color = 'green';
            window.location.href = '/login.html'; // Redirection vers la page de login
        } else {
            document.getElementById('message').textContent = result.message || 'Erreur de l\'inscripton. Veuillez réessayer.';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('message').textContent = 'Une erreur est survenue, veuillez réessayer plus tard.';
        document.getElementById('message').style.color = 'red';
    }
});
