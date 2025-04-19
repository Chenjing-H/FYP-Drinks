import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import './Homepage.css';


function Homepage() {
    const navigate = useNavigate();
    const [topDrinks, setTopDrinks] = useState([]);
    const [recentViewed, setRecentViewed] = useState([]);
    const [latestDrinks, setLatestDrinks] = useState([]);      
      
    useEffect(() => {
        const fetchTopDrinks = async () => {
            try {
                const response = await axios.get("http://localhost:5173/drink-recipes");
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

    return (
        <div style={styles.container}>
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>Sip Into the World of Mixology Magic</h1>
                <p style={styles.heroSubtitle}>
                    Discover a vibrant collection of drink recipes tailored to your taste buds.
                </p>
                <div style={styles.heroButtons}>
                    <button style={styles.exploreButton} onClick={() => navigate("/drinks")}>Explore Drinks</button>
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
                                    : `http://localhost:5173${recipe.imageUrl}`
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
                                        : `http://localhost:5173${recipe.imageUrl}`
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

            {/* Recently Viewed Section */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Recent Viewed</h3>
                <div style={styles.recipeRow}>
                    {recentViewed.map(recipe => (
                        <div 
                            key={recipe._id} 
                            style={styles.recipeCard} 
                            onClick={() => navigate(`/drink/${recipe._id}`)}
                        >
                            <img src={recipe.imageUrl 
                                ? recipe.imageUrl.startsWith("http") 
                                ? recipe.imageUrl  
                                : `http://localhost:5173${recipe.imageUrl}`
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
