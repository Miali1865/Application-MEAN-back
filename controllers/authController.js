const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "L'email est déjà utilisé." });
        }

        // Vérifier si un manager existe déjà
        if (role === "manager") {
            const existingManager = await User.findOne({ role: "manager" });
            if (existingManager) {
                return res.status(400).json({ message: "Un manager existe déjà. Un seul manager est autorisé." });
            }
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer et enregistrer l'utilisateur
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // Générer le token JWT
        const token = jwt.sign({ id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "Utilisateur enregistré avec succès !",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }

        // Générer le token JWT
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.log("erreur ", error);
        res.status(500).json({ message: "Erreur lors de la connexion", error });
    }
};