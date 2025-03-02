const express = require("express"); 
const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection 
const MONGO_DRINK_RECIPE_URL = "mongodb+srv://chenjingh:mahe12121126@cluster0.omdib.mongodb.net/DrinkRecipe";
const MONGO_USER_DETAILS_URL = "mongodb+srv://chenjingh:mahe12121126@cluster0.omdib.mongodb.net/UserDetails";

const drinkRecipeDB = mongoose.createConnection(MONGO_DRINK_RECIPE_URL);
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
    password: { type: String, required: true }, 
    profileImage: {
        type: String, 
        default: "https://www.vecteezy.com/free-vector/profile-icon",
    }
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
    alcoholic: {type: String, required: true }, 
    glass: { type: String }, 
    comments: [{
        user: String, 
        text: String, 
        date: {type: Date, default: Date.now }, 
        likes: {type: Number, default: 0},
        likedBy: {type:[String], default: [] }
    }]
}, { timestamps: true });
const AllDrinkRecipes = drinkRecipeDB.model("AllDrink", DrinkRecipeSchema, "AllDrink");

// Check server
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
        // save user to database with password being encrypted
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, profileImage: req.body.profileImage || "https://www.vecteezy.com/free-vector/profile-icon" });
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
        // check if the input detail matches with the user database
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json({ message: "Login successful",
            user: {
                name: user.name,
                email: user.email,
                profileImage: user.profileImage || "https://via.placeholder.com/150"
            } });
    } catch (e) {
        console.error("Login failed", e);
        res.status(500).json({ message: "Error logging in", e});
    }
});

// Display Users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords for security

        // if no users found
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // return users
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users", error });
    }
});


// app.put("/user/update", async (req, res) => {
//     try {
//       const { name, email, password, profileImage } = req.body;
//       const user = await User.findOne({ email });

//       if (!user) return res.status(404).json({ message: "User not found" });
      
//       if (name) user.name = name;
//       if (profileImage) user.profileImage = profileImage;
//       if (password) {
//         updateData.password = await bcrypt.hash(password, 10); // Hash new password
//       }

//       await user.save();
  
//       res.json({ message: "Profile updated", user: updatedUser });
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

// Display Drink Recipes
app.get("/drink-recipes", async (req, res) => {
    try {
        // search functions for recipe
        const { name, ingredients } = req.query;
        let query = {};

        // search by name
        if (name) {
            query.name = { $regex: name, $options: "i" }; // case-insensitive match
        }

        // search by ingredients
        if (ingredients) {
            const ingredientList = ingredients.split(",").map(ing => ing.trim().toLowerCase()); // convert to lowercase

            // recipes contains all the inputted ingredients
            query["ingredients.ingredient"] = { 
                $all: ingredientList.map(ing => new RegExp(ing, "i")) // case-insensitive match
            };
        }

        // find all matched recipes and display by avgRates from highest to lowest
        const recipes = await AllDrinkRecipes.find(query).sort({avgRate: -1});

        // if no recipes matches
        if (recipes.length === 0) {
            return res.status(404).json({ message: "No drink recipes found" });
        }

        // display all matches recipes
        res.json(recipes);
    } catch (error) {
        console.error("Error fetching drink recipes:", error);
        res.status(500).json({ message: "Error fetching drink recipes", error });
    }
});

// Display Chosen recipe detail
app.get("/drink-recipes/:id", async (req, res) => {
    try {
        const recipe = await AllDrinkRecipes.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Drink not found" });
        }
        res.json(recipe);
    } catch (error) {
        console.error("Error fetching drink details:", error);
        res.status(500).json({ message: "Error fetching drink details", error });
    }
});

// fetch comments
app.get("/drink-recipes/:id/comments", async (req, res) => {
    try {
        const recipe = await AllDrinkRecipes.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Drink not found" });
        }

        // Sort comments by likes (highest first) and date (newest first)
        const sortedComments = recipe.comments.sort((a, b) => b.likes - a.likes || b.date - a.date);
        
        res.json(sortedComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments", error });
    }
});

// add a comment
app.post("/drink-recipes/:id/comments", async (req, res) => {
    try {
        const { user, text } = req.body;
        const recipe = await AllDrinkRecipes.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Drink not found"});
        }

        const newComment = { user, text, date: new Date(), likes: 0 };
        recipe.comments.push(newComment);
        await recipe.save();

        res.status(201).json(recipe);
    } catch (error) {
        console.error("Error adding comment", error);
        res.status(500).json({message: "Error adding comment", error});
    }
})

// delete a comment
app.delete("/drink-recipes/:id/comments/:commentId", async (req, res) => {
    try {
        // get user email from request
        const { userEmail } = req.body;  
        if (!userEmail) {
            return res.status(400).json({ message: "User email is required" });
        }

        const recipe = await AllDrinkRecipes.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Drink not found" });

        // find the comment to delete
        const comment = recipe.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // check if the logged-in user is the comment owner
        if (comment.user !== userEmail) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        // remove the comment and save the drink
        comment.remove();
        await recipe.save();
        
        res.json(recipe.comments.sort((a, b) => b.likes - a.likes || new Date(b.date) - new Date(a.date)));
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Error deleting comment", error });
    }
});


// like a comment
app.put("/drink-recipes/:id/comments/:commentId/like", async (req, res) => {
    try {
        // track who liked the comments
        const { userEmail } = req.body;
        const recipe = await AllDrinkRecipes.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Drink not found" });
        }

        const comment = recipe.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (!comment.likedBy) {
            comment.likedBy = [];
        }

        // toggle likes
        const userIndex = comment.likedBy.indexOf(userEmail);
        // remove like if user already liked it
        if (userIndex > -1) {
            comment.likedBy.splice(userIndex, 1),
            comment.likes -= 1;
        // add like if hasn't 
        } else {
            comment.likedBy.push(userEmail);
            comment.likes += 1;
        }

        await recipe.save();
        res.json(recipe.comments.sort((a, b) => b.likes - a.likes || b.date - a.date));
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ message: "Error liking comment", error });
    }
});


// --- Start server ---
const PORT = 5173;
app.listen(PORT, () => console.log(`Backend server started on http://localhost:${PORT}`));