import { Edit2, Eye, EyeOff, Lock, Save, X } from "lucide-react";

export type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ShowPasswordState = {
  current: boolean;
  new: boolean;
  confirm: boolean;
};

type Props = {
  isEditing: boolean;
  formData: PasswordFormData;
  showPassword: ShowPasswordState;
  onChange: (field: keyof PasswordFormData, value: string) => void;
  onToggleVisibility: (field: keyof ShowPasswordState) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
};

export default function PasswordFieldRow({
  isEditing,
  formData,
  showPassword,
  onChange,
  onToggleVisibility,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="space-y-1.5">
      <div className="text-sm text-base-content/70 flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Password
      </div>
      <div className="flex items-start gap-2">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                onClick={() => onToggleVisibility("current")}
              >
                {showPassword.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                onClick={() => onToggleVisibility("new")}
              >
                {showPassword.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                onClick={() => onToggleVisibility("confirm")}
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onSave}
                className="p-2 text-success hover:bg-success/20 rounded-lg transition-colors"
                title="Save new password"
                type="button"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
                title="Cancel"
                type="button"
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
              onClick={onEdit}
              className="p-2 text-base-content/50 hover:text-primary hover:bg-base-300 rounded-lg transition-colors"
              title="Change password"
              type="button"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

