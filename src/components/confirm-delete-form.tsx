'use client'

export default function ConfirmDeleteForm({
  action,
  fieldName,
  fieldValue,
  confirmMessage,
  children,
}: {
  action: (formData: FormData) => void
  fieldName: string
  fieldValue: string
  confirmMessage: string
  children: React.ReactNode
}) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name={fieldName} value={fieldValue} />
      {children}
    </form>
  )
}
