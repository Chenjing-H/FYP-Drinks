const express = require("express"); 
const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());

// Set up file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure you have an "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

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
    },
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllDrink" }],
    createdRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllDrink" }]
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

app.use("/uploads", express.static("uploads"));

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
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
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

// save a recipe
app.post("/user/:userId/save-recipe/:recipeId", async (req, res) => {
    try {
      const { userId, recipeId } = req.params;
      
      // Verify the recipe exists
      const recipe = await AllDrinkRecipes.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Find user and update their saved recipes
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Initialize savedRecipes array if it doesn't exist
      if (!user.savedRecipes) {
        user.savedRecipes = [];
      }
      
      // Check if recipe is already saved
      if (user.savedRecipes.includes(recipeId)) {
        return res.status(400).json({ message: "Recipe already saved" });
      }
      
      // Add recipe to saved recipes
      user.savedRecipes.push(recipeId);
      await user.save();
      
      res.status(200).json({ message: "Recipe saved successfully" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Error saving recipe", error });
    }
  });

// unsave a recipe
app.delete("/user/:userId/save-recipe/:recipeId", async (req, res) => {
    try {
      const { userId, recipeId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove recipe from saved recipes
      if (user.savedRecipes) {
        user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
        await user.save();
      }
      
      res.status(200).json({ message: "Recipe removed from saved" });
    } catch (error) {
      console.error("Error removing saved recipe:", error);
      res.status(500).json({ message: "Error removing saved recipe", error });
    }
  });

// get saved recipes
app.get("/user/:userId/saved-recipes", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If you have a savedRecipes array in your user model
      if (!user.savedRecipes || user.savedRecipes.length === 0) {
        return res.json([]);
      }
      
      // Fetch the full recipe details
      const savedRecipes = await AllDrinkRecipes.find({
        _id: { $in: user.savedRecipes }
      });
      
      res.json(savedRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Error fetching saved recipes", error });
    }
  });
  
// get created recipes
app.get("/user/:userId/created-recipe", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.createdRecipes || user.createdRecipes.length === 0) {
        return res.json([]);
      }
      
      const createdRecipes = await AllDrinkRecipes.find({
        _id: { $in: user.createdRecipes }
      });
      
      res.json(createdRecipes);
    } catch (error) {
      console.error("Error fetching created recipes:", error);
      res.status(500).json({ message: "Error fetching created recipes", error });
    }
  });

// add self-created recipe
app.post("/user/:userId/add-recipe", upload.single("image"), async(req, res) => {
    try {
        const { userId } = req.params;
        const { name, ingredients, instructions, category, alcoholic, glass } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        };

        // create new recipe
        const newRecipe = new AllDrinkRecipes({
            name,
            ingredients,
            instructions,
            category: category.trim() || "Other / Unknown", 
            imageUrl, 
            avgRate: 0.0,
            alcoholic,
            glass,
        });

        await newRecipe.save();
        user.createdRecipes.push(newRecipe._id);
        await user.save();

        res.status(201).json({ message: "Recipe added successfully", recipe: newRecipe });
    } catch (error) {
        console.error("Error adding recipe:", error);
        res.status(500).json({ message: "Error adding recipe", error});
    }
});

// edit created recipe
app.put("/user/:userId/edit-recipe/:recipeId", upload.single("image"), async (req, res) => {
    try {
        const { userId, recipeId } = req.params;
        const { name, ingredients, instructions, category, alcoholic, glass } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.createdRecipes.includes(recipeId)) {
            return res.status(403).json({ message: "Unauthorized to edit this recipe" });
        };

        const recipe = await AllDrinkRecipes.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }
        if (req.file) {
            recipe.imageUrl = `/uploads/${req.file.filename}`;
        }

        recipe.name = name || recipe.name;
        recipe.ingredients = ingredients ? JSON.parse(ingredients) : recipe.ingredients;
        recipe.instructions = instructions || recipe.instructions;
        recipe.category = category || recipe.category;
        recipe.alcoholic = alcoholic || recipe.alcoholic;
        recipe.glass = glass || recipe.glass;

        await recipe.save();
        res.json({ message: "Recipe updated successfully", recipe });
    } catch (error) {
        console.error("Error updating recipe:", error);
        res.status(500).json({ message: "Error updating recipe", error});
    }
})

// delete created recipe
app.delete("/user/:userId/delete-recipe/:recipeId", async (req, res) => {
    try {
        const { userId, recipeId } = req.params;
        
        const recipe = await AllDrinkRecipes.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        await AllDrinkRecipes.findByIdAndDelete(recipeId);
        res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).json({ message: "Error deleting recipe", error });
    }
});


// fetch comments
app.get("/drink-recipes/:recipeId/comments", async (req, res) => {
    try {
        const recipe = await AllDrinkRecipes.findById(req.params.recipeId);
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
app.post("/drink-recipes/:recipeId/comments", async (req, res) => {
    try {
        const { user, text } = req.body;
        const { recipeId } = req.params;
        const recipe = await AllDrinkRecipes.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({ message: "Drink not found"});
        }

        const newComment = { _id: new mongoose.Types.ObjectId(), user, text, date: new Date(), likes: 0 };
        recipe.comments.push(newComment);
        await recipe.save();

        res.status(201).json({ comments: recipe.comments });
    } catch (error) {
        console.error("Error adding comment", error);
        res.status(500).json({message: "Error adding comment", error});
    }
})

// delete a comment
app.delete("/drink-recipes/:recipeId/comments/:commentId", async (req, res) => {
    try {
        const { recipeId, commentId } = req.params;

        const recipe = await AllDrinkRecipes.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Drink not found" });
        }

        // Filter out the comment to delete
        recipe.comments = recipe.comments.filter(comment => comment._id.toString() !== commentId);

        await recipe.save();
        res.json({ message: "Comment deleted successfully", comments: recipe.comments });
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

// rate a drink
app.put("/drink-recipes/:id/rate", async (req, res) => {
    try {
        const { rating } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Invalid rating value. Must be between 1 and 5." });
        }

        const recipe = await AllDrinkRecipes.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: "Drink not found" });
        }

        // Ensure rating history is stored
        if (!recipe.ratings) {
            recipe.ratings = [];
        }

        // Store the new rating
        recipe.ratings.push(rating);

        // Update avgRate using formula: totalRates / numOfRates
        const totalRates = recipe.ratings.reduce((sum, rate) => sum + rate, 0);
        recipe.avgRate = totalRates / recipe.ratings.length;

        await recipe.save();
        res.json({ message: "Rating added successfully", avgRate: recipe.avgRate });
    } catch (error) {
        console.error("Error adding rating:", error);
        res.status(500).json({ message: "Error adding rating", error });
    }
});



// --- Start server ---
const PORT = 5173;
app.listen(PORT, () => console.log(`Backend server started on http://localhost:${PORT}`));