import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json()
    
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`
    const response = await axios.post(url, {
      q: text,
      target: targetLanguage,
      format: 'text'
    }, {
      timeout: 10000, // 10 second timeout
      retry: 3,
      retryDelay: 1000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    if (!response.data?.data?.translations?.[0]) {
      throw new Error('Invalid translation response')
    }

    let translatedText = response.data.data.translations[0].translatedText
    translatedText = translatedText
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')

    return NextResponse.json({
      translatedText
    })
  } catch (error) {
    console.error('Translation error:', error)
    if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Translation service timeout - please try again' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
