import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function DrinkRecipes() {
  // hooks to store drink recipes and search filters
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch drink recipes database from the backend
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5173/drink-recipes");
        // sort by avgRates
        const sortedRecipes = response.data.sort((a,b)=>b.avgRate-a.avgRate);
        // initialize recipes and filtered recipes to all
        setRecipes(sortedRecipes);
        setFilteredRecipes(sortedRecipes);
      } catch (error) {
        console.error("Error fetching drink recipes:", error);
      }
    };

    fetchRecipes();

    // save recipes
    const saved = JSON.parse(localStorage.getItem("savedRecipes")) || {};
    setSavedRecipes(saved);
  }, []);

  // Handle search for drink recipes
  const handleSearch = async () => {
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (ingredientSearch) params.ingredients = ingredientSearch;

      // construct query string from params
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`http://localhost:5173/drink-recipes?${queryString}`);

      setFilteredRecipes(response.data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setFilteredRecipes([]);
    }
  };


  const toggleSaveRecipe = (id) => {
    setSavedRecipes((prev) => {
      const updated = { ...prev, [id] : !prev[id] };
      localStorage.setItem("savedRecipes", JSON.stringify(updated));
      return updated;
    });
  };


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Drink Recipes</h2>

      {/* Search Bar & Filter Button */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <input 
        type="text"
        placeholder="Search by ingredients"
        value={ingredientSearch}
        onChange={(e) => setIngredientSearch(e.target.value)}
        style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>Search</button>
        
      </div>

      {/* Display Recipes */}
      <div style={styles.recipeList}>
        {filteredRecipes.length > 0 ? (
          // map through all available recipes
          filteredRecipes.map((recipe) => (
            <div 
            key={recipe._id} 
            style={styles.recipeCard} 
            // navigate to drink detail page if clicked
            onClick={() => navigate(`/drink/${recipe._id}`)}
            >
              {/* display image, if no image available, display placeholder*/}
              <img src={recipe.imageUrl || "https://via.placeholder.com/150"} alt={recipe.name} style={styles.image} />
              <h3 style={styles.recipeName}>{recipe.name}</h3>
              <div style={styles.ingredientHeader}>
                <strong>Ingredients:</strong>  
                <span style={styles.rates}>⭐{recipe.avgRate.toFixed(1)}</span><br/>
                </div>
              <p style={styles.recipeDetails}>
                {recipe.ingredients
                .filter(ing => ing.ingredient)
                // display only ingredient if measure is null
                .map((ing) => ing.measure ? `${ing.measure} ${ing.ingredient}`: ing.ingredient)
                .join(", ")}
              </p>

              {/* save button */}
              <button style={styles.saveButton} 
                onClick={(e)=> {e.stopPropagation(); toggleSaveRecipe(recipe._id)}}
                >
                  {savedRecipes[recipe._id] ? "♥" : "♡"}
              </button>
            </div>
          ))
        ) : (
          <p style={styles.noResults}>No recipes found.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "80%",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  searchInput: {
    width: "70%",
    padding: "10px",
    marginRight:"10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  searchButton: {
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#0080ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  filterButton: {
    marginLeft: "10px",
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#0080ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  recipeList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    alignItems: "stretch",
  },
  recipeCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  recipeName: {
    fontSize: "1.4rem",
    margin: "10px 0",
    wordWrap: "break-word",
    whiteSpace: "normal",
  },
  recipeDetails: {
    fontSize: "0.9rem",
    margin: "5px 0",
    textAlign: "left",
    wordWrap: "break-word",
  },
  ingredientHeader: {
    display: "flex",
    justifyContent: "space-between", 
    alignItems: "center", 
    fontSize: "0.9rem",
    marginBottom: "5px",
  },
  rates: {
    textAlign: "right",
  },
  saveButton: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "none", 
    fontSize: "1.5rem",
    cursor: "pointer",
    border: "none",
    marginTop: "auto", 
  },
  noResults: {
    fontSize: "1.2rem",
    color: "#777",
  },
};

export default DrinkRecipes;
