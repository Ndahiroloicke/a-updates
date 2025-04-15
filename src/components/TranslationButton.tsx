"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/contexts/TranslationContext"

const languages = [
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "sw", name: "Kiswahili" },
  { code: "am", name: "Amharic" },
]

export default function TranslationButton() {
  const { targetLanguage, setTargetLanguage } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {targetLanguage ? languages.find(l => l.code === targetLanguage)?.name : "Translate"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {targetLanguage && (
          <DropdownMenuItem onClick={() => setTargetLanguage(null)}>
            Original
          </DropdownMenuItem>
        )}
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setTargetLanguage(lang.code)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 