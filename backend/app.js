const express = require("express"); 
const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection URLs (Replace with your actual credentials)
const MONGO_DRINK_RECIPE_URL = "mongodb+srv://chenjingh:mahe12121126@cluster0.omdib.mongodb.net/DrinkRecipe";
const MONGO_USER_DETAILS_URL = "mongodb+srv://chenjingh:mahe12121126@cluster0.omdib.mongodb.net/UserDetails";

// Connect to DrinkRecipe Database
const drinkRecipeDB = mongoose.createConnection(MONGO_DRINK_RECIPE_URL);

// Connect to UserDetails Database
const userDetailsDB = mongoose.createConnection(MONGO_USER_DETAILS_URL);

// Check database connections
drinkRecipeDB.on("connected", () => console.log("Connected to DrinkRecipe DB"));
userDetailsDB.on("connected", () => console.log("Connected to UserDetails DB"));

drinkRecipeDB.on("error", (error) => console.log("DrinkRecipe DB connection error:", error));
userDetailsDB.on("error", (error) => console.log("UserDetails DB connection error:", error));


// --- Database Models ---

// UserDetails Database
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });
const User = userDetailsDB.model("User", UserSchema, "User");

// DrinkRecipe Database
const DrinkRecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [{ ingredient: String, measure: String }], required: true },
    instructions: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, default:'' },
    avgRate: { type: Number, default: 0.0 }, 
    alcoholic: {type: Boolean }, 
    glass: { type: String }
}, { timestamps: true });
const AllDrinkRecipes = drinkRecipeDB.model("AllDrink", DrinkRecipeSchema, "AllDrink");


app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running fine!" });
});

// Signup route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    // check if the email has been used
    const existed = await User.findOne({ email: email });
    if (existed) {
        return res.status(400).json({ data: "This email has already been registered."})
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup error: ", error);
        res.status(400).json({ message: "User creation failed", error});
    }
});

// Login route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json({ message: "Login successful",
            user: {
                name: user.name,
                email: user.email
            } });
    } catch (e) {
        console.error("Login unsuccessed", e);
        res.status(500).json({ message: "Error logging in", e});
    }
});

// Display Users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords for security

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
});

// Display Drink Recipes
app.get("/drink-recipes", async (req, res) => {
    try {
        // search functions for recipe
        const { name, ingredients } = req.query;
        let query = {};

        // search by names
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }

        // search by ingredients
        if (ingredients) {
            const ingredientList = ingredients.split(",").map(ing => ing.trim().toLowerCase()); // Convert to lowercase

            query["ingredients.ingredient"] = { 
                $all: ingredientList.map(ing => new RegExp(ing, "i")) // Case-insensitive match
            };
        }

        
        const recipes = await AllDrinkRecipes.find(query);

        if (recipes.length === 0) {
            return res.status(404).json({ message: "No drink recipes found" });
        }

        res.json(recipes);
    } catch (error) {
        console.error("Error fetching drink recipes:", error);
        res.status(500).json({ message: "Error fetching drink recipes", error });
    }
});



// --- Start server ---
const PORT = 5173;
app.listen(PORT, () => console.log(`Backend server started on http://localhost:${PORT}`));