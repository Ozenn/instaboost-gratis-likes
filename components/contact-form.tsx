"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Heart, Send, Plus, Trash2, AlertCircle, CheckCircle, Loader2, ExternalLink, Instagram, ThumbsUp, Check } from "lucide-react"
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

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([{ id: "1", url: "", likes: "1000" }])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [totalLikes, setTotalLikes] = useState(1000)
  const [error, setError] = useState("")
  const formRef = useRef<HTMLFormElement>(null)
  const [firstSubmit, setFirstSubmit] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Functie om te controleren of een URL een geldige Instagram post URL is
  const isValidInstagramUrl = (url: string) => {
    // Basis validatie voor Instagram post URL's - accepteert ook URL's met query parameters
    return url.trim() === "" || /instagram\.com\/p\/[\w-]+\/?.*/.test(url)
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

          // Controleer of het nieuwe totaal niet boven 2500 uitkomt
          if (otherPostsTotal + numValue > 2500) {
            setError(
              `Het totaal aantal likes kan niet meer dan 2.500 zijn. Je hebt nog ${2500 - otherPostsTotal} likes beschikbaar.`,
            )
            // Bereken het maximum aantal likes dat nog toegevoegd kan worden
            const maxAvailable = 2500 - otherPostsTotal
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
    if (totalLikes >= 2500) {
      setError("Je hebt het maximum van 2.500 likes bereikt. Je kunt geen nieuwe posts meer toevoegen.")
      return
    }

    const newId = (instagramPosts.length + 1).toString()

    // Bereken hoeveel likes er nog beschikbaar zijn
    const remainingLikes = 2500 - totalLikes
    const defaultLikes = remainingLikes > 500 ? "500" : remainingLikes.toString()

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
    setInstagramPosts([{ id: "1", url: "", likes: "1000" }])
    setTotalLikes(1000)
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
      // Format de output voor de e-mail - compacter en duidelijker
      const outputLines = instagramPosts.map((post) => `7160 | ${post.url} | ${post.likes}`).join("\n")

      // Bereid de formulierdata voor
      const formElement = formRef.current
      if (!formElement) return

      // Verwijder eventuele bestaande verborgen velden om duplicaten te voorkomen
      const existingHiddenFields = formElement.querySelectorAll('input[type="hidden"][name^="formatted_"]')
      existingHiddenFields.forEach((field) => field.remove())

      // Voeg de geformatteerde output toe - dit is het belangrijkste deel
      const formattedOutputField = document.createElement("input")
      formattedOutputField.type = "hidden"
      formattedOutputField.name = "formatted_output"
      formattedOutputField.value = outputLines
      formElement.appendChild(formattedOutputField)

      // Voeg een duidelijke markering toe voor de geformatteerde output in de e-mail
      const formattedOutputLabelField = document.createElement("input")
      formattedOutputLabelField.type = "hidden"
      formattedOutputLabelField.name = "formatted_output_label"
      formattedOutputLabelField.value = "BESTELGEGEVENS:"
      formElement.appendChild(formattedOutputLabelField)

      // Voeg het totaal aantal likes toe - alleen deze informatie is echt nodig
      const totalLikesField = document.createElement("input")
      totalLikesField.type = "hidden"
      totalLikesField.name = "total_likes"
      totalLikesField.value = `Totaal aantal likes: ${totalLikes}`
      formElement.appendChild(totalLikesField)

      // Verzend het formulier direct naar FormSubmit zonder doorverwijzing
      // We gebruiken de traditionele methode maar voorkomen de pagina-navigatie
      const formAction = formElement.action
      const formData = new FormData(formElement)
      
      // Gebruik fetch om het formulier te verzenden zonder pagina-navigatie
      fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        mode: 'no-cors' // Belangrijk voor cross-origin requests
      })
      .then(() => {
        // Toon de succesmelding
        setIsSubmitting(false)
        setIsSuccess(true)
        setFirstSubmit(false)
        // Roep de callback aan om de header te verbergen
        if (onFormSubmit) onFormSubmit()
      })
      .catch((error) => {
        console.error("Error submitting form:", error)
        setError("Er is iets misgegaan bij het verzenden van het formulier. Probeer het later nog eens.")
        setIsSubmitting(false)
        toast({
          title: "Er is iets misgegaan",
          description: "Probeer het later nog eens of neem contact met ons op.",
          variant: "destructive",
        })
      })
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

  // State voor client-side rendering
  const [isClient, setIsClient] = useState(false)

  // Toon een bericht voor de eerste keer gebruik van FormSubmit
  useEffect(() => {
    // Markeer dat we nu client-side zijn
    setIsClient(true)
    
    toast({
      title: "Belangrijk voor eerste gebruik",
      description:
        "Bij het eerste gebruik van FormSubmit moet je een bevestigingsmail accepteren. Check je inbox en spam folder na de eerste verzending.",
    })
    
    // Controleer of er een foutmelding is in de URL (kan gebeuren bij FormSubmit)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const errorParam = urlParams.get('error')
      if (errorParam) {
        setError("Er is een fout opgetreden bij het verzenden van het formulier. Probeer het opnieuw.")
        toast({
          title: "Fout bij verzenden",
          description: "Er is een probleem opgetreden. Controleer je gegevens en probeer het opnieuw.",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Voorkom hydration mismatch door alleen client-side te renderen
  if (!isClient) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="p-4 sm:p-6 shadow-lg border-pink-200 bg-white w-full max-w-2xl">
          <div className="text-center py-8 px-4">
            <p>Laden...</p>
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <>
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="p-4 sm:p-6 shadow-lg border-pink-200 bg-white w-full max-w-2xl">
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
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  <span className="mr-2">Nieuwe bestelling</span>
                </Button>
                <Button
                  onClick={() => window.open("https://www.instaboost.nl/", "_blank")}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <span className="mr-2">Ga naar de website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
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
              {/* Geen doorverwijzing naar externe pagina, we gebruiken een modal */}
              <input type="hidden" name="_replyto" value={formData.email} />

              <div className="space-y-4">
                <div className="mx-auto max-w-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="name" className="text-pink-700 text-sm">
                        Naam
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jouw naam"
                        required
                        className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-pink-700 text-sm">
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
                        className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-pink-700 text-sm">
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
                      className="mt-1 border-pink-200 focus:border-pink-500 focus:ring-pink-500 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-pink-100">
                {/* Voorwaarden sectie */}
                <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">Voorwaarden gratis likes actie</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>Deze service is geheel kosteloos voor bestaande klanten</li>
                    <li>Je moet eerder een bestelling hebben geplaatst bij InstaBoost.nl</li>
                    <li>Er wordt geen garantie geboden op de gratis likes</li>
                    <li>De likes worden handmatig toegepast na controle, dit kan enige tijd duren</li>
                    <li>We behouden het recht om aanvragen te weigeren indien niet aan de voorwaarden wordt voldaan</li>
                    <li>Maximum van 2.500 likes per aanvraag, slechts één aanvraag per klant</li>
                    <li>De Instagram posts moeten openbaar toegankelijk zijn en voldoen aan de Instagram richtlijnen</li>
                    <li>Deze actie kan op elk moment worden beëindigd zonder voorafgaande kennisgeving</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div className="flex items-center">
                    <Heart className="text-pink-500 mr-2 flex-shrink-0 h-5 w-5" />
                    <h3 className="text-lg sm:text-xl font-bold text-pink-600"><Instagram className="mr-2 h-5 w-5 text-pink-500 inline" />Gratis Instagram Likes</h3>
                  </div>
                  <div className="bg-pink-100 px-3 py-2 rounded-md self-start sm:self-auto w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-pink-700 font-medium text-sm">Gebruikt:</span>
                      <span className="text-pink-800 font-bold text-sm">{totalLikes}/2500 likes</span>
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
                        <Label htmlFor={`instagram_url_${post.id}`} className="text-pink-700 text-xs sm:text-sm flex items-center gap-1">
                          <Instagram className="h-3 w-3 text-pink-500" />
                          Instagram URL
                        </Label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <div className="absolute left-2.5 z-10">
                              <Instagram className="h-4 w-4 text-pink-400" />
                            </div>
                            <Input
                              id={`instagram_url_${post.id}`}
                              name={`instagram_url_${post.id}`}
                              value={post.url}
                              onChange={(e) => handlePostChange(post.id, "url", e.target.value)}
                              placeholder="https://www.instagram.com/p/ABC123/"
                              required
                              className={`mt-1 text-sm border-pink-200 focus:border-pink-500 focus:ring-pink-500 pl-8 pr-8 truncate ${post.url && !isValidInstagramUrl(post.url) && post.url.trim() !== "" ? 'border-red-300 bg-red-50' : ''}`}
                            />
                            {post.url && isValidInstagramUrl(post.url) && post.url.trim() !== "" && (
                              <div className="absolute right-2.5 z-10">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                        {post.url && !isValidInstagramUrl(post.url) && post.url.trim() !== "" && (
                          <p className="text-xs text-red-500 mt-1 ml-1">Voer een geldige Instagram post URL in (bijv. https://www.instagram.com/p/ABC123/)</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`instagram_likes_${post.id}`} className="text-pink-700 text-xs sm:text-sm flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-pink-500" />
                          Aantal likes
                        </Label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <div className="absolute left-2.5 z-10">
                              <ThumbsUp className="h-4 w-4 text-pink-400" />
                            </div>
                            <Input
                              id={`instagram_likes_${post.id}`}
                              name={`instagram_likes_${post.id}`}
                              type="number"
                              min="1"
                              max="2500"
                              value={post.likes}
                              onChange={(e) => handlePostChange(post.id, "likes", e.target.value)}
                              placeholder="500"
                              required
                              className="mt-1 text-sm border-pink-200 focus:border-pink-500 focus:ring-pink-500 pl-8"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewPost}
                  disabled={totalLikes >= 2500}
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
