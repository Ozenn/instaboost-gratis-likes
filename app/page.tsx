import ClientPage from "./ClientPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact - InstaBoost.nl",
  description: "Neem contact op met InstaBoost.nl voor social media interacties",
}

export default function ContactPage() {
  return <ClientPage />
}
