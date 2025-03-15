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