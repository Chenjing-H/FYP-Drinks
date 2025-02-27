import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function DrinkRecipes() {
  // hooks to store drink recipes and search filters
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAlcoholic, setSelectedAlcoholic] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
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

        // fetch by categories
        const uniqueCategories = [
          ...new Set(response.data.map((drink) => drink.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching drink recipes:", error);
      }
    };

    fetchRecipes();

    // save recipes
    const saved = JSON.parse(localStorage.getItem("savedRecipes")) || {};
    setSavedRecipes(saved);
  }, []);


  // filter function
  useEffect(() => {
    let filtered = recipes;

    // filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((drink) => selectedCategories.includes(drink.category));
    }

    // filter by alcoholic 
    if (selectedAlcoholic.length > 0) {
      filtered = filtered.filter((drink) => selectedAlcoholic.includes(drink.alcoholic));
    }

    // filter by rate
    if (selectedRatings.length > 0) {
      filtered = filtered.filter((drink) => selectedRatings.some(rate => drink.avgRate >= rate));
    } 

    // search filter (by name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(drink => 
        drink.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // search filter (by ingredients)
    if (ingredientSearch.trim() !== "") {
      const ingredientKeywords = ingredientSearch.toLowerCase().split(",").map(ing => ing.trim());
      filtered = filtered.filter(drink =>
        // should contain all the inputted ingredients
        ingredientKeywords.every(keyword =>
          drink.ingredients.some(ing => ing.ingredient.toLowerCase().includes(keyword)))
      );
    }

    setFilteredRecipes(filtered);
  }, [selectedCategories, selectedAlcoholic, selectedRatings, searchTerm, ingredientSearch, recipes]);

  // handle filter selection
  const handleCheckboxChange = (filterType, value) => {
    if (filterType === "category") {
      setSelectedCategories(prev => 
        prev.includes(value) ? prev.filter(cat => cat !== value) : [...prev, value]
      );
    } else if (filterType === "alcoholic") {
      setSelectedAlcoholic(prev => 
        prev.includes(value) ? prev.filter(alcoholic => alcoholic !== value) : [...prev, value]
      );
    } else if (filterType === "rating") {
      setSelectedRatings(prev =>
        prev.includes(value) ? prev.filter(rate => rate !== value) : [...prev, value]
      );
    }
  };

  // clear filter function
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedAlcoholic([]);
    setSelectedRatings([]);
    setSearchTerm("");
    setIngredientSearch("");
    setFilteredRecipes(recipes);
  }

  // // Handle search for drink recipes
  // const handleSearch = async () => {
  //   try {
  //     const params = {};
  //     if (searchTerm) params.name = searchTerm;
  //     if (ingredientSearch) params.ingredients = ingredientSearch;
 
  //     // construct query string from params
  //     const queryString = new URLSearchParams(params).toString();
  //     const response = await axios.get(`http://localhost:5173/drink-recipes?${queryString}`);

  //     setFilteredRecipes(response.data);
  //   } catch (error) {
  //     console.error("Error searching recipes:", error);
  //     setFilteredRecipes([]);
  //   }
  // };


  const toggleSaveRecipe = (id) => {
    setSavedRecipes((prev) => {
      const updated = { ...prev, [id] : !prev[id] };
      localStorage.setItem("savedRecipes", JSON.stringify(updated));
      return updated;
    });
  };


  return (
    <div>
      <h2 style={styles.title}>Drink Recipes</h2>
      <div style={styles.container}>
        {/* filter */}
        <div style={styles.sidebar}>
          <h2>Filters</h2>

          {/* categories*/}
          <h4>Categories</h4>
          {categories.map((category, index) => (
            <label key={index} style={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedCategories.includes(category)} onChange={()=>handleCheckboxChange("category", category)} />
              {category}
            </label>
          ))}

          {/* alcoholic */}
          <h4>Alcoholic</h4>
          {["Alcoholic", "Non-Alcoholic", "Optional"].map((type, index) => (
            <label key={index} style={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedAlcoholic.includes(type)} onChange={()=>handleCheckboxChange("alcoholic", type)} />
              {type}
            </label>
          ))}

          {/* ratings */}
          <h4>Rates</h4>
          {[0,1,2,3,4,5].map((rating, index) => (
            <label key={index} style={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedRatings.includes(rating)} onChange={()=>handleCheckboxChange("rating", rating)} />
              {rating}+
            </label>
          ))}

          {/* clear all button */}
          <button onClick={clearFilters} style={styles.clearButton}>Clear</button>
        </div>

        <div style={styles.mainContent}>
          {/* Search Bar & Filter Button */}
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <input 
            type="text"
            placeholder="Search ingredients"
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
            style={styles.searchInput}
            />
            {/* <button onClick={handleSearch} style={styles.searchButton}>Search</button> */}
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
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", 
    maxWidth: "90%",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
    textAlign: "center",
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
  clearButton: {
    padding: "10px 15px",
    marginTop: "10px",
    fontSize: "1rem",
    backgroundColor: "#0080ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  sidebar: {
    width: "20%", 
    padding: "20px", 
    backgroundColor: "lavender",
    borderRadius: "10px",
    marginRight: "20px", 
  },
  checkboxLabel: {
    display: "block", 
    marginBottom: "5px",
    cursor: "pointer",
  },
  mainContent: {
    flex: 1,
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
