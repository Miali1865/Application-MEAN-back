const User = require('../models/User');

exports.getAllUsers = async(req, res) => {
    try {
        const users = await User.find().select('-password'); // Ne pas afficher les mots de passe
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error });
    }
};

exports.getUserById = async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur", error });
    }
};

exports.getAllMechanics = async (req, res) => {
    try {
        const mechanics = await User.find({ role: "mecanicien" });

        if (mechanics.length === 0) {
            return res.status(404).json({ message: "Aucun mécanicien trouvé." });
        }

        res.status(200).json({
            message: "Liste des mécaniciens récupérée avec succès.",
            mechanics
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des mécaniciens :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};