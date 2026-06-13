"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"

type Provider = "groq" | "openrouter" | "gemini"

const STORAGE_PREFIX = "placementos:apiKey"

async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId + ":placementos-key-v1"),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("placementos-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

async function encrypt(plaintext: string, userId: string): Promise<string> {
  const key = await deriveKey(userId)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  )
  const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...combined))
}

async function decrypt(ciphertext: string, userId: string): Promise<string> {
  const key = await deriveKey(userId)
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)
  return new TextDecoder().decode(decrypted)
}

export function useApiKey() {
  const [loaded, setLoaded] = useState(false)
  const [provider, setProviderState] = useState<Provider | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}:provider`) as Provider | null
    if (stored) setProviderState(stored)
    setLoaded(true)
  }, [])

  const getKey = useCallback(async (): Promise<{ key: string; provider: Provider } | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const prov = localStorage.getItem(`${STORAGE_PREFIX}:provider`) as Provider | null
    if (!prov) return null

    const encrypted = localStorage.getItem(`${STORAGE_PREFIX}:${prov}`)
    if (!encrypted) return null

    try {
      const key = await decrypt(encrypted, user.id)
      return { key, provider: prov }
    } catch {
      localStorage.removeItem(`${STORAGE_PREFIX}:${prov}`)
      localStorage.removeItem(`${STORAGE_PREFIX}:provider`)
      return null
    }
  }, [])

  const saveKey = useCallback(async (key: string, prov: Provider): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    try {
      const encrypted = await encrypt(key, user.id)
      localStorage.setItem(`${STORAGE_PREFIX}:${prov}`, encrypted)
      localStorage.setItem(`${STORAGE_PREFIX}:provider`, prov)
      setProviderState(prov)
      return true
    } catch {
      return false
    }
  }, [])

  const removeKey = useCallback(() => {
    const prov = localStorage.getItem(`${STORAGE_PREFIX}:provider`)
    if (prov) localStorage.removeItem(`${STORAGE_PREFIX}:${prov}`)
    localStorage.removeItem(`${STORAGE_PREFIX}:provider`)
    setProviderState(null)
  }, [])

  const clearAll = useCallback(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
    setProviderState(null)
  }, [])

  return { loaded, provider, getKey, saveKey, removeKey, clearAll }
}
