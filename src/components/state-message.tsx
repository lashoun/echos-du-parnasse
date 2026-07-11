interface StateMessageProps {
  title: string
  description?: string
}

export default function StateMessage({
  title,
  description,
}: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-lg font-medium text-stone-600 dark:text-stone-400">
        {title}
      </p>
      {description && (
        <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
          {description}
        </p>
      )}
    </div>
  )
}
