import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/responsive.css';

function RecipeInstructions({ instructions }) {
    // split instructions into numbered steps
    const steps = instructions.split(".").filter(Boolean);
  
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
    // hooks to store drink recipes and search filters
    const { id } = useParams();
    const [drink, setDrink] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState({});
    const [activeTab, setActiveTab] = useState("ingredients");

    const [userRating, setUserRating] = useState(0);
    const [isRating, setIsRating] = useState(false);
    const [showRatePopup, setShowRatePopup] = useState(false);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { name: "Guest" });
  
    const navigate = useNavigate();


    const fetchDrinkDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5173/drink-recipes/${id}`);

            // add to recently viewed
            const stored = JSON.parse(localStorage.getItem("recentViewed")) || [];
            const alreadyExists = stored.find(d => d._id === response.data._id);

            const updated = alreadyExists
                ? [response.data, ...stored.filter(d => d._id !== response.data._id)]
                : [response.data, ...stored];

            // stores 4 most recent viewed recipes
            localStorage.setItem("recentViewed", JSON.stringify(updated.slice(0, 4)));
            
            const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest";

            // check if user already liked the comment
            const updatedComments = response.data.comments.map(comment => ({
                ...comment, liked: comment.likedBy?.includes(userEmail) || false,
            }));

            setDrink(response.data);
            setComments(updatedComments);
        } catch (error) {
            console.error("Error fetching drink details:", error);
        }
    };

    const fetchSavedRecipes = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user._id) return;
    
            const response = await axios.get(`http://localhost:5173/user/${user._id}/saved-recipes`);
            const savedRecipeIds = response.data.map(recipe => recipe._id);
            
            // convert the array into an object for quick lookup
            const savedRecipesObject = savedRecipeIds.reduce((acc, id) => ({ ...acc, [id]: true }), {});
    
            setSavedRecipes(savedRecipesObject);
        } catch (error) {
            console.error("Error fetching saved recipes:", error);
        }
    };
    
    useEffect(() => {
        fetchDrinkDetails();
        fetchSavedRecipes();  
    }, [id]);
    

    if (!drink) return <p>No drink selected</p>;

    // toggle save recipe
    const toggleSaveRecipe = async() => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
    
          if (!user || !user._id) {
            alert("You need to log in to save recipes.");
            return;
          }
    
          if (savedRecipes[id]) {
            await axios.delete(`http://localhost:5173/user/${user._id}/save-recipe/${id}`);
          } else {
            await axios.post(`http://localhost:5173/user/${user._id}/save-recipe/${id}`);
          }
        //   setSavedRecipes(prev => ({ ...prev, [id]: !prev[id] }));
        fetchSavedRecipes();
        } catch (error) {
          console.error("Error saving recipe:", error);
        }
    };

    const handleRateDrink = async (rating) => {
        try {
            setIsRating(true);
            const response = await axios.put(`http://localhost:5173/drink-recipes/${id}/rate`, { rating });
    
            setDrink((prevDrink) => ({
                ...prevDrink,
                avgRate: response.data.avgRate,
            }));
    
            setUserRating(rating);
            setShowRatePopup(false); // Close the popup after rating
        } catch (error) {
            console.error("Error rating drink:", error);
        } finally {
            setIsRating(false);
        }
    };
    
    // add a comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
    
        try {
          const response = await axios.post(`http://localhost:5173/drink-recipes/${id}/comments`, {
            user: user.name,
            text: newComment,
          });
    
          setComments(response.data.comments);
          setNewComment("");
        } catch (error) {
          console.error("Error adding comment:", error);
        }
      };

    // delete a comment
    const handleDeleteComment = async (commentId) => {
        try {
            const response = await axios.delete(`http://localhost:5173/drink-recipes/${id}/comments/${commentId}`);
    
            // Update comments in state after deletion
            setDrink((prevDrink) => ({
                ...prevDrink,
                comments: response.data.comments,
            }));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

      // like a comment
      const handleLikeComment = async (commentId) => {
        const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest";

        if (!userEmail) {
            console.error("User not logged in.");
            return;
        }

        try {
          const response = await axios.put(`http://localhost:5173/drink-recipes/${id}/comments/${commentId}/like`, {userEmail});
          const updatedComments = response.data.map(comment => ({
            ...comment, liked: comment.likedBy?.includes(userEmail) || false, 
          }));
          setComments(updatedComments);
        } catch (error) {
          console.error("Error liking comment:", error);
        }
      };

    return (
        <div style={styles.container} className="detail-container">
            <div style={styles.contentWrapper} className="contentWrapper">
                <div style={styles.leftColumn} className="leftColumn">
                    <div style={styles.imageWrapper} className="imageWrapper">
                        <img src={drink.imageUrl 
                            ? drink.imageUrl.startsWith("http") 
                            ? drink.imageUrl  
                            : `http://localhost:5173${drink.imageUrl}`
                            : "https://via.placeholder.com/150"
                        } alt={drink.name} style={styles.image} />
                        <div style={styles.titleOverlay}>
                            <h2 style={styles.title}>{drink.name}</h2>
                        </div>
                    </div>

                    {/* Drink Labels */}
                    <div style={styles.labels}>
                        {drink.category && <p style={styles.label}>{drink.category}</p>}
                        {drink.alcoholic && <p style={styles.label}>{drink.alcoholic}</p>}
                        {drink.glass && <p style={styles.label}>{drink.glass}</p>}
                    </div>
                    
                    {/* Rating Popup */}
                    {showRatePopup && (
                        <div style={styles.popupOverlay}>
                            <div style={styles.popup}>
                                <h3>Rate {drink.name}</h3>
                                <div style={styles.ratingButtons}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            onClick={() => handleRateDrink(star)}
                                            style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            {star <= userRating ? "⭐" : "☆"}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowRatePopup(false)} style={styles.closeButton}>Close</button>
                            </div>
                        </div>
                    )}


                    <div style={styles.ratingRow}>
                        <p><strong>Rating:</strong> ⭐{drink.avgRate.toFixed(1)}</p>
                        <div style={styles.buttonContainer}>
                            {/* save button */}
                            <button style={styles.saveButton} 
                                onClick={(e)=> {e.stopPropagation(); toggleSaveRecipe(drink._id)}}>
                                {savedRecipes[id] ? "♥" : "♡"}
                            </button>
                            {/* rate button */}
                            <button onClick={() => setShowRatePopup(true)} style={styles.rateButton}>
                                ⭐ 
                            </button>
                        </div>
                    </div>
                </div>

                <div style={styles.rightColumn} className="rightColumn">
                    {/* tabs for ingredients and instructions*/}
                    <div style={styles.tabSection}>
                        {/* tab header */}
                        <div style={styles.tabHeader} className="tabHeader">
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
                    {/* comments */}
                    <div>
                        <h3>Comments</h3>
                        <div style={styles.comments}>
                            <input type="text" placeholder="Add comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} style={styles.commentInput} />
                            <button onClick={handleAddComment} style={styles.commentButton}>Post</button>
                        </div>

                        {/* display comments */}
                        <div>
                            {comments.length > 0 ? (
                                drink.comments.map((comment) => (
                                    <div key={comment._id} style={styles.comment}>
                                        {/* username and comment */}
                                        <div style={styles.commentText}>
                                            <strong>{comment.user}</strong>: {comment.text}
                                        </div>
                                        {/* likes and delete */}
                                        <div style={styles.likeContainer}>
                                            <button style={styles.likeButton} onClick={() => handleLikeComment(comment._id)}>
                                                {comment.liked ? "♥" : "♡"} {comment.likes}
                                            </button>

                                            {/* Only show delete button when the comment belongs to the user */}
                                            {comment.user === user.name && (
                                                <button style={styles.deleteButton} onClick={() => handleDeleteComment(comment._id)}>🗑</button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No comments yet. Be the first to comment!</p>
                            )}
                        </div>
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
        textAlign: "center",
    },
    contentWrapper: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    leftColumn: {
        width: "40%",
        textAlign: "left",
    },
    rightColumn: {
        width: "55%",
        textAlign: "left",
    },
    imageWrapper: {
        position: "relative",
        width: "90%",
        height: "450px",
        borderRadius: "40px",
        overflow: "hidden",
        marginTop: "10%",
        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.1)",
    },
    ratingRow: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginTop: "10px",
        marginRight: "10%",
    },
    titleOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        padding: "10px",
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        margin: 0,
        color: "white",
        padding: "0px 10px",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "40px",
        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.1)",
    },
    labels: {
        display: "flex",
        gap: "12px"
    },
    label: {
        border: "2px solid #66b3ff",
        borderRadius: "30px",
        padding: "3px 15px",
        backgroundColor: "#ebf5ff",
    },
    buttonContainer: {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
    },
    saveButton: {
        background: "none", 
        fontSize: "1.5rem",
        cursor: "pointer",
        border: "none",
        marginRight: "9%",
    },
    rateButton: {
        background: "none",
        color: "black",
        border: "none",
        cursor: "pointer",
        fontSize: "1.1rem",
    },
    popupOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
    },
    ratingButtons: {
        display: "flex",
        gap: "5px",
        marginTop: "10px",
    },
    closeButton: {
        marginTop: "10px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        padding: "8px 12px",
        cursor: "pointer",
        borderRadius: "5px",
        fontSize: "1rem",
    },
    tabSection: {
        paddingBottom: "10%",
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
    }, 
    comments: {
        display: "flex", 
        gap: "10px", 
        marginTop: "20px", 
    },
    commentInput: {
        flex: 1, 
        padding: "10px", 
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    commentButton: {
        padding: "10px 15px",
        marginTop: "10px",
        fontSize: "1rem",
        backgroundColor: "#0080ff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    comment: {
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center", 
        padding: "10px", 
        borderBottom: "1px solid #ccc",
    }, 
    likeButton: {
        textAlign: "right",
        background: "none",
        fontSize: "1rem",
        cursor: "pointer",
        border: "none",
    }, 
    deleteButton: {
        background: "none",
        fontSize: "1.3rem",
        cursor: "pointer",
        border: "none",
        marginLeft: "10px",
    },      
    commentText: {
        flex: 1,
        textAlign: "left",
    },
    likeContainer: {
        display: "flex",
        alignItems: "center", 
        gap: "5px",
    }
  };

export default DrinkDetails;
