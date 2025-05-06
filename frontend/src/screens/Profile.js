import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import API_URL from '../config';
import defaultProfileImg from "../images/defaultProfileImg.png";
import '../css/responsive.css';

function Profile() {
  // hooks to store drink recipes and search filters
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("saved");
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    email: "",
    password: "",
    profileImage: "",
  })


  // Update updatedUser whenever user data changes
  useEffect(() => {
    if (user) {
      setUpdatedUser({
        name: user.name || "",
        email: user.email || "",
        password: "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parseUser = JSON.parse(storedUser);
        setUser(parseUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user"); // Remove invalid data
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);


  useEffect(() => {
    if (!user || !user._id) return;

    // Fetch drink recipes database from the backend
    const fetchSavedRecipes = async () => {
      try {
          const response = await axios.get(`${API_URL}/user/${user._id}/saved-recipes`);
          
          // initialize recipes and filtered recipes to all
          setSavedRecipes(response.data);
        } catch (error) {
          console.error("Error fetching saved drink recipes:", error);
        }
    };

    const fetchCreatedRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/${user._id}/created-recipe`);
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

  // handle editing created recipes
  const handleEditRecipe = async (recipeId) => {
    // redirect to the form page
    navigate(`/edit-recipe/${recipeId}`);
  };

  // handle delete created recipes
  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`${API_URL}/user/${user._id}/delete-recipe/${recipeId}`);
      alert("Recipe deleted successfully!");
      setCreatedRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  // handle user detail editing
  const handleEditToggle = () => setEditing(!editing);

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handFileChange = (e) => {
    setUpdatedUser({ ...updatedUser, profileImage: e.target.files[0] });
  };

  const handleSaveUserDetailChange = async () => {
    const formData = new FormData();
    formData.append("name", updatedUser.name);
    formData.append("email", updatedUser.email);
    if (updatedUser.password) formData.append("password", updatedUser.password);
    if (updatedUser.profileImage instanceof File) {
      formData.append("profileImage", updatedUser.profileImage);
    }
    try {
      const response = await axios.put(`${API_URL}/user/${user._id}/edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      alert(response.data.message);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  // handle delete user account
  const handleDeleteAccount = async () => {
    // confirm deletion
    const confirmDelete = window.confirm("Are you sure to delete your account? This process cannot be undone.");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/user/${user._id}/delete`);
      alert("Account deleted successfully.");
      localStorage.removeItem("user");
      // redirect to signup page
      navigate('/signup');
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account.")
    }
  }

  return (
    <div style={styles.container} className='profile-container'>
      {/* user detail */}
      <div style={styles.leftColumn} className='leftColumn'>
        <img 
          src={user.profileImage
            ? user.profileImage.startsWith("http")
            ? user.profileImage
            : `${API_URL}${user.profileImage}`
            : defaultProfileImg
          }
          onError={(e) => e.target.src = defaultProfileImg} 
          alt="User Profile" style={styles.profileImage} 
        />
        <div style={styles.profileButtons}>
          <button onClick={handleEditToggle} style={styles.editProfileButton}>Edit Profile</button>
          <button onClick={handleDeleteAccount} style={styles.deleteAccountButton}>Delete Account</button>
        </div>  

        {editing ? (
          <div>
            <div style={styles.PersonalInputGroup}>
              <label>Name</label>
              <input type="text" name="name" value={updatedUser.name} onChange={handleChange} placeholder="Name" style={styles.textInput}/>
            </div>
            <div style={styles.PersonalInputGroup}>
              <label>Email</label>
              <input type="email" name="email" value={updatedUser.email} onChange={handleChange} placeholder="Email" style={styles.textInput}/>
            </div>
            <div style={styles.PersonalInputGroup}>
              <label>Password</label>
              <input type="password" name="password" value={updatedUser.password} onChange={handleChange} placeholder="New Password" style={styles.textInput}/>
            </div>
            <div style={styles.PersonalInputGroup}>
              <label>Image</label>
              <input type="file" name="profileImage" onChange={handFileChange} />
            </div>
            <button onClick={handleSaveUserDetailChange} style={styles.saveButton}>Save</button>
            <button onClick={handleEditToggle} style={styles.cancelButton}>Cancel</button>
          </div>
        ) : (
          <div>
            <h3 style={styles.username}>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        )}
      </div>

      {/* saved recipes */}
      <div style={styles.rightColumn} className='rightColumn'>
      <h2 style={styles.recipeTitle}>📖 My Recipes</h2>
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
              {savedRecipes.length > 0 ? (
              <div style={styles.recipeList} className='recipeRow'>
                {savedRecipes.map((recipe) => (
                  <div key={recipe._id} style={styles.recipeCard} onClick={() => navigate(`/drink/${recipe._id}`)}>
                    <img src={recipe.imageUrl 
                      ? recipe.imageUrl.startsWith("http") 
                      ? recipe.imageUrl  
                      : `${API_URL}${recipe.imageUrl}`
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
              <button style={styles.addButton} onClick={() => navigate("/create-recipe")}>
                {showForm ? "Cancel" : "Add Recipe"}
              </button>

              {createdRecipes.length > 0 ? (
                <div style={styles.recipeList}  className='recipeRow'>
                  {createdRecipes.map((recipe) => (
                    <div key={recipe._id} style={styles.recipeCard} onClick={() => navigate(`/drink/${recipe._id}`)}>
                      <img src={recipe.imageUrl ? `${API_URL}${recipe.imageUrl}` :  "https://via.placeholder.com/150"} alt={recipe.name} style={styles.image} />
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
    gridTemplateColumns: "40% 60%", 
    gap: "20px", 
    maxWidth: "90%", 
    margin: "auto",
    maxHeight: "100%",
  },
  leftColumn: {
    flex: 1,
    paddingRight: "30px",
    borderRight: "2px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  rightColumn: {
    textAlign: "left",
    padding: "20px",
  },
  profileImage: {
    width: "40%",
    objectFit: "cover",
    borderRadius: "50%",
    marginTop: "5%",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  username: {
    fontSize: "2rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  profileButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  editProfileButton: {
    backgroundColor: "#62c465",
    color: "white",
    border: "none",
    padding: "10px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "50px",
  },
  deleteAccountButton: {
    backgroundColor: "#FF0000",
    color: "white",
    border: "none",
    padding: "10px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "50px",
  },
  recipeTitle: { 
    marginTop: "0", 
    marginBottom: "20px",
    fontSize: "40px",
  },
  tabHeader: {
    display: "flex",
    justifyContent: "left",
    alignItems: "flex-start",
    marginTop: "5%",
  },
  tab: {
    padding: "10px 20px",
    margin: "10px 10px 10px 0",
    cursor: "pointer",
    border: "2px solid #ccc",
    borderRadius: "30px",
    backgroundColor: "transparent",
    fontWeight: "bold",
    fontSize: "15px",
  },
  activeTab: {
    padding: "10px 20px",
    margin: "10px 10px 10px 0",
    cursor: "pointer",
    border: "2px solid #0080ff",
    borderRadius: "30px",
    backgroundColor: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
  },
  tabContent: {
    textAlign: "left",
    padding: "10px", 
    borderRadius: "5px",
    marginTop: "20px",
  }, 
  recipeList: {
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
    gap: "20px",
  }, 
  recipeCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "180px",
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
  addButton: {
    backgroundColor: "#62c465",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginBottom: "20px",
    cursor: "pointer",
    borderRadius: "4px",
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
  PersonalInputGroup: {
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  textInput: {
    marginTop: "10px",
    marginRight: "10px",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  saveButton: {
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


export default Profile;
