import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function RecipeInstructions({ instructions }) {
    // split instructions into numbered steps
    const steps = instructions.split(". ").filter(Boolean);
  
    return (
        <ol style={styles.instructionList}>
            {steps.map((step, index) => (
                <li key={index}>
                    {/* remove whitespaces from both side */}
                    {step.trim()}
                    {/* add fullstop for every sentence */}
                    {index < steps.length ? "." : ""}
                </li>
            ))}
        </ol>
    );
}

  
function DrinkDetails() {
    const { id } = useParams();
    const [drink, setDrink] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState({});
    const [activeTab, setActiveTab] = useState("ingredients");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrinkDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/drink-recipes/${id}`);
                setDrink(response.data);
            } catch (error) {
                console.error("Error fetching drink details:", error);
            }
        };

        fetchDrinkDetails();

        // save recipes
        const saved = JSON.parse(localStorage.getItem("savedRecipes")) || {};
        setSavedRecipes(saved);
    }, [id]);

    if (!drink) return <p>No drink selected</p>;

    const toggleSaveRecipe = () => {
        setSavedRecipes((prev) => {
          const updated = { ...prev, [id] : !prev[id] };
          localStorage.setItem("savedRecipes", JSON.stringify(updated));
          return updated;
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.leftColumn}>
                <button onClick={() => navigate("/")} style={styles.backButton}>← Back</button>
                    <img src={drink.imageUrl || "https://via.placeholder.com/300"} alt={drink.name} style={styles.image} />
                    <h2 style={styles.title}>{drink.name}</h2>
                    <div style={styles.ratingRow}>
                        <p><strong>Average Rating:</strong> ⭐{drink.avgRate.toFixed(1)}</p>
                        {/* save button */}
                        <button style={styles.saveButton} 
                            onClick={toggleSaveRecipe}>
                            {savedRecipes[id] ? "♥" : "♡"}
                        </button>
                    </div>
                </div>

                <div style={styles.rightColumn}>
                {/* tabs for ingredients and instructions*/}
                    <div style={styles.tabHeader}>
                        <button style={activeTab === "ingredients" ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab("ingredients")}>
                            Ingredients
                        </button>
                        <button style={activeTab === "instructions" ? styles.activeTab : styles.tab}
                        onClick={() => setActiveTab("instructions")}>
                            Instructions
                        </button>
                    </div>
                    {/* tab contents */}
                    <div style={styles.tabContent}>
                        {activeTab === "ingredients" ? (
                            <ul style={styles.ingredientList}>
                                {drink.ingredients
                                    .filter(ing => ing.ingredient) 
                                    .map((ing, index) => (
                                        <li key={index}>
                                            {ing.measure ? `${ing.measure} ${ing.ingredient}` : ing.ingredient}
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <RecipeInstructions instructions={drink.instructions} /> 
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "90%",
        margin: "auto",
        padding: "20px",
        textAlign: "center",
    },
    contentWrapper: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: "5%",
    },
    leftColumn: {
        width: "40%",
        textAlign: "left",
    },
    rightColumn: {
        width: "55%",
        textAlign: "left",
    },
    ratingRow: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginTop: "10px",
    },
    title: {
        fontSize: "2rem",
        marginBottom: "1rem",
        textAlign: "center",
    },
    image: {
        width: "90%",
        height: "300px",
        objectFit: "cover",
        borderRadius: "5px",
        marginTop: "10%",
    },
    backButton: {
        textAlign: "left",
        marginBottom: "10px",
        padding: "10px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#0080ff",
        color: "white",
        cursor: "pointer",
    },
    saveButton: {
        background: "none", 
        fontSize: "1.5rem",
        cursor: "pointer",
        border: "none",
        marginRight: "9%",
    },
    ingredientList: {
        listStyleType: "square",
        textAlign: "left",
    },
    instructionList: {
        listStyleType: "decimal",
        textAlign: "left",
    },
    tabHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginLeft: "15%",
        marginRight: "15%",
        marginTop: "10%",
        //maxWidth: "60%",
    },
    tab: {
        padding: "10px 20px",
        cursor: "pointer",
        border: "none",
        borderBottom: "none",
        backgroundColor: "#fff",
        fontWeight: "bold",
        fontSize: "20px",
    },
    activeTab: {
        padding: "10px 20px",
        cursor: "pointer",
        border: "none",
        borderBottom: "3px solid #0080ff",
        backgroundColor: "#fff",
        fontWeight: "bold",
        fontSize: "20px",
    },
    tabContent: {
        textAlign: "left",
        padding: "10px", 
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
    }
  };

export default DrinkDetails;
