"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = {
  description: string;
  time: number; // 초 단위 시간
};

const RecipeForm = ({
  userEmail,
  onRecipeAdded,
}: {
  userEmail: string;
  onRecipeAdded?: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [stepDescription, setStepDescription] = useState("");
  const [stepTime, setStepTime] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (userEmail) {
      const storedRecipes = localStorage.getItem(`recipes-${userEmail}`);
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }
    }
  }, [userEmail]);

  const handleAddTag = () => {
    if (tag.trim() === "") return;
    setTags([...tags, tag]);
    setTag("");
  };

  const handleAddIngredient = () => {
    if (ingredient.trim() === "") return;
    setIngredients([...ingredients, ingredient]);
    setIngredient("");
  };

  const handleAddStep = () => {
    if (stepDescription.trim() === "") return;
    const newStep: Step = {
      description: stepDescription,
      time: stepTime,
    };
    setSteps([...steps, newStep]);
    setStepDescription("");
    setStepTime(0);
  };

  const handleAddRecipe = () => {
    if (title.trim() === "") return;

    const newRecipe = {
      title,
      tags,
      ingredients,
      steps,
    };

    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    localStorage.setItem(
      `recipes-${userEmail}`,
      JSON.stringify(updatedRecipes)
    );
    setTitle("");
    setTags([]);
    setIngredients([]);
    setSteps([]);

    if (onRecipeAdded) {
      onRecipeAdded();
    }
  };

  const handleViewRecipes = () => {
    router.push("/recipes");
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl text-center text-gray-700 font-bold mb-4">
        레시피 추가
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter recipe title"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />

        <div className="space-y-2">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Enter tag"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleAddTag}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            태그 추가
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Enter ingredient"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleAddIngredient}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            재료 추가
          </button>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={stepDescription}
            onChange={(e) => setStepDescription(e.target.value)}
            placeholder="Enter cooking step"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="number"
            value={stepTime}
            onChange={(e) => setStepTime(Number(e.target.value))}
            placeholder="Enter time in seconds"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleAddStep}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            과정 추가
          </button>
        </div>

        <button
          onClick={handleAddRecipe}
          className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
        >
          레시피 추가
        </button>

        <button
          onClick={handleViewRecipes}
          className="mt-6 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          내 레시피 보기
        </button>
      </div>
    </div>
  );
};

export default RecipeForm;
