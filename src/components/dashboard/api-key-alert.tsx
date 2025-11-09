'use client'

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function checkForApiKeys() {
  const storedKeys = localStorage.getItem('persona-api-keys')
  if (!storedKeys) return false
  
  try {
    const keys = JSON.parse(storedKeys)
    return Array.isArray(keys) && keys.length > 0
  } catch {
    return false
  }
}

export function ApiKeyAlert() {
  const [hasApiKeys, setHasApiKeys] = useState(true) // Start with true to prevent flash

  useEffect(() => {
    setHasApiKeys(checkForApiKeys())

    // Listen for storage changes
    const handleStorageChange = () => {
      setHasApiKeys(checkForApiKeys())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (hasApiKeys) return null

  return (
    <Alert className="border-0 p-0 bg-transparent">
      <AlertDescription className="p-0">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 shadow-lg">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-indigo-100/20" />
          
          <div className="relative p-4">
            {/* Main Content - Horizontal Layout */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-1">
                  Add Your API Keys
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  Configure your AI provider API keys to start using all features
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Get your keys from:</span>
                  <a 
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
                  >
                    Anthropic <ArrowRight className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
                  >
                    OpenAI <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0">
                <Link href="/settings">
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Configure Keys
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
} 