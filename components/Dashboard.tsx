"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import RecipeForm from "./RecipeForm";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // 유저 정보가 localStorage에 없으면 로그인 페이지로 리다이렉트
    if (!storedUser && status !== "authenticated") {
      router.push("/"); // 로그인 페이지로 리다이렉트 ("/"가 로그인 페이지라 가정)
    } else if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserEmail(parsedUser.email);
      setIsLoggedIn(true);
    } else if (status === "authenticated" && session) {
      const userData = {
        email: session.user?.email || "",
        name: session.user?.name || "",
        image: session.user?.image || "",
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUserEmail(session.user?.email || "");
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [status, session, router]);

  const handleEmailPasswordSignIn = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const userData = {
      email,
      password,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUserEmail(email);
    setIsLoggedIn(true);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {session ? (
          isLoggedIn && (
            <>
              <div className="text-center mb-4">
                <img
                  src={session.user?.image || "/default-profile.png"}
                  className="rounded-full h-20 w-20 mx-auto mb-4"
                  alt="Profile Image"
                />
                <h1 className="text-3xl text-green-500 font-bold">
                  {session.user?.name}님의 레시피
                </h1>
                <p className="text-lg">{session.user?.email}</p>
              </div>
              <RecipeForm
                userEmail={userEmail}
                onRecipeAdded={() => setIsLoggedIn(true)}
              />
              <button
                onClick={handleSignOut}
                className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </>
          )
        ) : isLoggedIn ? (
          <>
            <div className="text-center mb-4">
              <h1 className="text-3xl text-green-500 font-bold">
                {userEmail}님의 레시피
              </h1>
            </div>
            <RecipeForm userEmail={userEmail} />
            <button
              onClick={handleSignOut}
              className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl text-center text-gray-700 font-bold mb-6">
              로그인
            </h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleEmailPasswordSignIn}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Login
              </button>
            </div>
            <div className="mt-6 flex justify-between space-x-5">
              <button
                onClick={() => signIn("google")}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => signIn("github")}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
              >
                Sign in with GitHub
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
