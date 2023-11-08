import { useEffect, useState } from "react";
import { useGetUserID } from "../hook/useGetUserID";
import LikeButton from "../components/LikeButton";
import "./SavedRecipes.css";
import { SearchBar } from "../components/SearchBar";

export const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [showLikedRecipes, setShowLikedRecipes] = useState(false);
  const userID = useGetUserID();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`/api/recipe/get-recipe/${userID}`);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.data);
          console.log(data.data);
        } else {
          console.error("Failed to fetch data.");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecipes();
  }, [userID]);

  if (!userID) {
    window.location.href = "/";
    return;
  }

  const toggleLike = async (recipeId, isLiked) => {
    try {
      const newIsLiked = !isLiked; // Toggle the like status
      await fetch(`/api/recipe/update-like/${recipeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userID,
          isLiked: newIsLiked,
        }),
      });

      // Update the "isLiked" status locally
      const updatedRecipes = recipes.map((recipe) => {
        if (recipe._id === recipeId) {
          return { ...recipe, isLiked: newIsLiked };
        }
        return recipe;
      });
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to filter recipes based on keyword
  const filteredRecipes = recipes.filter((recipe) => {
    const { category, name } = recipe;
    const lowercaseKeyword = keyword.toLowerCase();
    return (
      (category.toLowerCase().includes(lowercaseKeyword) ||
        name.toLowerCase().includes(lowercaseKeyword)) &&
      (!showLikedRecipes || recipe.isLiked)
    );
  });

  return (
    <div>
      <h1 className="recipe-title">-My Recipes-</h1>
      <div className="container py-4">
        <div className="row">
          <SearchBar keyword={keyword} setKeyword={setKeyword} />
          <div className="col-md-3 mx-auto">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showLikedRecipes"
                checked={showLikedRecipes}
                onChange={() => setShowLikedRecipes(!showLikedRecipes)}
              />
              <label className="form-check-label" htmlFor="showLikedRecipes">
                Show Only Liked
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-grid">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <div className="card">
                <img
                  src={recipe.imageUrl}
                  className="card-img-top"
                  alt={recipe.name}
                />
                <div className="card-body">
                  <h3 className="card-title">{recipe.name}</h3>
                  <p className="card-text">{recipe.instructions}</p>
                  <p className="card-text">
                    Cooking Time: {recipe.cookingTime} mins
                  </p>
                  <LikeButton
                    className="like-button"
                    isLiked={recipe.isLiked}
                    onToggleLike={() => toggleLike(recipe._id, recipe.isLiked)}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No recipes found for the keyword.</p>
        )}
      </div>
    </div>
  );
};
