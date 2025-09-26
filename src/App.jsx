import React, { useState } from 'react';
import { Search, Clock, Users, ChefHat, Plus, X } from 'lucide-react';

const RecipeFinder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const cuisines = [
    { value: '', label: 'Any Cuisine' },
    { value: 'african', label: 'African' },
    { value: 'american', label: 'American' },
    { value: 'british', label: 'British' },
    { value: 'cajun', label: 'Cajun' },
    { value: 'caribbean', label: 'Caribbean' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'eastern european', label: 'Eastern European' },
    { value: 'european', label: 'European' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'greek', label: 'Greek' },
    { value: 'indian', label: 'Indian' },
    { value: 'irish', label: 'Irish' },
    { value: 'italian', label: 'Italian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'jewish', label: 'Jewish' },
    { value: 'korean', label: 'Korean' },
    { value: 'latin american', label: 'Latin American' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'middle eastern', label: 'Middle Eastern' },
    { value: 'nordic', label: 'Nordic' },
    { value: 'southern', label: 'Southern' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'thai', label: 'Thai' },
    { value: 'vietnamese', label: 'Vietnamese' }
  ];

// API configuration - Replace with your actual Spoonacular API key
  const API_KEY = "f32bbf8eb1f34ed59658185c44fee18f";
  const API_BASE_URL = 'https://api.spoonacular.com/recipes';

  const recipeDatabase = [
  ];

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim().toLowerCase())) {
      setIngredients([...ingredients, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredientToRemove) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const findRecipes = async () => {
  if (ingredients.length === 0) return;
  
  setIsLoading(true);
  
  try {
    // Check if API key is set
    if (API_KEY !== 'f32bbf8eb1f34ed59658185c44fee18f') {
      // Use demo data if no API key is configured
      setRecipes();
      setIsLoading(false);
      return;
    }

    const ingredientsList = ingredients.join(',');
    
    // Build the API URL with cuisine filter
    let searchUrl = `${API_BASE_URL}/findByIngredients?ingredients=${ingredientsList}&number=12&ranking=1&ignorePantry=true&apiKey=${API_KEY}`;
      
    // Add cuisine filter if selected
    if (selectedCuisine) {
      searchUrl += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
    }

    // Search for recipes by ingredients
    const searchResponse = await fetch(
      `${API_BASE_URL}/findByIngredients?ingredients=${ingredientsList}&number=12&ranking=1&ignorePantry=true&apiKey=${API_KEY}`
    );
    
    if (!searchResponse.ok) {
      throw new Error('Failed to fetch recipes');
    }
    
    const searchResults = await searchResponse.json();
    
    // Get detailed information for each recipe
    const detailedRecipes = await Promise.all(
      searchResults.slice(0, 8).map(async (recipe) => {
        try {
          const detailResponse = await fetch(
            `${API_BASE_URL}/${recipe.id}/information?apiKey=${API_KEY}`
          );
          
          if (!detailResponse.ok) {
            throw new Error(`Failed to fetch details for recipe ${recipe.id}`);
          }
          
          const details = await detailResponse.json();
          
          return {
              id: recipe.id,
              name: details.title,
              image: details.image || '🍽️',
              cookTime: `${details.readyInMinutes || 30} mins`,
              servings: details.servings || 4,
              difficulty: getDifficultyFromTime(details.readyInMinutes),
              instructions: details.instructions ? 
                details.instructions.replace(/<[^>]*>/g, '') : 
                'Instructions not available',
              shortInstructions: details.instructions ? 
                details.instructions.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
                'Instructions not available',
              ingredients: details.extendedIngredients?.map(ing => ing.name) || [],
              sourceUrl: details.sourceUrl,
              usedIngredients: recipe.usedIngredients?.map(ing => ing.name) || [],
              missedIngredients: recipe.missedIngredients?.map(ing => ing.name) || [],
              usedIngredientCount: recipe.usedIngredientCount || 0,
              missedIngredientCount: recipe.missedIngredientCount || 0
            };
        } catch (error) {
          console.error(`Error fetching details for recipe ${recipe.id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any failed requests and sort by used ingredients
    const validRecipes = detailedRecipes
      .filter(recipe => recipe !== null)
      .sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
    
    setRecipes(validRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Fallback to demo data if API fails
    setRecipes();
  } finally {
    setIsLoading(false);
  }
};

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyFromTime = (time) => {
    switch(time) {
      case time <= 30: return 'Easy';
      case time <= 60: return 'Medium';
      case time >= 61: return 'Hard';
      default: return 'Medium';
    }
  };

  const getMatchingIngredients = (recipe) => {
    return ingredients.filter(ingredient => 
      recipe.ingredients.some(recipeIng => 
        recipeIng.toLowerCase().includes(ingredient) || 
        ingredient.includes(recipeIng.toLowerCase())
      )
    ).length;
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="w-12 h-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Recipe Finder</h1>
          </div>
          <p className="text-lg text-gray-600">
            Enter your ingredients and discover delicious recipes you can make!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Ingredients</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter an ingredient (e.g., chicken, tomatoes, pasta)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white min-w-[140px]"
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
            <button
              onClick={addIngredient}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Ingredient Tags and Cuisine Filter Display */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCuisine && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                🍴 {cuisines.find(c => c.value === selectedCuisine)?.label}
                <button
                  onClick={() => setSelectedCuisine('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>

          {/* Search Button */}
          <button
            onClick={findRecipes}
            disabled={ingredients.length === 0 || isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Searching...' : 'Find Recipes'}
          </button>
        </div>

        {/* Results Section */}
        {recipes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {typeof recipe.image === 'string' && recipe.image.startsWith('http') ? (
                          <img src={recipe.image} alt={recipe.name} className="w-8 h-8 rounded inline mr-2" />
                        ) : (
                          <span className="mr-2">{recipe.image}</span>
                        )}
                        {recipe.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.cookTime}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {recipe.servings} servings
                        </span>
                        {recipe.sourceUrl && (
                          <a 
                            href={recipe.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800 underline"
                          >
                            View Recipe
                          </a>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">
                        <strong>You have ({getMatchingIngredients(recipe)}):</strong>
                      </p>
                      {recipe.missedIngredientCount > 0 && (
                        <p className="text-xs text-red-600">
                          Need {recipe.missedIngredientCount} more
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {recipe.usedIngredients?.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium"
                        >
                          {ingredient}
                        </span>
                      )) || 
                      // Fallback for demo recipes
                      recipe.ingredients?.map((ingredient, index) => {
                        const isMatching = ingredients.some(userIng => 
                          ingredient.toLowerCase().includes(userIng) || 
                          userIng.includes(ingredient.toLowerCase())
                        );
                        return isMatching ? (
                          <span
                            key={index}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-medium"
                          >
                            {ingredient}
                          </span>
                        ) : null;
                      })}
                    </div>
                    
                    {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Still need:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.missedIngredients.slice(0, 5).map((ingredient, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                            >
                              {ingredient}
                            </span>
                          ))}
                          {recipe.missedIngredients.length > 5 && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                              +{recipe.missedIngredients.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <strong>Instructions:</strong> 
                    <div className="mt-1">
                      {expandedRecipe === recipe.id ? (
                        <div>
                          <p className="whitespace-pre-line">{recipe.instructions}</p>
                          <button
                            onClick={() => setExpandedRecipe(null)}
                            className="mt-2 text-orange-600 hover:text-orange-800 text-xs underline"
                          >
                            Show Less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p>{recipe.shortInstructions || recipe.instructions}</p>
                          {recipe.instructions && recipe.instructions.length > 150 && (
                            <button
                              onClick={() => setExpandedRecipe(recipe.id)}
                              className="mt-2 text-orange-600 hover:text-orange-800 text-xs underline"
                            >
                              Read Full Instructions
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {recipes.length === 0 && ingredients.length > 0 && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600">
              Try adding more common ingredients or different combinations!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <RecipeFinder />;
}