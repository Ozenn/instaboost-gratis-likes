import { ToastProvider, ToastViewport } from "@/components/ui/toast"

const Toaster = () => {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

const toast = ({ title, description, variant }: ToastProps) => {
  // This is a placeholder. In a real implementation, you would use a library like `react-hot-toast` or `sonner` to display the toast.
  console.log(`Toast: ${title} - ${description} - ${variant}`)
}

export { Toaster, toast }
