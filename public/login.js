document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                document.getElementById('message').textContent = 'Connexion réussie!';
                document.getElementById('message').style.color = 'green';
                window.location.href = 'home.html'; // Redirection vers la page d'accueil ou tableau de bord
            } else {
                document.getElementById('message').textContent = 'Email ou Mot de passe invalide!';
                document.getElementById('message').style.color = 'red';
            }
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('message').textContent = 'Une erreur est survenue, veuillez réessayer plus tard.';
            document.getElementById('message').style.color = 'red';
        }
    });
});
