import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, User } from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";
import { useUserStore } from "../stores/useUserStore";

import EditableFieldRow from "../components/profile/EditableFieldRow";
import PasswordFieldRow, {
  type PasswordFormData,
  type ShowPasswordState,
} from "../components/profile/PasswordFieldRow";
import ProfilePictureSection from "../components/profile/ProfilePictureSection";

interface EditableField {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
}

interface FormData extends PasswordFormData {
  firstName: string;
  lastName: string;
  email: string;
}

type EditableFieldKey = keyof EditableField;

const ProfilePage = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const isSocketConnected = useAuthStore((s) => s.isSocketConnected);
  const { isUpdatingProfilePicture, updateProfilePicture, updateFirstName, updateLastName, updateEmail, updatePassword } = useUserStore();
  const isOnline = Boolean(authUser && isSocketConnected && onlineUsers.includes(authUser._id));
  const [isEditing, setIsEditing] = useState<EditableField>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState<ShowPasswordState>({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState<FormData>({
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    email: authUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
      }));
    }
  }, [authUser]);

  const handleEdit = (field: EditableFieldKey) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: EditableFieldKey) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));

    if (field === "password") {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } else if (authUser) {
      setFormData((prev) => ({
        ...prev,
        [field]: authUser[field as keyof typeof authUser] || "",
      }));
    }
  };

  const handleSave = async (field: EditableFieldKey) => {
    try {
      if (field === "password") {
        if (!formData.currentPassword) {
          toast.error("Current password is required");
          return;
        }

        if (!formData.newPassword) {
          toast.error("New password is required");
          return;
        }

        if (!formData.confirmPassword) {
          toast.error("Please confirm your new password");
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }

        if (formData.newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        await updatePassword(formData.currentPassword, formData.newPassword);

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else if (field === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }

        await updateEmail(formData.email);
      } else if (field === "firstName") {
        if (!formData.firstName.trim()) {
          toast.error("First name is required");
          return;
        }
        await updateFirstName(formData.firstName);
      } else if (field === "lastName") {
        if (!formData.lastName.trim()) {
          toast.error("Last name is required");
          return;
        }
        await updateLastName(formData.lastName);
      }

      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error updating ${field}:`, error);
      toast.error(message);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof ShowPasswordState) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen pb-10 bg-base-200">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-100 rounded-xl p-6 space-y-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
            <p className="mt-2 text-base-content/70">Manage your account information</p>
          </div>

          {/* Profile Picture */}
          <ProfilePictureSection
            src={authUser?.profilePic || "avatar.png"}
            isOnline={isOnline}
            isUploading={isUpdatingProfilePicture}
            onUploadBase64={(base64Image) => updateProfilePicture({ profilePic: base64Image })}
          />

          <div className="space-y-6">
            {/* First Name */}
            <EditableFieldRow
              label="First Name"
              field="firstName"
              icon={<User className="w-4 h-4" />}
              value={formData.firstName}
              displayValue={authUser?.firstName || "Not set"}
              isEditing={isEditing.firstName}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />

            {/* Last Name */}
            <EditableFieldRow
              label="Last Name"
              field="lastName"
              icon={<User className="w-4 h-4" />}
              value={formData.lastName}
              displayValue={authUser?.lastName || "Not set"}
              isEditing={isEditing.lastName}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />

            {/* Email */}
            <EditableFieldRow
              label="Email Address"
              field="email"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              displayValue={authUser?.email}
              isEditing={isEditing.email}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
              type="email"
            />

            {/* Password */}
            <PasswordFieldRow
              isEditing={isEditing.password}
              formData={formData}
              showPassword={showPassword}
              onChange={handleInputChange}
              onToggleVisibility={togglePasswordVisibility}
              onEdit={() => handleEdit("password")}
              onCancel={() => handleCancel("password")}
              onSave={() => handleSave("password")}
            />

            {/* Account Information */}
            <div className="mt-6 bg-base-200 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-base-content/10">
                  <span className="text-base-content/70">Member Since</span>
                  <span className="font-medium">
                    {authUser?.createdAt
                      ? new Date(authUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/70">Account Status</span>
                  <span className="badge badge-success badge-lg">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;