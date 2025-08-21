import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

interface UserState {
  isUpdatingProfilePicture: boolean;
  isUpdatingProfile: boolean;
  isUpdatingEmail: boolean;
  isUpdatingPassword: boolean;
  updateProfilePicture: (data: any) => Promise<void>;
  updateFirstName: (firstName: string) => Promise<void>;
  updateLastName: (lastName: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isUpdatingProfilePicture: false,
  isUpdatingProfile: false,
  isUpdatingEmail: false,
  isUpdatingPassword: false,

  updateProfilePicture: async (data) => {
    set({ isUpdatingProfilePicture: true });
    try {
      const res = await axiosInstance.put("/user/profile-picture", data);
      useAuthStore.getState().updateAuthUser(res.data.user);
      toast.success("Profile picture updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfilePicture: false });
    }
  },

  updateFirstName: async (firstName) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/profile", { firstName });
      useAuthStore.getState().updateAuthUser(res.data.user);
      toast.success("First name updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateLastName: async (lastName) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/profile", { lastName });
      useAuthStore.getState().updateAuthUser(res.data.user);
      toast.success("Last name updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateEmail: async (email) => {
    set({ isUpdatingEmail: true });
    try {
      const res = await axiosInstance.put("/user/profile", { email });
      useAuthStore.getState().updateAuthUser(res.data.user);
      toast.success("Email updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingEmail: false });
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ isUpdatingPassword: true });
    try {
      await axiosInstance.put("/user/password", {
        currentPassword,
        newPassword
      });
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingPassword: false });
    }
  }
}));