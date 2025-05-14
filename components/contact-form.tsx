"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Heart, Send, Plus, Trash2, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast, Toaster } from "@/components/ui/toaster"

type InstagramPost = {
  id: string
  url: string
  likes: string
}

type ContactFormProps = {
  onFormSubmit?: () => void
}

export default function ContactForm({ onFormSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([{ id: "1", url: "", likes: "500" }])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [totalLikes, setTotalLikes] = useState(500)
  const [error, setError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [firstSubmit, setFirstSubmit] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePostChange = (id: string, field: "url" | "likes", value: string) => {
    const updatedPosts = instagramPosts.map((post) => {
      if (post.id === id) {
        // Als het een likes veld is, valideer de waarde
        if (field === "likes") {
          const numValue = Number.parseInt(value) || 0

          // Bereken het totaal zonder de huidige post
          const otherPostsTotal = instagramPosts
            .filter((p) => p.id !== id)
            .reduce((sum, p) => sum + (Number.parseInt(p.likes) || 0), 0)

          // Controleer of het nieuwe totaal niet boven 1000 uitkomt
          if (otherPostsTotal + numValue > 1000) {
            setError(
              `Het totaal aantal likes kan niet meer dan 1.000 zijn. Je hebt nog ${1000 - otherPostsTotal} likes beschikbaar.`,
            )
            // Bereken het maximum aantal likes dat nog toegevoegd kan worden
            const maxAvailable = 1000 - otherPostsTotal
            return { ...post, [field]: maxAvailable > 0 ? maxAvailable.toString() : "0" }
          } else {
            setError("")
          }
        }

        return { ...post, [field]: value }
      }
      return post
    })

    setInstagramPosts(updatedPosts)

    // Update het totaal aantal likes
    const newTotal = updatedPosts.reduce((sum, post) => sum + (Number.parseInt(post.likes) || 0), 0)
    setTotalLikes(newTotal)
  }

  const addNewPost = () => {
    // Controleer of er nog ruimte is voor meer likes
    if (totalLikes >= 1000) {
      setError("Je hebt het maximum van 1.000 likes bereikt. Je kunt geen nieuwe posts meer toevoegen.")
      return
    }

    const newId = (instagramPosts.length + 1).toString()

    // Bereken hoeveel likes er nog beschikbaar zijn
    const remainingLikes = 1000 - totalLikes
    const defaultLikes = remainingLikes > 100 ? "100" : remainingLikes.toString()

    setInstagramPosts([...instagramPosts, { id: newId, url: "", likes: defaultLikes }])

    // Update het totaal aantal likes
    setTotalLikes((prev) => prev + Number.parseInt(defaultLikes))
  }

  const removePost = (id: string) => {
    // Voorkom verwijderen als er maar één post is
    if (instagramPosts.length <= 1) {
      return
    }

    const postToRemove = instagramPosts.find((post) => post.id === id)
    const updatedPosts = instagramPosts.filter((post) => post.id !== id)

    setInstagramPosts(updatedPosts)

    // Update het totaal aantal likes
    if (postToRemove) {
      setTotalLikes((prev) => prev - (Number.parseInt(postToRemove.likes) || 0))
    }

    setError("")
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
    })
    setInstagramPosts([{ id: "1", url: "", likes: "500" }])
    setTotalLikes(500)
    setIsSuccess(false)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Valideer of alle velden zijn ingevuld
    const emptyPosts = instagramPosts.some((post) => !post.url)
    if (emptyPosts) {
      setError("Vul alle Instagram post URL's in")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Format de output voor de e-mail
      const outputLines = instagramPosts.map((post) => `7160 | ${post.url} | ${post.likes}`).join("\n")

      // Bereid de formulierdata voor
      const formElement = formRef.current
      if (!formElement) return

      // Verwijder eventuele bestaande verborgen velden om duplicaten te voorkomen
      const existingHiddenFields = formElement.querySelectorAll('input[type="hidden"][name^="formatted_"]')
      existingHiddenFields.forEach((field) => field.remove())

      // Voeg de geformatteerde output toe
      const formattedOutputField = document.createElement("input")
      formattedOutputField.type = "hidden"
      formattedOutputField.name = "formatted_output"
      formattedOutputField.value = outputLines
      formElement.appendChild(formattedOutputField)

      // Voeg een duidelijke markering toe voor de geformatteerde output in de e-mail
      const formattedOutputLabelField = document.createElement("input")
      formattedOutputLabelField.type = "hidden"
      formattedOutputLabelField.name = "formatted_output_label"
      formattedOutputLabelField.value = "KOPIEER ONDERSTAANDE TEKST VOOR BULK BESTELLING:"
      formElement.appendChild(formattedOutputLabelField)

      // Voeg een extra veld toe om de output duidelijk te scheiden in de e-mail
      const formattedOutputSeparatorField = document.createElement("input")
      formattedOutputSeparatorField.type = "hidden"
      formattedOutputSeparatorField.name = "formatted_output_separator"
      formattedOutputSeparatorField.value = "----------------------------------------"
      formElement.appendChild(formattedOutputSeparatorField)

      // Voeg het totaal aantal likes toe
      const totalLikesField = document.createElement("input")
      totalLikesField.type = "hidden"
      totalLikesField.name = "total_likes"
      totalLikesField.value = totalLikes.toString()
      formElement.appendChild(totalLikesField)

      // Voeg alle Instagram posts toe als JSON
      const postsField = document.createElement("input")
      postsField.type = "hidden"
      postsField.name = "instagram_posts_json"
      postsField.value = JSON.stringify(instagramPosts)
      formElement.appendChild(postsField)

      // Verzend het formulier echt naar FormSubmit
      formElement.submit()

      // Toon de succesmelding na een korte vertraging
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
        setFirstSubmit(false)
        // Roep de callback aan om de header te verbergen
        if (onFormSubmit) onFormSubmit()
      }, 1500)
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Er is iets misgegaan bij het verzenden van het formulier. Probeer het later nog eens.")
      setIsSubmitting(false)
      toast({
        title: "Er is iets misgegaan",
        description: "Probeer het later nog eens of neem contact met ons op.",
        variant: "destructive",
      })
    }
  }

  // Toon een bericht voor de eerste keer gebruik van FormSubmit
  useEffect(() => {
    toast({
      title: "Belangrijk voor eerste gebruik",
      description:
        "Bij het eerste gebruik van FormSubmit moet je een bevestigingsmail accepteren. Check je inbox en spam folder na de eerste verzending.",
    })
  }, [])

  return (
    <>
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="p-4 sm:p-6 shadow-lg border-pink-200 bg-white w-full max-w-3xl">
          {isSuccess ? (
            <div className="text-center py-8 px-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bedankt voor je aanvraag!</h2>
              <p className="text-gray-600 mb-6">
                We hebben je bestelling ontvangen en gaan ermee aan de slag. Je ontvangt binnenkort een bevestiging.
              </p>
              {firstSubmit && (
                <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
                  <AlertDescription className="text-sm">
                    <strong>Belangrijk:</strong> Omdat dit de eerste keer is dat je FormSubmit gebruikt, moet je een
                    bevestigingsmail accepteren. Check je inbox en spam folder voor een e-mail van FormSubmit en klik op
                    de bevestigingslink om toekomstige e-mails te ontvangen.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={() => (window.location.href = "https://www.instaboost.nl/")}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <span className="mr-2">Ga naar de website</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6"
              action="https://formsubmit.co/info@instaboost.nl"
              method="POST"
            >
              {/* FormSubmit.co configuratie */}
              <input type="hidden" name="_subject" value="Nieuwe gratis bestelling via contactformulier" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_honey" value="" />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-pink-700">
                    Naam
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jouw naam"
                    required
                    className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-pink-700">
                    E-mailadres
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jouw@email.nl"
                    required
                    className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-pink-700">
                    Telefoonnummer
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06 12345678"
                    required
                    className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-pink-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div className="flex items-center">
                    <Heart className="text-pink-500 mr-2 flex-shrink-0 h-5 w-5" />
                    <h3 className="text-lg sm:text-xl font-bold text-pink-600">Gratis bestelling</h3>
                  </div>
                  <div className="bg-pink-100 px-3 py-2 rounded-md self-start sm:self-auto w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-pink-700 font-medium text-sm">Gebruikt:</span>
                      <span className="text-pink-800 font-bold text-sm">{totalLikes}/1000 likes</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {instagramPosts.map((post, index) => (
                  <div key={post.id} className="mb-4 p-3 sm:p-4 border border-pink-100 rounded-md bg-pink-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-pink-700 text-sm">Post #{index + 1}</h4>
                      {instagramPosts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePost(post.id)}
                          className="h-7 w-7 p-0 text-pink-700 hover:text-red-600 hover:bg-pink-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Verwijder post</span>
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`instagram_url_${post.id}`} className="text-pink-700 text-xs sm:text-sm">
                          Instagram URL
                        </Label>
                        <Input
                          id={`instagram_url_${post.id}`}
                          name={`instagram_url_${post.id}`}
                          value={post.url}
                          onChange={(e) => handlePostChange(post.id, "url", e.target.value)}
                          placeholder="https://www.instagram.com/p/..."
                          required
                          className="mt-1 text-sm border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`instagram_likes_${post.id}`} className="text-pink-700 text-xs sm:text-sm">
                          Aantal likes
                        </Label>
                        <Input
                          id={`instagram_likes_${post.id}`}
                          name={`instagram_likes_${post.id}`}
                          type="number"
                          min="1"
                          max="1000"
                          value={post.likes}
                          onChange={(e) => handlePostChange(post.id, "likes", e.target.value)}
                          placeholder="100"
                          required
                          className="mt-1 text-sm border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewPost}
                  disabled={totalLikes >= 1000}
                  className="mt-2 border-pink-300 text-pink-600 hover:bg-pink-50 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Voeg post toe</span>
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || totalLikes === 0}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-md transition-all text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bezig met verzenden...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Send className="mr-2 h-4 w-4" />
                    Verstuur aanvraag
                  </span>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
      <Toaster />
    </>
  )
}
