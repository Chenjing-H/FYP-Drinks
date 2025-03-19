import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import defaultProfileImg from "../images/defaultProfileImg.png";

function Profile() {
  // hooks to store drink recipes and search filters
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("saved");
  const [user, setUser] = useState(null);


  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parseUser = JSON.parse(user);
      setUser(parseUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    if (!user || !user._id) return;

    // Fetch drink recipes database from the backend
    const fetchSavedRecipes = async () => {
      try {
          const response = await axios.get(`http://localhost:5173/user/${user._id}/saved-recipes`);
          
          // initialize recipes and filtered recipes to all
          setSavedRecipes(response.data);
        } catch (error) {
          console.error("Error fetching saved drink recipes:", error);
        }
    };

    const fetchCreatedRecipes = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/user/${user._id}/created-recipe`);
        console.log("Created recipes response:", response.data);
        setCreatedRecipes(response.data);
      } catch (error) {
        console.error("Error fetching created recipes", error);
      }
    };

    fetchSavedRecipes();
    fetchCreatedRecipes();
  }, [user]);

  if (!user) return null;

  const handleEditRecipe = async (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
};

const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`http://localhost:5173/user/${user._id}/delete-recipe/${recipeId}`);
      alert("Recipe deleted successfully!");
      setCreatedRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
};


  return (
    <div style={styles.container}>
      {/* user detail */}
      <div style={styles.leftColumn}>
        <img src={user.profileImage} onError={(e) => e.target.src = defaultProfileImg} alt="User Profile" style={styles.profileImage} />
        
        <h3 style={styles.username}>{user.name}</h3>
        <p>{user.email}</p>
      </div>

      {/* saved recipes */}
      <div style={styles.rightColumn}>
        {/* tab navigation */}
        <div style={styles.tabHeader}>
          <button style={activeTab === "saved" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("saved")}>
            Saved
          </button>
          <button style={activeTab === "created" ? styles.activeTab : styles.tab} onClick={() => setActiveTab("created")}>
            Created
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === "saved" ? (
            <div>
              <h3>Saved Recipes</h3>
              {savedRecipes.length > 0 ? (
              <div style={styles.recipeList}>
                {savedRecipes.map((recipe) => (
                  <div key={recipe._id} style={styles.recipeCard} onClick={() => navigate(`/drink/${recipe._id}`)}>
                    <img src={recipe.imageUrl 
                      ? recipe.imageUrl.startsWith("http") 
                      ? recipe.imageUrl  
                      : `http://localhost:5173${recipe.imageUrl}`
                      : "https://via.placeholder.com/150"
                    } alt={recipe.name} style={styles.image} />
                    <h3 style={styles.recipeName}>{recipe.name}</h3>
                    </div>
                ))}
                </div>
              ) : (
                <p>No saved recipes</p>
              )}
            </div>
          ) : (
            <div>
              <h3>Created Recipes</h3>
              <button style={styles.addButton} onClick={() => navigate("/create-recipe")}>
                {showForm ? "Cancel" : "+"}
              </button>

              {createdRecipes.length > 0 ? (
                <div style={styles.recipeList}>
                  {createdRecipes.map((recipe) => (
                    <div key={recipe._id} style={styles.recipeCard} onClick={() => navigate(`/drink/${recipe._id}`)}>
                      <img src={recipe.imageUrl ? `http://localhost:5173${recipe.imageUrl}` :  "https://via.placeholder.com/150"} alt={recipe.name} style={styles.image} />
                      <h3 style={styles.recipeName}>{recipe.name}</h3>
                      <button style={styles.editButton} onClick={(e) => { e.stopPropagation(); handleEditRecipe(recipe._id); }}>Edit</button>
                      <button style={styles.deleteButton} onClick={(e) => {e.stopPropagation(); handleDeleteRecipe(recipe._id) }}>Delete</button>
                    </div>
                  ))}
                </div>
                ) : (
                  <p>No created recipes</p>
                )}
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "grid", 
    gridTemplateColumns: "30% 70%", 
    gap: "20px", 
    maxWidth: "90%", 
    margin: "auto",
    padding: "20px", 
  },
  tabHeader: {
    display: "flex",
    justifyContent: "left",
    alignItems: "flex-start",
    marginTop: "5%",
    //maxWidth: "60%",
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    borderBottom: "none",
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
  }, 
  leftColumn: {
    textAlign: "left",
    padding: "20px",  
    backgroundColor: "pink",
  },
  rightColumn: {
    textAlign: "left",
    padding: "20px",
    backgroundColor: "lavender",
  },
  profileImage: {
    width: "90%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "5px",
    marginTop: "10%",
  },
  username: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  logoutButton: {
    padding: "10px", 
    backgroundColor: "transparent", 
    border: "none",
    cursor: "pointer", 
    marginTop: "20%",
    marginLeft: "70%",
  },
  recipeList: {
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
    gap: "20px",
  }, 
  recipeCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  recipeName: {
    fontSize: "0.8rem",
    margin: "10px",
    fontWeight: "bold",
    wordWrap: "break-word",
    whiteSpace: "normal",
  },
  formContainer: {
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
  inputError: {
    borderColor: "red",
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
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  editButton: {
    backgroundColor: "#FFA500",
    color: "white",
    border: "none",
    padding: "5px 10px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    color: "white",
    border: "none",
    padding: "5px 10px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "4px",
  },
}


export default Profile;
