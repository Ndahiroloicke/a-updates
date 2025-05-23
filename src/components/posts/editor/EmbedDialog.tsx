"use client"

import type React from "react"
import { useState } from "react"
import { Youtube, Twitter } from "lucide-react"

interface EmbedDialogProps {
  onEmbed: (type: "youtube" | "twitter", url: string) => void
  embedType: "youtube" | "twitter"
  buttonLabel: string
}

export const EmbedDialog: React.FC<EmbedDialogProps> = ({ onEmbed, embedType, buttonLabel }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    if (embedType === "youtube" && !url.match(/youtube\.com|youtu\.be/)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    if (embedType === "twitter" && !url.match(/twitter\.com|x\.com/)) {
      setError("Please enter a valid Twitter URL")
      return
    }

    onEmbed(embedType, url)
    setUrl("")
    setIsOpen(false)
    setError("")
  }

  return (
    <>
      <button
        data-embed-type={embedType}
        onClick={() => setIsOpen(true)}
        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2">
          {embedType === "youtube" ? (
            <Youtube size={16} className="text-red-500" />
          ) : (
            <Twitter size={16} className="text-blue-400" />
          )}
          {buttonLabel}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Embed {embedType === "youtube" ? "YouTube Video" : "Twitter Post"}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setError("")
                }}
                className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor={`${embedType}-url`} className="mb-2 block text-sm font-medium">
                  URL
                </label>
                <input
                  type="text"
                  id={`${embedType}-url`}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setError("")
                  }}
                  placeholder={
                    embedType === "youtube"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://twitter.com/username/status/..."
                  }
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setError("")
                  }}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
