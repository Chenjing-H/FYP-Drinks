import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import '../css/Homepage.css';
import '../css/responsive.css';


function Homepage() {
    const navigate = useNavigate();
    const [topDrinks, setTopDrinks] = useState([]);
    const [recentViewed, setRecentViewed] = useState([]);
    const [latestDrinks, setLatestDrinks] = useState([]);  
    const [recommendedDrinks, setRecommendedDrinks] = useState([]);
    const [user, setUser] = useState(null); 
      
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user);

        const fetchTopDrinks = async () => {
            try {
                const response = await axios.get(`${API_URL}/drink-recipes`);
                const sortedByRate = response.data.sort((a, b) => b.avgRate - a.avgRate).slice(0, 10);
                const sortedByDate = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
                setTopDrinks(sortedByRate);
                setLatestDrinks(sortedByDate);
            } catch (error) {
                console.error("Error fetching drinks:", error);
            }
        };

        const recent = JSON.parse(localStorage.getItem("recentViewed")) || [];
        setRecentViewed(recent);

        fetchTopDrinks();
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            // if no user then return without fetch recommendations
            if (!user) return; 
            try {
                // fetch saved recipes
                const savedRes = await axios.get(`${API_URL}/user/${user._id}/saved-recipes`);
                const savedDrinks = savedRes.data;

                const savedIngredients = new Set();
                // save user saved drinks id
                const savedIds = new Set();
                
                savedDrinks.forEach(drink => {
                    savedIds.add(drink._id);
                    drink.ingredients.forEach(ing => {
                        savedIngredients.add(ing.ingredient.toLowerCase());
                    });
                });
        
                // get all drinks
                const allRes = await axios.get(`${API_URL}/drink-recipes`);
                
                // calculate most matching recipes
                const scores = allRes.data
                    // filter out saved recipes
                    .filter(drink => !savedIds.has(drink._id))
                    .map(drink => {
                        let matchCount = 0;
                        drink.ingredients.forEach(ing => {
                            if (savedIngredients.has(ing.ingredient.toLowerCase())) {
                            matchCount++;
                            }
                        });
                    return { drink, score: matchCount };
                });
        
                // take the top four matching recipes
                const topMatches = scores
                    .sort((a, b) => b.score - a.score)
                    .filter(item => item.score > 0)
                    .slice(0, 4)
                    .map(item => item.drink);
        
                setRecommendedDrinks(topMatches);
            } catch (err) {
                console.error("Error fetching recommended drinks:", err);
            }
            };
        
            fetchRecommendations();
        }, [user]);
      

    return (
        <div style={styles.container}>
            <section style={styles.hero} className="hero">
                <h1 style={styles.heroTitle} className="heroTitle">Sip Into the World of Mixology Magic</h1>
                <p style={styles.heroSubtitle} className="heroSubtitle">
                    Discover a vibrant collection of drink recipes tailored to your taste buds.
                </p>
                <div style={styles.heroButtons} className="heroButtons">
                    <button style={styles.exploreButton} className="exploreButton" onClick={() => navigate("/drinks")}>Explore Drinks</button>
                </div>
            </section>

            {/* Top Drinks Section */}
            <h3 style={styles.sectionTitle}>Top Rated</h3>
            <Swiper
                modules={[Pagination, Autoplay, EffectCoverflow]}
                effect="coverflow"
                centeredSlides={true}
                grabCursor={true}
                slidesPerView="auto"                  
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 200,
                    modifier: 2,
                    slideShadows: false,
                }}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                navigation= {{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }}
                loop={true}
                pagination={{ clickable: true }}
                style={styles.topDrinksSwiper}
            >
                {topDrinks.map((recipe) => (
                    <SwiperSlide key={recipe._id} style={styles.coverflowSlide}>
                        <div
                            style={styles.topDrinksCard}
                            onClick={() => navigate(`/drink/${recipe._id}`)}
                        >
                            <img
                            src={
                                recipe.imageUrl
                                ? recipe.imageUrl.startsWith("http")
                                    ? recipe.imageUrl
                                    : `${API_URL}${recipe.imageUrl}`
                                : "https://via.placeholder.com/150"
                            }
                            alt={recipe.name}
                            style={styles.topDrinksImage}
                            />
                            <div style={styles.topNameRow}>
                            <p style={styles.topDrinkTitle}>{recipe.name}</p>
                            <span style={styles.rates}>⭐{recipe.avgRate.toFixed(1)}</span>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Latest Added Section */}
            <div style={styles.latestCreatedSection}>
                <h3 style={styles.sectionTitle}>Latest Created</h3>
                <Swiper
                    modules={[Pagination, Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    onSwiper={(swiper) => console.log(swiper)}
                    autoplay={{ delay: 2500, disableOnInteraction: false}}
                    onSlideChange={() => console.log('slide change')}
                    style={styles.bannerSwiper}
                >
                    {latestDrinks.map((recipe) => (
                        <SwiperSlide key={recipe._id}>
                            <div
                                style={styles.bannerSlide}
                                onClick={() => navigate(`/drink/${recipe._id}`)}
                            >
                                <img
                                    src={
                                    recipe.imageUrl
                                        ? recipe.imageUrl.startsWith("http")
                                        ? recipe.imageUrl
                                        : `${API_URL}${recipe.imageUrl}`
                                        : "https://via.placeholder.com/300"
                                    }
                                    alt={recipe.name}
                                    style={styles.bannerImage}
                                />
                                <div style={styles.bannerOverlay}>
                                    <h2 style={styles.bannerTitle}>{recipe.name}</h2>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Recommendation Section */}
            {user && recommendedDrinks.length > 0 && (
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Recommended For You</h3>
                    <div style={styles.recipeRow} className="recipeRow">
                        {recommendedDrinks.map(recipe => (
                            <div 
                                key={recipe._id} 
                                style={styles.recipeCard} 
                                onClick={() => navigate(`/drink/${recipe._id}`)}
                            >
                                <img
                                    src={recipe.imageUrl 
                                    ? recipe.imageUrl.startsWith("http")
                                        ? recipe.imageUrl  
                                        : `${API_URL}${recipe.imageUrl}`
                                        : "https://via.placeholder.com/150"
                                    }
                                    alt={recipe.name}
                                    style={styles.image}
                                />
                                <p style={styles.recipeName}>{recipe.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Recently Viewed Section */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Recent Viewed</h3>
                <div style={styles.recipeRow} className="recipeRow">
                    {recentViewed.map(recipe => (
                        <div 
                            key={recipe._id} 
                            style={styles.recipeCard} 
                            onClick={() => navigate(`/drink/${recipe._id}`)}
                        >
                            <img src={recipe.imageUrl 
                                ? recipe.imageUrl.startsWith("http") 
                                ? recipe.imageUrl  
                                : `${API_URL}${recipe.imageUrl}`
                                : "https://via.placeholder.com/150"
                            } alt={recipe.name} style={styles.image} />
                            <p style={styles.recipeName}>{recipe.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { 
        maxWidth: "100%",
    },
    // intro
    hero: {
        textAlign: "center",
        padding: "80px 20px 60px",
        backgroundImage: "url('https://www.expressomagazine.com/wp-content/uploads/2022/01/b94d4f336d6cdbbc9332bd15027fd3bc.jpg?x19731')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        height: "500px",
        marginBottom: "5%",
    },
    heroTitle: {
        width: "50%",
        fontSize: "3rem",
        fontWeight: "800",
        color: "#111827",
        marginTop: "12%",
        marginBottom: "20px",
        marginRight: "40%",
        lineHeight: "1.2",
        fontFamily: "'Outfit', sans-serif",
    },
    heroSubtitle: {
        fontSize: "1.2rem",
        color: "grey",
        marginBottom: "40px",
        maxWidth: "700px",
        margin: "0 50% 40px 5%",
    },
    heroButtons: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginRight: "50%",
    },
    exploreButton: {
        padding: "12px 24px",
        backgroundColor: "#0080ff",
        border: "none",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "1rem",
        color: "white",
        cursor: "pointer",
    },
    sectionTitle: {
        fontSize: "2rem",
        fontWeight: "700",
        marginBottom: "20px",
        color: "#111827",
    },

    // top drinks
    topDrinksSwiper: {
        marginBottom: "5%",
    },
    topDrinksCard: {
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        scrollSnapAlign: "start",
        cursor: "pointer",
        backgroundColor: "#fff",
    },
    topNameRow: {
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        marginRight: "10px",
    },
    coverflowSlide: {
        width: "40%",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease-in-out",
    },
    topDrinksImage: {
        width: "100%",
        height: "400px",
        objectFit: "cover",
    },
    topDrinkTitle: {
        fontSize: "1rem",
        fontWeight: "600",
        marginLeft: "10px",
    },
    rates: {
        fontSize: "0.9rem",
        fontWeight: "500",
        marginRight: "10px",
        color: "#fbbf24",
    },
      

    // latest created
    latestCreatedSection: {
        padding: "40px 20px",
        textAlign: "center",
        marginBottom: "5%",
    },
    bannerSwiper: {
        maxWidth: "90%",
        margin: "0 auto",
    },
    bannerSlide: {
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
    },
    bannerImage: {
        width: "100%",
        height: "450px",
        objectFit: "cover",
        display: "block",
    }, 
    bannerOverlay: {
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        color: "#fff",
        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    },
    bannerTitle: {
        fontSize: "2rem",
        fontWeight: "700",
    },  

    // recently viewed
    section: {
        margin: "20px",
    },
    recipeRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(21%, 1fr))",
        gap: "20px",
        alignItems: "stretch",
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
        height: "200px",
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
};

export default Homepage;
