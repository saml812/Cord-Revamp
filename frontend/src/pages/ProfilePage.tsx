import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { Camera, Mail, User, Edit2, Save, X, Lock, Eye, EyeOff } from "lucide-react";

interface EditableField {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const { isUpdatingProfilePicture, updateProfilePicture, updateFirstName, updateLastName, updateEmail, updatePassword } = useUserStore();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<EditableField>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
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
      setFormData(prev => ({
        ...prev,
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
      }));
    }
  }, [authUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result as string;
      setUploadError(null);
      await updateProfilePicture({ profilePic: base64Image });
    };

    reader.onerror = () => {
      setUploadError("Error reading file");
    };
  };

  const handleEdit = (field: keyof EditableField) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleCancel = (field: keyof EditableField) => {
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

  const handleSave = async (field: keyof EditableField) => {
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
    } catch (error: any) {
      // Error is handled in the store
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-base-200">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-100 rounded-xl p-6 space-y-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
            <p className="mt-2 text-base-content/70">Manage your account information</p>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={authUser?.profilePic || "/plink.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-primary/20 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary hover:bg-primary-focus
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfilePicture ? "animate-pulse pointer-events-none" : ""}
                `}
                title="Change profile picture"
              >
                <Camera className="w-5 h-5 text-base-100" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfilePicture}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/60">
              {isUpdatingProfilePicture
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
            {uploadError && (
              <div className="p-2 bg-error/20 text-error rounded-lg text-sm">
                {uploadError}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* First Name */}
            <EditableInput
              label="First Name"
              field="firstName"
              icon={<User className="w-4 h-4" />}
              value={formData.firstName}
              authValue={authUser?.firstName || "Not set"}
              isEditing={isEditing.firstName}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />

            {/* Last Name */}
            <EditableInput
              label="Last Name"
              field="lastName"
              icon={<User className="w-4 h-4" />}
              value={formData.lastName}
              authValue={authUser?.lastName || "Not set"}
              isEditing={isEditing.lastName}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
            />

            {/* Email */}
            <EditableInput
              label="Email Address"
              field="email"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              authValue={authUser?.email}
              isEditing={isEditing.email}
              onChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onEdit={handleEdit}
              type="email"
            />

            {/* Password */}
            <PasswordSection
              isEditing={isEditing.password}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              formData={formData}
              onChange={handleInputChange}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
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

const EditableInput = ({
  label,
  field,
  icon,
  value,
  authValue,
  isEditing,
  onChange,
  onSave,
  onCancel,
  onEdit,
  type = "text",
}: any) => (
  <div className="space-y-1.5">
    <div className="text-sm text-base-content/70 flex items-center gap-2">
      {icon}
      {label}
    </div>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={() => onSave(field)}
            className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors"
            title="Save changes"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCancel(field)}
            className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20">
            {authValue || <span className="text-base-content/50">Not set</span>}
          </p>
          <button
            onClick={() => onEdit(field)}
            className="p-2 text-base-content/50 hover:text-primary hover:bg-base-300 rounded-lg transition-colors"
            title={`Edit ${label}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  </div>
);

const PasswordSection = ({
  isEditing,
  onEdit,
  onCancel,
  onSave,
  formData,
  onChange,
  showPassword,
  togglePasswordVisibility,
}: any) => (
  <div className="space-y-1.5">
    <div className="text-sm text-base-content/70 flex items-center gap-2">
      <Lock className="w-4 h-4" />
      Password
    </div>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <div className="flex-1 space-y-3">
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              placeholder="Current password"
              value={formData.currentPassword}
              onChange={(e) => onChange("currentPassword", e.target.value)}
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              placeholder="New password (min. 6 characters)"
              value={formData.newPassword}
              onChange={(e) => onChange("newPassword", e.target.value)}
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => onChange("confirmPassword", e.target.value)}
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onSave("password")}
              className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors"
              title="Save new password"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCancel("password")}
              className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20">
            ••••••••
          </p>
          <button
            onClick={() => onEdit("password")}
            className="p-2 text-base-content/50 hover:text-primary hover:bg-base-300 rounded-lg transition-colors"
            title="Change password"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  </div>
);

export default ProfilePage;