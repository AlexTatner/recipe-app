
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FaSearch, FaSpinner, FaPlus, FaTimes } from 'react-icons/fa';
import { searchRecipesByIngredients, getRecipeInformation } from '../lib/api';
import Changelog from './Changelog';

interface FormData {
  ingredients: string;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  sourceUrl: string;
}

export default function Home() {
  const { handleSubmit } = useForm<FormData>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientList, setIngredientList] = useState<string[]>([]);

  const handleAddIngredient = () => {
    const newIngredient = ingredientInput.trim().toLowerCase();
    if (newIngredient && !ingredientList.includes(newIngredient)) {
      setIngredientList([...ingredientList, newIngredient]);
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredientList(ingredientList.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const onSubmit: SubmitHandler<FormData> = async () => {
    if (ingredientList.length === 0) {
      setNoResults(true);
      setRecipes([]);
      return;
    }
    setIsLoading(true);
    setNoResults(false);
    setRecipes([]);
    try {
      const results = await searchRecipesByIngredients(ingredientList);
      if (results && results.length > 0) {
        const recipeDetailsPromises = results.map((recipe: any) => getRecipeInformation(recipe.id));
        const recipeDetails = await Promise.all(recipeDetailsPromises);

        const formattedRecipes = results.map((recipe: any, index: number) => {
          const details = recipeDetails[index];
          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            sourceUrl: details?.sourceUrl || '#',
          };
        });

        setRecipes(formattedRecipes);
      } else {
        setNoResults(true);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-gray-800 mb-8">
          Recipe Finder
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="ingredient-input" className="block text-lg font-medium text-gray-700 mb-2">
                Add Ingredients
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="ingredient-input"
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., chicken"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-all duration-200 ease-in-out shadow-sm"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {ingredientList.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-md">
                {ingredientList.map((ingredient) => (
                  <div key={ingredient} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    <span>{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={isLoading || ingredientList.length === 0}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-200 ease-in-out shadow-sm"
              >
                {isLoading ? (
                  <><FaSpinner className="animate-spin mr-2" /> Searching...</>
                ) : (
                  <><FaSearch className="mr-2" /> Search Recipes</>
                )}
              </button>
            </div>
          </form>
        </div>

        {recipes.length > 0 && (
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recipe Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">{recipe.title}</h3>
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md hover:bg-blue-600 transition"
                    >
                      View Recipe
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {noResults && (
          <div className="mt-10 text-center">
            <p className="text-xl text-gray-600">
              {ingredientList.length === 0 
                ? "Please add some ingredients to find recipes."
                : "No recipes found for the ingredients provided. Please try a different combination."
              }
            </p>
          </div>
        )}

        <Changelog />
      </div>
    </main>
  );
}
