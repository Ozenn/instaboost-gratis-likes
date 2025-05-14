"use client"

import ContactForm from "@/components/contact-form"
import { useState } from "react"

export default function ClientPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex-grow">
        <ContactFormWithHeader />
      </div>
    </main>
  )
}

// We maken een nieuwe component die de header beheert op basis van de formulierstatus
function ContactFormWithHeader() {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  return (
    <>
      {!isFormSubmitted && (
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-600 mb-3">Contact InstaBoost</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Vul het formulier in en ontvang direct je gratis Instagram likes!
          </p>
        </div>
      )}
      <ContactForm onFormSubmit={() => setIsFormSubmitted(true)} />
    </>
  )
}
