import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

function CreateRecipe() {
    // hooks to store drink recipes and search filters
    const navigate = useNavigate();
    const [newRecipe, setNewRecipe] = useState({ 
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
        const user = localStorage.getItem('user');
        if (user) {
        const parseUser = JSON.parse(user);
        setUser(parseUser);
        } else {
        navigate('/login');
        }
    }, [navigate]);


    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...newRecipe.ingredients];
        updatedIngredients[index][field] = value;
        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
    };

    const addIngredientField = () => {
        setNewRecipe({ ...newRecipe, ingredients: [ ...newRecipe.ingredients, { ingredient: "", measure: "" } ]});
    };

    const removeIngredientField = (index) => {
        if (newRecipe.ingredients.length > 1) {
        const updatedIngredients = [...newRecipe.ingredients];
        updatedIngredients.splice(index, 1);
        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
        }
    };

    // handle new recipe submission
    const handleAddRecipe = async () => {
        const errors = {};
        if (!newRecipe.name.trim()) errors.name = "Name is required";
        if (!newRecipe.category.trim()) errors.category = "Category is required";
        if (!newRecipe.alcoholic.trim()) errors.alcoholic = "Alcoholic status is required";
        if (!newRecipe.instructions.trim()) errors.instructions = "Instructions are required";
        
        // at least one ingredient need to be added
        const hasValidIngredient = newRecipe.ingredients.some(
            ing => ing.ingredient.trim()
        );
        if (!hasValidIngredient) errors.ingredients = "At least one ingredient is required";
        
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newRecipe.name);
            formData.append("category", newRecipe.category);
            formData.append("alcoholic", newRecipe.alcoholic);
            formData.append("instructions", newRecipe.instructions);
            formData.append("glass", newRecipe.glass);

            newRecipe.ingredients.forEach((ing, index) => {
                formData.append(`ingredients[${index}][ingredient]`, ing.ingredient);
                formData.append(`ingredients[${index}][measure]`, ing.measure);
            });

            if (newRecipe.imageFile) {
                formData.append("image", newRecipe.imageFile);
            }

            console.log("Submitting recipe with image:", newRecipe.imageFile);
        
            await axios.post(`http://localhost:5173/user/${user._id}/add-recipe`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            console.log("Submitting FormData:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            alert("Recipe created successfully!");
            navigate("/profile");
        } catch (error) {
            console.error("Error adding recipe:", error);
        }
    };


    return (
        <div style={styles.container}>
            <h3>Add New Recipe</h3>
            
            {/* recipe name */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Recipe Name</label>
                <input 
                    type="text" 
                    placeholder="Recipe Name" 
                    value={newRecipe.name} 
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value})}
                    style={{ ...styles.input, borderColor: errors.name ? "red" : "#ddd" }} 
                />
                {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div> 
            
            {/* recipe ingredients */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Ingredients</label>
                {newRecipe.ingredients.map((ing, index) => (
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
                    placeholder="Instructions" 
                    value={newRecipe.instructions} 
                    onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value})}
                    style={{ ...styles.textarea, borderColor: errors.instructions ? "red" : "#ddd" }}
                />
                {errors.instructions && <p style={styles.errorText}>{errors.instructions}</p>}
            </div>
            
            {/* recipe category */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select 
                    value={newRecipe.category} 
                    onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value})}
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
                    value={newRecipe.alcoholic} 
                    onChange={(e) => setNewRecipe({ ...newRecipe, alcoholic: e.target.value})}
                    style={{ ...styles.input, borderColor: errors.alcoholic ? "red" : "#ddd" }}
                >
                    <option value="">Select</option>
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
                    onChange={(e) => setNewRecipe({ ...newRecipe, imageFile: e.target.files[0]})}
                />
            </div>

            {/* recipe glass */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Glass (Optional)</label>
                <input 
                    type="text" 
                    placeholder="Glass Type" 
                    value={newRecipe.glass} 
                    onChange={(e) => setNewRecipe({ ...newRecipe, glass: e.target.value})}
                    style={styles.input}
                />
            </div>

            <button onClick={handleAddRecipe} style={styles.submitButton}>Submit</button>
            <button onClick={() => navigate("/profile")} style={styles.cancelButton}>Cancel</button>
        </div>
)}

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
    submitButton: {
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

export default CreateRecipe;