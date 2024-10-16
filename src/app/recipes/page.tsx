"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import RecipeForm from "../../../components/RecipeForm";
import { useRouter } from "next/navigation";

type Step = {
  description: string;
  time: number;
};

type Recipe = {
  title: string;
  tags: string[];
  ingredients: string[];
  steps: Step[];
  lastModified: string; // 마지막 수정일 추가
};

const RecipesPage = () => {
  const { data: session, status } = useSession(); // NextAuth 세션 상태 확인
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [previousVersions, setPreviousVersions] = useState<Recipe[][]>([]); // 레시피의 이전 버전 저장
  const [userEmail, setUserEmail] = useState("");
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(
    null
  );
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const router = useRouter();

  // 로그인 여부 체크 및 리다이렉트 처리
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser && status !== "authenticated") {
      router.push("/"); // 로그인 페이지로 리다이렉트
    } else if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserEmail(parsedUser.email);

      // 레시피 로드
      const storedRecipes = localStorage.getItem(`recipes-${parsedUser.email}`);
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }

      // 이전 버전 로드
      const storedPreviousVersions = localStorage.getItem(
        `previousVersions-${parsedUser.email}`
      );
      if (storedPreviousVersions) {
        setPreviousVersions(JSON.parse(storedPreviousVersions));
      }
    } else if (status === "authenticated" && session) {
      const userData = {
        email: session.user?.email || "",
        name: session.user?.name || "",
      };
      setUserEmail(session.user?.email || "");
      localStorage.setItem("user", JSON.stringify(userData));

      // 레시피 로드
      const storedRecipes = localStorage.getItem(`recipes-${userData.email}`);
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }

      // 이전 버전 로드
      const storedPreviousVersions = localStorage.getItem(
        `previousVersions-${userData.email}`
      );
      if (storedPreviousVersions) {
        setPreviousVersions(JSON.parse(storedPreviousVersions));
      }
    }
  }, [status, session, router]);

  const toggleDetails = (index: number) => {
    setExpandedRecipeIndex(expandedRecipeIndex === index ? null : index);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem(`recipes-${userEmail}`);
    localStorage.removeItem(`previousVersions-${userEmail}`);
    signOut({ redirect: false }).then(() => {
      setUserEmail("");
      setRecipes([]);
      setPreviousVersions([]);
      router.push("/");
    });
  };

  const toggleRecipeForm = () => {
    setShowRecipeForm(!showRecipeForm);
  };

  const handleRecipeAdded = () => {
    const storedRecipes = localStorage.getItem(`recipes-${userEmail}`);
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }
    setShowRecipeForm(false);
  };

  const handleDeleteRecipe = (recipeIndex: number) => {
    const updatedRecipes = recipes.filter((_, index) => index !== recipeIndex);
    setRecipes(updatedRecipes);
    localStorage.setItem(
      `recipes-${userEmail}`,
      JSON.stringify(updatedRecipes)
    );
  };

  const handleSaveRecipe = (updatedRecipe: Recipe, recipeIndex: number) => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(`recipes-${userEmail}`) || "[]"
    );

    // 현재 시간을 "마지막 수정일"로 저장
    const lastModified = new Date().toLocaleString();
    updatedRecipe.lastModified = lastModified;

    // 기존 레시피를 이전 버전으로 저장
    const previousRecipe = storedRecipes[recipeIndex];
    const updatedPreviousVersions = [...previousVersions];
    if (!updatedPreviousVersions[recipeIndex]) {
      updatedPreviousVersions[recipeIndex] = [];
    }
    updatedPreviousVersions[recipeIndex].push(previousRecipe); // 이전 버전에 추가

    // 저장
    storedRecipes[recipeIndex] = updatedRecipe;
    setRecipes(storedRecipes);
    setPreviousVersions(updatedPreviousVersions);

    // LocalStorage에 저장
    localStorage.setItem(`recipes-${userEmail}`, JSON.stringify(storedRecipes));
    localStorage.setItem(
      `previousVersions-${userEmail}`,
      JSON.stringify(updatedPreviousVersions)
    );
  };

  const handleRestorePreviousVersion = (recipeIndex: number) => {
    const previousVersionList = previousVersions[recipeIndex];

    if (!previousVersionList || previousVersionList.length === 0) return;

    // 마지막 버전을 복원
    const lastVersion = previousVersionList.pop();

    if (!lastVersion) return;

    const updatedRecipes = [...recipes];

    // 복원된 버전의 lastModified 값도 유지
    updatedRecipes[recipeIndex] = {
      ...lastVersion,
      lastModified: lastVersion.lastModified || new Date().toLocaleString(),
    };

    setRecipes(updatedRecipes);
    setPreviousVersions(previousVersions);

    // LocalStorage에 업데이트된 내용 저장
    localStorage.setItem(
      `recipes-${userEmail}`,
      JSON.stringify(updatedRecipes)
    );
    localStorage.setItem(
      `previousVersions-${userEmail}`,
      JSON.stringify(previousVersions)
    );
  };

  const handleStartTimer = (time: number) => {
    setTimer(time);
    setTimerActive(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => (prevTime ? prevTime - 1 : 0));
      }, 1000);
    } else if (timer === 0) {
      alert("시간이 다 되었습니다!");
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          나만의 레시피
        </h1>

        <div className="flex justify-between mb-6">
          <button
            onClick={toggleRecipeForm}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
          >
            {showRecipeForm ? "레시피 목록보기" : "레시피 추가하기"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>

        {showRecipeForm ? (
          <RecipeForm userEmail={userEmail} onRecipeAdded={handleRecipeAdded} />
        ) : (
          <>
            {recipes.length > 0 ? (
              <div className="space-y-4">
                {recipes.map((recipe, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg shadow-lg bg-gray-50"
                  >
                    <h2 className="text-2xl font-semibold text-black mb-2">
                      {recipe.title}
                    </h2>
                    <p className="text-sm text-black">
                      마지막 수정일: {recipe.lastModified}
                    </p>

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recipe.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="text-sm text-blue-500 bg-blue-100 px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {expandedRecipeIndex === index ? (
                      <>
                        <h3 className="text-lg font-bold mt-4 text-black">
                          Ingredients:
                        </h3>
                        <ul className="list-disc ml-6 text-gray-700">
                          {recipe.ingredients &&
                          recipe.ingredients.length > 0 ? (
                            recipe.ingredients.map(
                              (ingredient: string, i: number) => (
                                <li key={i}>{ingredient}</li>
                              )
                            )
                          ) : (
                            <li>No ingredients listed</li>
                          )}
                        </ul>

                        <h3 className="text-lg font-bold mt-4 text-black">
                          Steps:
                        </h3>
                        <ol className="list-decimal ml-6 text-gray-700">
                          {recipe.steps && recipe.steps.length > 0 ? (
                            recipe.steps.map((step: Step, i: number) => (
                              <li key={i}>
                                {step.description} - {step.time}초
                                <button
                                  onClick={() => handleStartTimer(step.time)}
                                  className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                                >
                                  타이머 시작
                                </button>
                              </li>
                            ))
                          ) : (
                            <li>No steps provided</li>
                          )}
                        </ol>

                        <div className="flex space-x-4 mt-4">
                          <button
                            onClick={() => router.push(`/edit-recipe/${index}`)}
                            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                          >
                            레시피 수정
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(index)}
                            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            레시피 삭제
                          </button>
                        </div>

                        {/* 이전 버전 복원 버튼 */}
                        {previousVersions[index] &&
                          previousVersions[index].length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-md font-bold text-black mb-2">
                                이전 버전 목록:
                              </h4>
                              {previousVersions[index].map(
                                (version, versionIndex) => (
                                  <div
                                    key={versionIndex}
                                    className="border p-2 mb-2 bg-gray-100 rounded"
                                  >
                                    <p className="text-sm text-black">
                                      버전 {versionIndex + 1} - 수정일:{" "}
                                      {version.lastModified || "Unknown"}
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleRestorePreviousVersion(index)
                                      }
                                      className="mt-2 w-full bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 transition"
                                    >
                                      이 버전으로 복원
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        <button
                          onClick={() => toggleDetails(index)}
                          className="mt-4 w-full bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          숨기기
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => toggleDetails(index)}
                        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        자세히보기
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                You don't have any recipes yet.
              </p>
            )}
          </>
        )}

        {timerActive && timer !== null && (
          <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg">
            남은 시간: {timer}초
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
