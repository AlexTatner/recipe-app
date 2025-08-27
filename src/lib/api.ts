const SPOONACULAR_API_BASE_URL = "https://api.spoonacular.com";
const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

async function searchRecipesByIngredientsSpoonacular(ingredients: string[]) {
  if (!apiKey) {
    throw new Error("Spoonacular API key not found in environment variables.");
  }

  const ingredientList = ingredients.join(',');

  try {
    const response = await fetch(`${SPOONACULAR_API_BASE_URL}/recipes/findByIngredients?ingredients=${ingredientList}&number=12&ranking=2&apiKey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching recipes from Spoonacular:", error);
    return [];
  }
}

async function getRecipeInformation(id: number) {
  if (!apiKey) {
    throw new Error("Spoonacular API key not found in environment variables.");
  }

  try {
    const response = await fetch(`${SPOONACULAR_API_BASE_URL}/recipes/${id}/information?apiKey=${apiKey}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching recipe information for id ${id}:`, error);
    return null;
  }
}

export { searchRecipesByIngredientsSpoonacular as searchRecipesByIngredients, getRecipeInformation };
