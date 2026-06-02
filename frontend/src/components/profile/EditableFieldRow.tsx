import { Edit2, Save, X } from "lucide-react";

export type EditableFieldRowProps<TField extends string> = {
  label: string;
  field: TField;
  icon: React.ReactNode;
  value: string;
  displayValue?: string;
  isEditing: boolean;
  type?: React.HTMLInputTypeAttribute;
  onChange: (field: TField, value: string) => void;
  onSave: (field: TField) => Promise<void>;
  onCancel: (field: TField) => void;
  onEdit: (field: TField) => void;
};

export default function EditableFieldRow<TField extends string>({
  label,
  field,
  icon,
  value,
  displayValue,
  isEditing,
  onChange,
  onSave,
  onCancel,
  onEdit,
  type = "text",
}: EditableFieldRowProps<TField>) {
  return (
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
              type="button"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCancel(field)}
              className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors"
              title="Cancel"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <p className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-base-content/20">
              {displayValue ?? <span className="text-base-content/50">Not set</span>}
            </p>
            <button
              onClick={() => onEdit(field)}
              className="p-2 text-base-content/50 hover:text-primary hover:bg-base-300 rounded-lg transition-colors"
              title={`Edit ${label}`}
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

