import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditRecipe() {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [updatedRecipe, setUpdatedRecipe] = useState({
        name:"", 
        ingredients:[{ ingredient: "", measure: "" }], 
        instructions:"", 
        category:"", 
        alcoholic:"", 
        imageUrl:"" ,
        glass:"",
    });
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/drink-recipes/${recipeId}`);
                setRecipe(response.data);
                setUpdatedRecipe({
                    name: response.data.name,
                    ingredients: response.data.ingredients,
                    instructions: response.data.instructions,
                    category: response.data.category,
                    alcoholic: response.data.alcoholic,
                    imageUrl: response.data.imageUrl,
                    glass: response.data.glass,
                });
            } catch (error) {
                console.error("Error fetching recipe details:", error);
            }
        };
        fetchRecipe();
    }, [recipeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedRecipe((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setUpdatedRecipe((prev) => ({ ...prev, imageFile: e.target.files[0] }));
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...updatedRecipe.ingredients];
        updatedIngredients[index][field] = value;
        setUpdatedRecipe({ ...updatedRecipe, ingredients: updatedIngredients });
    };

    const addIngredientField = () => {
        setUpdatedRecipe({ ...updatedRecipe, ingredients: [ ...updatedRecipe.ingredients, { ingredient: "", measure: "" } ]});
    };

    const removeIngredientField = (index) => {
        if (updatedRecipe.ingredients.length > 1) {
        const updatedIngredients = [...updatedRecipe.ingredients];
        updatedIngredients.splice(index, 1);
        setUpdatedRecipe({ ...updatedRecipe, ingredients: updatedIngredients });
        }
    };

    const handleUpdateRecipe = async () => {
        if (!recipe) return;

        const user = JSON.parse(localStorage.getItem("user")); // Get user from localStorage
        if (!user) {
            alert("User not logged in");
            return;
        } 

        const errors = {};
        if (!updatedRecipe.name.trim()) errors.name = "Name is required";
        if (!updatedRecipe.category.trim()) errors.category = "Category is required";
        if (!updatedRecipe.alcoholic.trim()) errors.alcoholic = "Alcoholic status is required";
        if (!updatedRecipe.instructions.trim()) errors.instructions = "Instructions are required";
        
        // at least one ingredient need to be added
        const hasValidIngredient = updatedRecipe.ingredients.some(
            ing => ing.ingredient.trim()
        );
        if (!hasValidIngredient) errors.ingredients = "At least one ingredient is required";
        
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", updatedRecipe.name);
            // formData.append("ingredients", JSON.stringify(updatedRecipe.ingredients));
            formData.append("instructions", updatedRecipe.instructions);
            formData.append("category", updatedRecipe.category);
            formData.append("alcoholic", updatedRecipe.alcoholic);
            formData.append("glass", updatedRecipe.glass);
            formData.append("ingredients", JSON.stringify(updatedRecipe.ingredients));

            if (updatedRecipe.imageFile) {
                formData.append("image", updatedRecipe.imageFile);
            }

            await axios.put(`http://localhost:5173/user/${user._id}/edit-recipe/${recipeId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Recipe updated successfully!");
            navigate("/profile");
        } catch (error) {
            console.error("Error updating recipe:", error);
        }
    };

    if (!recipe) return <p>No recipe</p>;

    return (
        <div style={styles.container}>
            <h3>Edit Recipe</h3>

            {/* recipe name */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Recipe Name</label>
                <input 
                    type="text" 
                    name="name" 
                    value={updatedRecipe.name} 
                    onChange={handleChange} 
                    style={{ ...styles.input, borderColor: errors.name ? "red" : "#ddd" }} 
                />
                {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div>

            {/* recipe ingredients */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Ingredients</label>
                {updatedRecipe.ingredients.map((ing, index) => (
                    <div key={index} style={styles.ingredientRow}>
                        <input
                            type="text"
                            placeholder="Ingredient"
                            value={ing.ingredient}
                            onChange={(e) => handleIngredientChange(index, "ingredient", e.target.value)}
                            style={styles.ingredientInput}
                        />
                        <input
                            type="text"
                            placeholder="Measure"
                            value={ing.measure}
                            onChange={(e) => handleIngredientChange(index, "measure", e.target.value)}
                            style={styles.measureInput}
                        />
                        <button 
                            type="button" 
                            onClick={() => removeIngredientField(index)}
                            style={styles.removeButton}
                        >
                            X
                        </button>
                        {errors.ingredients && <p style={styles.errorText}>{errors.ingredients}</p>}
                    </div>
                ))}
                <button 
                    type="button" 
                    onClick={addIngredientField}
                    style={styles.addIngredientButton}
                >
                    + Add Ingredient
                </button>
            </div>

            {/* recipe instructions */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Instructions</label>
                <textarea 
                    name="instructions"
                    placeholder="Instructions" 
                    value={updatedRecipe.instructions} 
                    onChange={handleChange}
                    style={{ ...styles.textarea, borderColor: errors.instructions ? "red" : "#ddd" }}
                />
                {errors.instructions && <p style={styles.errorText}>{errors.instructions}</p>}
            </div>
            
            {/* recipe category */}
            <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select 
                value={updatedRecipe.category} 
                onChange={(e) => setUpdatedRecipe({ ...updatedRecipe, category: e.target.value})}
                style={{ ...styles.input, borderColor: errors.category ? "red" : "#ddd" }} 
            >
                <option value="">Select Category</option>
                <option value="Ordinary Drink">Ordinary Drink</option>
                <option value="Cocktail">Cocktail</option>
                <option value="Punch / Party Drink">Punch / Party Drink</option>
                <option value="Shot">Shot</option>
                <option value="Cocoa">Cocoa</option>
                <option value="Shake">Shake</option>
                <option value="Soft Drink">Soft Drink</option>
                <option value="Coffee / Tea">Coffee / Tea</option>
                <option value="Beer">Beer</option>
                <option value="Homemade Liqueur">Homemade Liqueur</option>
                <option value="Other/Unknown">Other / Unknown</option>
            </select>
                {errors.category && <p style={styles.errorText}>{errors.category}</p>}
            </div>
            
            {/* recipe alcoholic */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Alcoholic</label>
                <select  
                    value={updatedRecipe.alcoholic} 
                    onChange={handleChange}
                >
                    <option value="Alcoholic">Alcoholic</option>
                    <option value="Non-Alcoholic">Non-Alcoholic</option>
                    <option value="Optional">Optional</option>
                </select>
                {errors.alcoholic && <p style={styles.errorText}>{errors.alcoholic}</p>}
            </div>
            
            {/* recipe image */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Image (Optional)</label>
                <input 
                    type="file" 
                    accept='image/*'
                    onChange={handleImageChange}
                />
            </div>

            {/* recipe glass */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Glass (Optional)</label>
                <input 
                    type="text" 
                    placeholder="Glass Type" 
                    value={updatedRecipe.glass} 
                    onChange={handleChange}
                    style={styles.input}
                />
            </div>

            <button onClick={handleUpdateRecipe} style={styles.updateButton}>Update Recipe</button>
            <button onClick={() => navigate("/profile")} style={styles.cancelButton}>Cancel</button>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    formGroup: {
        marginBottom: "15px",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        fontWeight: "bold",
    },
    input: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        boxSizing: "border-box",
    },
    errorText: {
        color: "red",
        fontSize: "0.8rem",
        margin: "5px 0 0",
    },
    textarea: {
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        minHeight: "100px",
        boxSizing: "border-box",
    },
    ingredientRow: {
        display: "flex",
        marginBottom: "10px",
        alignItems: "center",
    },
    ingredientInput: {
        flex: "2",
        marginRight: "10px",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ddd",
    },
    measureInput: {
        flex: "1",
        marginRight: "10px",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ddd",
    },
    removeButton: {
        backgroundColor: "#ff4d4d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "5px 10px",
        cursor: "pointer",
    },
    addIngredientButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "8px 16px",
        cursor: "pointer",
        marginTop: "5px",
    },
    updateButton: {
        backgroundColor: "#0080ff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "5px 10px",
        cursor: "pointer",
        marginTop: "10px",
        marginRight: "10px",
    },
    cancelButton: {
        backgroundColor: "#ff4d4d",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "5px 10px",
        cursor: "pointer",
    },
}

export default EditRecipe;
