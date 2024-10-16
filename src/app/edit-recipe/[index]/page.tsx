//[index]는 레시피 번호

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Step = {
  description: string;
  time: number;
};

const EditRecipePage = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepDescription, setStepDescription] = useState("");
  const [stepTime, setStepTime] = useState<number>(0);

  const router = useRouter();
  const { index } = useParams(); // URL에서 레시피 인덱스 추출
  const recipeIndex = Array.isArray(index) ? index[0] : index;
  const { data: session, status } = useSession(); // NextAuth 세션 확인

  // 로그인 여부 체크
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser && status !== "authenticated") {
      // 로그인이 안되어 있으면 로그인 페이지로 리다이렉트
      router.push("/");
    }
  }, [status, router]);

  const userEmail = JSON.parse(localStorage.getItem("user") || "{}").email;

  // 레시피 데이터 불러오기
  useEffect(() => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(`recipes-${userEmail}`) || "[]"
    );
    const recipe = storedRecipes[parseInt(recipeIndex)]; // 인덱스에 맞는 레시피 가져오기
    if (recipe) {
      setTitle(recipe.title);
      setTags(recipe.tags || []);
      setIngredients(recipe.ingredients || []);
      setSteps(recipe.steps || []);
    }
  }, [recipeIndex, userEmail]);

  // 태그 추가
  const handleAddTag = () => {
    if (tag.trim() === "") return;
    setTags([...tags, tag]);
    setTag("");
  };

  // 재료 추가
  const handleAddIngredient = () => {
    if (ingredient.trim() === "") return;
    setIngredients([...ingredients, ingredient]);
    setIngredient("");
  };

  // 조리 과정 추가
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

  // 태그 삭제
  const handleDeleteTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  // 재료 삭제
  const handleDeleteIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  // 조리 과정 삭제
  const handleDeleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  // 레시피 저장 핸들러 (previousVersions에 저장 포함)
  const handleSaveRecipe = () => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(`recipes-${userEmail}`) || "[]"
    );

    // 현재 레시피를 수정하기 전에 이전 버전을 저장
    const previousRecipe = { ...storedRecipes[parseInt(recipeIndex)] };
    const storedPreviousVersions = JSON.parse(
      localStorage.getItem(`previousVersions-${userEmail}`) || "[]"
    );

    // 이전 버전의 lastModified 필드를 저장
    if (!storedPreviousVersions[recipeIndex]) {
      storedPreviousVersions[recipeIndex] = [];
    }
    storedPreviousVersions[recipeIndex].push({
      ...previousRecipe,
      lastModified: previousRecipe.lastModified || new Date().toLocaleString(),
    });

    // 수정된 레시피를 업데이트
    const updatedRecipe = {
      title,
      tags,
      ingredients,
      steps,
      lastModified: new Date().toLocaleString(), // 현재 시간으로 마지막 수정일 업데이트
    };

    // LocalStorage에 레시피 저장
    storedRecipes[parseInt(recipeIndex)] = updatedRecipe;
    localStorage.setItem(`recipes-${userEmail}`, JSON.stringify(storedRecipes));
    localStorage.setItem(
      `previousVersions-${userEmail}`,
      JSON.stringify(storedPreviousVersions)
    );

    // 저장 후 레시피 목록 페이지로 이동
    router.push("/recipes");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-black">레시피 수정</h1>

        {/* 레시피 제목 입력 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="레시피 제목을 입력하세요"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 태그 입력 및 삭제 */}
        <div className="mb-4">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="태그를 입력하세요"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTag}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            태그 추가
          </button>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-blue-500 bg-blue-100 px-2 py-1 rounded-full flex items-center"
              >
                #{tag}
                <button
                  onClick={() => handleDeleteTag(index)}
                  className="ml-2 bg-red-500 text-white px-2 rounded-full"
                >
                  삭제
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 재료 입력 및 삭제 */}
        <div className="mb-4">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="재료를 입력하세요"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleAddIngredient}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            재료 추가
          </button>
          <ul className="list-disc ml-6 mt-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700 flex items-center">
                {ingredient}
                <button
                  onClick={() => handleDeleteIngredient(index)}
                  className="ml-2 bg-red-500 text-white px-2 rounded-full"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* 조리 과정 입력 및 삭제 */}
        <div className="mb-4">
          <input
            type="text"
            value={stepDescription}
            onChange={(e) => setStepDescription(e.target.value)}
            placeholder="조리 과정을 입력하세요"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="number"
            value={stepTime}
            onChange={(e) => setStepTime(Number(e.target.value))}
            placeholder="시간을 초 단위로 입력하세요"
            className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={handleAddStep}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            조리 과정 추가
          </button>
          <ol className="list-decimal ml-6 mt-2">
            {steps.map((step, index) => (
              <li key={index} className="text-gray-700 flex items-center">
                {step.description} - {step.time}초
                <button
                  onClick={() => handleDeleteStep(index)}
                  className="ml-2 bg-red-500 text-white px-2 rounded-full"
                >
                  삭제
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* 레시피 저장 버튼 */}
        <button
          onClick={handleSaveRecipe}
          className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
        >
          레시피 저장
        </button>
      </div>
    </div>
  );
};

export default EditRecipePage;
