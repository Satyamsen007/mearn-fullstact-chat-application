import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === 'devlopment' ? 'http://localhost:5001' : '/'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/current-user');
            set({ authUser: response.data.data });
            get().connectSocket();
        } catch (error) {
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signUp: async (formData) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post('/auth/sign-up', formData);
            set({ authUser: response.data.data });
            toast.success("Account created successfully", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--p))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '🎉',
                duration: 3000,
            });
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--er))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '❌',
                duration: 4000,
            });
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success("Logged out successfully", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--p))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '👋',
                duration: 3000,
            });
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--er))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '❌',
                duration: 4000,
            });
        }
    },
    login: async (formData) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post('/auth/login', formData);
            set({ authUser: response.data.data });
            toast.success("Logged in successfully", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--p))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '✨',
                duration: 3000,
            });
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--er))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '❌',
                duration: 4000,
            });
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (formData) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put('/auth/update-profile', formData);
            set({ authUser: response.data.data });
            toast.success("Profile updated successfully", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--p))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '🎉',
                duration: 3000,
            });
        } catch (error) {
            console.error('Error updating profile:', error.response?.data || error);
            toast.error(error.response.data.message || "Something went wrong", {
                style: {
                    background: 'hsl(var(--b1))',
                    color: 'hsl(var(--bc))',
                    borderColor: 'hsl(var(--er))',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                icon: '❌',
                duration: 4000,
            });
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: async () => {
        const { authUser } = get();
        const currentSocket = get().socket;

        // If no auth user or socket already exists and is connected, return
        if (!authUser || (currentSocket && currentSocket.connected)) return;

        // Disconnect existing socket if any
        if (currentSocket) {
            currentSocket.disconnect();
        }

        // Create new socket connection
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        });

        // Set up event listeners
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        socket.on("users-online", (users) => {
            set({ onlineUsers: users });
        });

        // Store socket instance in state
        set({ socket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}))