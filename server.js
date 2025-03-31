const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout de connexion
        });
        console.log('MongoDB connecté');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
};

connectDB();

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const carRoute = require('./routes/carRoute');
const billingRoutes = require('./routes/billingRoutes');
const appointment = require('./routes/appointmentRoutes');
const dashboard = require('./routes/dashboardRoutes');

// Utilisation des routes
app.get('/', (res, req) => {
    req.send("hello word")
})
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/car', carRoute);
app.use('/api/billing', billingRoutes);
app.use('/api/appointment', appointment);
app.use('/api/dashboard', dashboard);
// app.use('/api/collections', collectionsRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));