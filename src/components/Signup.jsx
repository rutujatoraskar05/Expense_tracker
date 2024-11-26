import React, { useState } from 'react';
import "../App.css";
import { auth, db, provider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from "firebase/firestore";

const Signup = () => {
  // State management
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Create user document in Firestore
  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      try {
        await setDoc(userRef, {
          name: user.displayName || name,
          email: user.email,
          photoURL: user.photoURL || "",
          createdAt: new Date(),
        });
        toast.success("User document created!");
      } catch (error) {
        toast.error("Error creating user document: " + error.message);
        console.info("Error creating user document: ", error);
      }
    } else {
      toast.info("User document already exists.");
    }
  };

  // Handle email signup
  const handleSignupWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (name && email && password && confirmPassword) {
      if (password === confirmPassword) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await createUserDocument(user);
          toast.success("User Created and Document Saved");
          resetForm();
          navigate("/dashboard");
        } catch (error) {
          toast.error("Signup failed: " + error.message);
        }
      } else {
        toast.error("Passwords do not match");
      }
    } else {
      toast.error("All fields are mandatory");
    }

    setLoading(false);
  };

  // Handle email login
  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (email && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login Successful");
        resetForm();
        navigate("/dashboard"); // Changed to navigate to dashboard after login
      } catch (error) {
        toast.error("Login failed: " + error.message);
      }
    } else {
      toast.error("Email and password are required");
    }

    setLoading(false);
  };

  // Handle Google signup/login
  const handleSignupWithGoogle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("Google Sign-In Successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Google Sign-In Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle between signup and login forms
  const handleToggle = () => {
    setIsLogin((prevState) => !prevState);
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="wrapper">
      <div className="signup-signin-container">
        <h2>
          {isLogin ? "Login to" : "Sign up on"} <span className="blue-text">ExpenseMate</span>
        </h2>

        <form onSubmit={isLogin ? handleLoginWithEmail : handleSignupWithEmail}>
          {!isLogin && (
            <div className="input-wrapper">
              <p>Full Name</p>
              <input type="text" placeholder="JonDoe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div className="input-wrapper">
            <p>Email</p>
            <input type="email" placeholder="JonDoe@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-wrapper">
            <p>Password</p>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}
              onClick={togglePasswordVisibility}
            ></i>
          </div>

          {!isLogin && (
            <div className="input-wrapper">
              <p>Confirm Password</p>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-blue" disabled={loading}>
            {isLogin ? "Login" : "Signup using email and Password"}
          </button>

          <p className="or">or</p>
          <button className="btn" onClick={handleSignupWithGoogle} disabled={loading}>
            Signup using Google
          </button>

          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"} <a href="#" onClick={handleToggle}>{isLogin ? "Sign up" : "Click Here"}</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
