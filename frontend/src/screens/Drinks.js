import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import API_URL from "../config";
import '../css/responsive.css';

function DrinkRecipes() {
  // hooks to store drink recipes and search filters
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAlcoholic, setSelectedAlcoholic] = useState([]);
  const [tempMinRating, setTempMinRating] = useState("");
  const [tempMaxRating, setTempMaxRating] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
    // recipes for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstItem, indexOfLastItem);
  const [goToPageInput, setGoToPageInput] = useState("");

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const totalItems = filteredRecipes.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const getCenterPages = () => {
    const pages = [];
    // display page numbers before and after current page
    const range = 2; 
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);
  
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  
    return pages;
  };
  
  // scroll to top after turning page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch drink recipes database from the backend
    const fetchRecipes = async () => {
      try {
        await fetchSavedRecipes();

        const response = await axios.get(`${API_URL}/drink-recipes`);
        const allRecipes = response.data;
        // sort by avgRates
        const sortedRecipes = allRecipes.sort((a,b)=>b.avgRate-a.avgRate);
        // initialize recipes and filtered recipes to all
        setRecipes(sortedRecipes);
        setFilteredRecipes(sortedRecipes);

        // fetch by categories
        const uniqueCategories = [
          ...new Set(allRecipes.map((drink) => drink.category).filter(Boolean)),
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


const fetchSavedRecipes = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user._id) return;

        const response = await axios.get(`${API_URL}/user/${user._id}/saved-recipes`);
        const savedRecipeIds = response.data.map(recipe => recipe._id);
        
        // convert the array into an object for quick lookup
        const savedRecipesObject = savedRecipeIds.reduce((acc, id) => ({ ...acc, [id]: true }), {});

        setSavedRecipes(savedRecipesObject);
    } catch (error) {
        console.error("Error fetching saved recipes:", error);
    }
};


  // filter function
  useEffect(() => {
    let filtered = recipes;

    // filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((drink) => drink.category && selectedCategories.includes(drink.category));
    }

    // filter by alcoholic 
    if (selectedAlcoholic.length > 0) {
      filtered = filtered.filter((drink) => drink.alcoholic && selectedAlcoholic.includes(drink.alcoholic));
    }

    // filter by rate
    if (minRating !== "" || maxRating !== "") {
      filtered = filtered.filter((drink) => {
        const rating = drink.avgRate;
        if (minRating !== "" && rating < parseFloat(minRating)) return false;
        if (maxRating !== "" && rating > parseFloat(maxRating)) return false;
        return true;
      });
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
  }, [selectedCategories, selectedAlcoholic, selectedRatings, minRating, maxRating, searchTerm, ingredientSearch, recipes]);

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
    setMinRating("");
    setMaxRating("");
    setTempMinRating("");
    setTempMaxRating("");
    setSearchTerm("");
    setIngredientSearch("");
    setFilteredRecipes(recipes);
  }

  const toggleSaveRecipe = async(recipeId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        alert("You need to log in to save recipes.");
        return;
      }

      if (savedRecipes[recipeId]) {
        await axios.delete(`${API_URL}/user/${user._id}/save-recipe/${recipeId}`);
      } else {
        await axios.post(`${API_URL}/user/${user._id}/save-recipe/${recipeId}`);
      }
      // setSavedRecipes(prev => ({ ...prev, [recipeId]: !prev[recipeId] }));
      fetchSavedRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };


  return (
    <div>
      <button onClick={toggleFilters} className="menuButton">☰</button>
      <div style={styles.container}>
        {/* filter */}
        <div style={styles.sidebar} className={`sidebar ${showFilters ? "show" : "hide"}`}>
          <h2 style={styles.title}>Filters</h2>

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
          </div>

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
          <h4>Rate Range</h4>
          <div style={styles.rateRow}>
            <div style={styles.rateInputRow}>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={tempMinRating}
                placeholder="Min"
                onChange={(e) => setTempMinRating(e.target.value)}
                style={styles.rateInput}
              />
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={tempMaxRating}
                placeholder="Max"
                onChange={(e) => setTempMaxRating(e.target.value)}
                style={styles.rateInput}
              />
            </div>
            <button
              onClick={() => {
                setMinRating(tempMinRating);
                setMaxRating(tempMaxRating);
              }}
              style={styles.rateButton}
            >
              Apply
            </button>
          </div>

          {/* clear all button */}
          <button onClick={clearFilters} style={styles.clearButton} className="clearButton">Clear</button>
        </div>

        <div style={styles.mainContent}>
          {/* Display Recipes */}
          <div style={styles.recipeList} className="recipeRow">
            {currentRecipes.length > 0 ? (
              // map through all available recipes
              currentRecipes.map((recipe) => (
                <div 
                key={recipe._id} 
                style={styles.recipeCard} 
                // navigate to drink detail page if clicked
                onClick={() => navigate(`/drink/${recipe._id}`)}
                >
                  {/* display image, if no image available, display placeholder*/}
                  <img src={recipe.imageUrl 
                    ? recipe.imageUrl.startsWith("http") 
                    ? recipe.imageUrl  
                    : `${API_URL}${recipe.imageUrl}`
                    : "https://via.placeholder.com/150"
                  } alt={recipe.name} style={styles.image} />
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

        {/* Pagination Buttons */}
        <div style={styles.pagination}>
        
        {/* First Page */}
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          style={styles.paginationButton}
        >
          «
        </button>

        {/* Previous */}
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={styles.paginationButton}
        >
          ‹
        </button>

        {/* Center Page Numbers */}
        {getCenterPages().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              ...styles.paginationButton,
              backgroundColor: page === currentPage ? "#007bff" : "#eee",
              color: page === currentPage ? "white" : "black",
              fontWeight: page === currentPage ? "bold" : "normal",
            }}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={styles.paginationButton}
        >
          ›
        </button>

        {/* Last Page */}
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          style={styles.paginationButton}
        >
          »
        </button>

        {/* Range text */}
        <div style={styles.pageRange}>
          {startItem} - {endItem} of {totalItems} recipes
        </div>

        {/* Page Jump Input */}
        <div style={styles.pageJump}>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={goToPageInput}
            placeholder="Go"
            onChange={(e) => setGoToPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const page = Math.min(totalPages, Math.max(1, Number(goToPageInput)));
                setCurrentPage(page);
                setGoToPageInput("");
              }
            }}
            style={styles.pageInput}
          />
          <span style={styles.pages}>of {totalPages}</span>
        </div>
      </div>


        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex", 
    maxWidth: "100%",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  searchContainer: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "90%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  clearButton: {
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#0080ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10%"
  },
  sidebar: {
    width: "20%", 
    padding: "20px", 
    backgroundColor: "lavender",
    borderRadius: "10px",
    marginRight: "20px", 
    textAlign: "left",
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
  rateRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10%",
    width: "90%",
    marginBottom: "5%",
  },
  rateInputRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "90%",
  },
  rateInput: {
    marginRight: "10px",
    width: "40%",
  },
  rateButton: {
    backgroundColor: "#0080ff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  paginationButton: {
    padding: "6px 10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "lightgrey",
  },
  pageRange: {
    marginLeft: "15px",
    fontSize: "1rem",
  },
  pageJump: {
    marginLeft: "10px",
    display: "flex",
    alignItems: "center",
  },
  pageInput: {
    width: "40px",
    padding: "5px",
    marginRight: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  pages: {
    fontSize: "1rem",
  }
};

export default DrinkRecipes;
