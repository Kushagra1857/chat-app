import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import {io} from "socket.io-client"

// Strip any trailing slash — prevents "//login/api/..." double-slash bug
const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
axios.defaults.baseURL = backendUrl;

// Tell axios to always include credentials (needed alongside server-side credentials:true)
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"))

    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket , setSocket] = useState(null);

    // Check if user has a valid saved session — only runs when a token actually exists
    const checkAuth = async () => {
        try {
            const {data} = await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            // 401 = not logged in — this is expected on first visit, don't show a toast
            if (error.response?.status !== 401) {
                toast.error(error.message)
            }
            // Clear any stale/invalid token from localStorage
            localStorage.removeItem("token");
            setToken(null);
        }
    }


    // Login function to handle user authentication and socket connection
    const login = async (state, Credentials) => {
       try {
        const {data} = await axios.post(`/api/auth/${state}`, Credentials);
        if(data.success){
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token)
            toast.success(data.message) 
        }else{
            toast.error(data.message)
        }

       } catch (error) {
        toast.error(error.message)
       }
    }

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully")
        if (socket?.connected) socket.disconnect();
    }

    // Update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const {data} = await axios.put("/api/auth/update-profile" , body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Connect socket function to handle socket connection and online user updates
    const connectSocket = (userData) => {
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query:{
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers" , (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    useEffect(() => {
        if(token){
            // Restore the token header for all subsequent requests
            axios.defaults.headers.common["token"] = token;
            // Only validate the session when we actually have a saved token
            checkAuth();
        }
        // If no token — do nothing; router will redirect to /login automatically
    }, [])

    const value = {
         axios,
         authUser,
         onlineUsers,
         socket,
         login,
         logout,
         updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
