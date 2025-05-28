import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import sequelize from './config/dbMySql.js'; // Sequelize config
import mongoose from 'mongoose'; // Import mongoose

// Import des routes
import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import uploadRouter from './route/upload.router.js';
import subCategoryRouter from './route/subCategory.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import addressRouter from './route/address.route.js';
import orderRouter from './route/order.route.js';

// Import du modèle Product
import ProductModel from './models/mongo/product.model.js'; // Chemin à ajuster si besoin

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
    crossOriginResourcePolicy: false
}));

const PORT = process.env.PORT || 8082;

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Server is running on port " + PORT
    });
});

app.use('/api/user', userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use('/api/order', orderRouter);

// Fonction async pour connecter MySQL et MongoDB et démarrer le serveur
(async () => {
    try {
        // Connexion MySQL
        await sequelize.authenticate();
        console.log("✅ MySQL connection established successfully.");
        
        await sequelize.sync({ alter: true });
        console.log("🗂️ All MySQL models synchronized successfully.");

        // Connexion MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected successfully.");

        // Création de l'index texte pour Product
        const existingIndexes = await ProductModel.collection.indexes();
        const hasTextIndex = existingIndexes.some(index => index.key && index.key._fts === 'text');

        if (!hasTextIndex) {
            await ProductModel.collection.createIndex({ name: "text", description: "text" });
            console.log("✅ Index texte créé sur les champs 'name' et 'description'.");
        } else {
            console.log("ℹ️ L'index texte existe déjà.");
        }

        // Démarrage du serveur
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ Unable to connect to the database(s):", error);
        process.exit(1);
    }
})();
