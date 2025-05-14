"use client"

import ContactForm from "@/components/contact-form"
import { useState, useEffect } from "react"

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
  const [isClient, setIsClient] = useState(false)
  
  // Effect om client-side rendering te garanderen
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Toon een eenvoudige laadstatus tijdens server-side rendering
  if (!isClient) {
    return (
      <div className="text-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-600 mb-3">Contact InstaBoost</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Formulier wordt geladen...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isFormSubmitted && (
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-600 mb-3">Gratis Instagram Likes</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Vul het formulier in en ontvang tot 2.500 gratis Instagram likes!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Exclusief voor bestaande klanten van InstaBoost.nl
          </p>
        </div>
      )}
      <ContactForm onFormSubmit={() => setIsFormSubmitted(true)} />
    </>
  )
}
