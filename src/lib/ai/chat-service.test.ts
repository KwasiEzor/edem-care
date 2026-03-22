import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAIResponse } from './chat-service'
import Anthropic from '@anthropic-ai/sdk'

vi.mock('@anthropic-ai/sdk')
vi.mock('@/lib/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({
    chatbot_model: 'claude-3-5-sonnet-latest',
    chatbot_system_prompt: null
  })
}))
vi.mock('@/lib/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-key'
  }
}))

describe('AI Chat Service', () => {
  const mockMessages = [{ role: 'user' as const, content: 'J’ai besoin d’une prise de sang' }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should identify a booking intent', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Bien sûr, je peux vous aider. [BOOKING_INTENT:prise_de_sang]' }]
    }
    
    ;(Anthropic as any).prototype.messages = {
      create: vi.fn().mockResolvedValue(mockResponse)
    }

    const result = await generateAIResponse(mockMessages)

    expect(result.bookingIntent).toBe(true)
    expect(result.suggestedCareType).toBe('prise_de_sang')
    expect(result.displayMessage).toBe('Bien sûr, je peux vous aider.')
    expect(result.isEmergency).toBe(false)
    expect(result.provider).toBe('anthropic')
  })

  it('should identify an emergency triage', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Appelez immédiatement le 112 ! [EMERGENCY_TRIAGE_112]' }]
    }
    
    ;(Anthropic as any).prototype.messages = {
      create: vi.fn().mockResolvedValue(mockResponse)
    }

    const result = await generateAIResponse([{ role: 'user', content: 'J’ai une forte douleur à la poitrine' }])

    expect(result.isEmergency).toBe(true)
    expect(result.displayMessage).toBe('Appelez immédiatement le 112 !')
    expect(result.provider).toBe('anthropic')
  })

  it('should handle response without tags', async () => {
    const mockResponse = {
      content: [{ type: 'text', text: 'Bonjour, comment allez-vous ?' }]
    }
    
    ;(Anthropic as any).prototype.messages = {
      create: vi.fn().mockResolvedValue(mockResponse)
    }

    const result = await generateAIResponse(mockMessages)

    expect(result.bookingIntent).toBe(false)
    expect(result.isEmergency).toBe(false)
    expect(result.displayMessage).toBe('Bonjour, comment allez-vous ?')
    expect(result.provider).toBe('anthropic')
  })
})
