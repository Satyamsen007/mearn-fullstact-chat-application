import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';


export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,


  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get('/messages/users');
      set({ users: response.data.data });
    } catch (error) {
      console.error('Error fetching users:', error);
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
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/chat/${userId}`);
      set({ messages: response.data.data });
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, response.data.data] });
    } catch (error) {
      console.error('Error sending message:', error);
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

  listenForMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("new-message", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) return;

      set({ messages: [...get().messages, newMessage] });
    })
  },

  unListenForMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("new-message");
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  }
}))