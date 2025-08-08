import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function FormField({ id, label, type = 'text', value, onChange, placeholder, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  )
}

interface FileUploadProps {
  id: string
  label: string
  accept: string
  onChange: (file: File | null) => void
  currentImage?: string | null
}

export function FileUpload({ id, label, accept, onChange, currentImage }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="flex items-center space-x-4">
        {currentImage && (
          <div className="flex-shrink-0">
            <img
              src={currentImage}
              alt="Current profile"
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
        )}
        <Input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="flex-1"
        />
      </div>
    </div>
  )
}

interface FormActionsProps {
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
  hasChanges: boolean
}

export function FormActions({ onSave, onCancel, isLoading, hasChanges }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={onSave}
        disabled={isLoading || !hasChanges}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
