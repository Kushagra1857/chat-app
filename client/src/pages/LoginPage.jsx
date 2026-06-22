import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // ── Step 1 of Sign Up: validate name/email/password before showing bio step ──
    if (currState === "Sign up" && !isDataSubmitted) {
      if (!fullName.trim()) {
        return toast.error("Please enter your full name");
      }
      if (!email.trim()) {
        return toast.error("Please enter your email address");
      }
      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
      setIsDataSubmitted(true);
      return;
    }

    // ── Final submission (login OR step 2 of sign up) ──
    if (isLoading) return; // prevent double-submit

    setIsLoading(true);
    try {
      await login(
        currState === "Sign up" ? "signup" : "login",
        { fullName, email, password, bio }
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Switch to Login and reset all state
  const switchToLogin = () => {
    setCurrState("Login");
    setIsDataSubmitted(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
  }

  // Switch to Sign Up and reset all state
  const switchToSignup = () => {
    setCurrState("Sign up");
    setIsDataSubmitted(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl '>
       {/* ----left-----*/}
       <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'  />

       {/*------right-----*/}
       <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
         <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className='w-5 cursor-pointer'
            />
          )}
         </h2>

         {/* Step 1 – Name (sign up only) */}
         {currState === "Sign up" && !isDataSubmitted && (
           <input
             onChange={(e) => setFullName(e.target.value)}
             value={fullName}
             type="text"
             className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
             placeholder='Full Name'
           />
         )}

         {/* Step 1 – Email & Password */}
         {!isDataSubmitted && (
           <>
             <input
               onChange={(e) => setEmail(e.target.value)}
               value={email}
               type="email"
               placeholder='Email Address'
               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
             />
             <input
               onChange={(e) => setPassword(e.target.value)}
               value={password}
               type="password"
               placeholder='Password (min 6 characters)'
               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
             />
           </>
         )}

         {/* Step 2 – Bio (sign up only, optional) */}
         {currState === "Sign up" && isDataSubmitted && (
           <div className='flex flex-col gap-1'>
             <textarea
               onChange={(e) => setBio(e.target.value)}
               value={bio}
               rows={4}
               className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
               placeholder='Write a short bio... (optional)'
             />
             <p className='text-xs text-gray-400'>You can skip this and add it later from your profile.</p>
           </div>
         )}

         <button
           type='submit'
           disabled={isLoading}
           className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity'
         >
           {isLoading
             ? "Please wait..."
             : currState === 'Sign up'
               ? (isDataSubmitted ? "Create Account" : "Next →")
               : "Login Now"
           }
         </button>

         <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" id="terms" />
          <label htmlFor="terms">Agree to the terms of use &amp; privacy policy.</label>
         </div>

         <div className='flex flex-col gap-2'>
            {currState === "Sign up" ? (
              <p className='text-sm text-gray-600'>Already have an account? <span
               onClick={switchToLogin}
               className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
            ) : (
              <p className='text-sm text-gray-600'>Create an account <span
               onClick={switchToSignup}
               className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
            )}
         </div>

       </form>

    </div>
  )
}

export default LoginPage
