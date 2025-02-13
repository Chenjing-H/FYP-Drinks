import React, { useEffect, useState } from "react";
import axios from "axios";

function DrinkRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  useEffect(() => {
    // Fetch drink recipes database
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5173/drink-recipes");
        setRecipes(response.data);
        setFilteredRecipes(response.data);
      } catch (error) {
        console.error("Error fetching drink recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  // Handle search
  const handleSearch = async () => {
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      if (ingredientSearch) params.ingredients = ingredientSearch;

      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`http://localhost:5173/drink-recipes?${queryString}`);

      setFilteredRecipes(response.data);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setFilteredRecipes([]);
    }
  }



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
        <button style={styles.filterButton}>
          Filter
        </button>
      </div>

      {/* Display Recipes */}
      <div style={styles.recipeList}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div key={recipe._id} style={styles.recipeCard}>
              <img src={recipe.imageUrl || "https://via.placeholder.com/150"} alt={recipe.name} style={styles.image} />
              <h3 style={styles.recipeName}>{recipe.name}</h3>
              <p style={styles.recipeDetails}>
                <strong>Average Rating:</strong> ⭐{recipe.avgRate.toFixed(1)}
              </p>
              <p style={styles.recipeDetails}>
                <strong>Ingredients:</strong>{" "}
                {recipe.ingredients.map((ing) => `${ing.ingredient} (${ing.measure})`).join(", ")}
              </p>
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
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  searchButton: {
    marginLeft: "10px",
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  filterButton: {
    marginLeft: "10px",
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  recipeList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
    gap: "20px",
  },
  recipeCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  recipeName: {
    fontSize: "1.5rem",
    margin: "10px 0",
  },
  recipeDetails: {
    fontSize: "0.9rem",
    margin: "5px 0",
  },
  noResults: {
    fontSize: "1.2rem",
    color: "#777",
  },
};

export default DrinkRecipes;
