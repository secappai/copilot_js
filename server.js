const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const session = require('express-session');
const fs = require('fs');
//const fileUpload = require('express-fileupload');
const path = require('path');
const multer = require('multer');

// Configure the file upload
const app = express();
const port = 3000;


// Connect to SQLite database
let db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create users table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL)', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Table "users" has been created.');
});

// create the info table with the following fields : fname, lname, bdate, pseudo, pp (it's a picture) and the email to join tables
db.run('CREATE TABLE IF NOT EXISTS info (id INTEGER PRIMARY KEY AUTOINCREMENT, fname TEXT NOT NULL, lname TEXT NOT NULL, bdate TEXT NOT NULL, pseudo TEXT NOT NULL UNIQUE, pp TEXT NOT NULL, email TEXT NOT NULL, FOREIGN KEY (email) REFERENCES users (email))', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Table "info" has been created.');
});

// join the tables users and info by the email var
db.run('SELECT users.email, fname, lname, bdate, pseudo, pp FROM users INNER JOIN info ON users.email = info.email', (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Données récupérées avec succès.');
        console.log(rows);
    }
});


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());

// Middleware pour parser le body
app.use(express.urlencoded({ extended: true }));

// Middleware pour les fichiers téléchargés
//app.use(fileUpload());

// Middleware pour les fichiers statiques
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

//const upload = multer({ storage: storage });
const upload = multer({ dest: 'uploads/' });

// Route to handle user registration
app.post('/register', (req, res) => {
    const { email, password, RePassword } = req.body;

    if (password !== RePassword) {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    // Vérifiez si l'utilisateur existe déjà
    db.get('SELECT email FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la vérification de l\'utilisateur.' });
        }

        if (row) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }

        try {
            // Hacher le mot de passe
            const hashedPassword = await bcryptjs.hash(password, 8);

            // Enregistrer l'utilisateur
            db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
                }

                res.status(201).json({ message: 'Utilisateur enregistré avec succès!' });
            });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors du hachage du mot de passe.' });
        }
    });
});


// Gestion de session
app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Route to handle user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Recherchez l'utilisateur par email seulement
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la connexion.' });
        }

        if (!user) {
            return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // Comparez le mot de passe fourni avec le hachage stocké
        bcryptjs.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe.' });
            }

            if (!result) {
                return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
            }

            // Si le mot de passe est correct, stockez l'email de l'utilisateur dans la session
            req.session.email = user.email;
            res.json({ message: 'Connexion réussie!' });
        });
    });
});

// Route to handle uploading files
app.post('/upload', upload.single('pp'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
});


// Route to handle user information
app.post('/home', upload.single('pp'), (req, res) => {
    const email = req.session ? req.session.email : null;
    if (!email) {
        return res.status(403).json({ message: 'Not authenticated' });
    }

    // Afficher l'email dans le terminal
    console.log(`Email récupéré de la session : ${email}`);

    console.log(req.body); // For debugging to see what you receive

    const { lname, fname, bdate, pseudo } = req.body;
    const file = req.file; // Access the uploaded file

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Convertir les données de l'image en base64
    const imageBase64 = fs.readFileSync(file.path, { encoding: 'base64' });

    // Remember to validate and clean all inputs as before
    if (!validateInput(lname, fname, bdate, pseudo, file.path)) {
        return res.status(400).json({ message: 'Invalid registration data.' });
    }

    // Afficher l'image en base64 dans le terminal
    console.log(`Image en base 64 : ${imageBase64}`);

  // Utilisez des requêtes préparées pour éviter les injections SQL
db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
        // Gestion des erreurs sans révéler d'informations sensibles
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
    
    db.run('INSERT INTO info (lname, fname, bdate, pseudo, pp, email) VALUES (?, ?, ?, ?, ?, ?)', [lname, fname, bdate, pseudo, imageBase64, email], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
        }
        res.status(201).json({ message: 'Inscription complète!' });
    });
});
}); 

// Fonction pour valider les entrées (exemple simple, à étendre selon les besoins)
function validateInput(lname, fname, bdate, pseudo, pp) {
    // Implémentez la validation ici
    // Vérifiez si les champs sont vides, si les dates sont valides, etc.
    if (!lname || !fname || !bdate || !pseudo || !pp) {
        return false;
    }
    return true;
}

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
       
// Close the database connection
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
        process.exit();
    });
});