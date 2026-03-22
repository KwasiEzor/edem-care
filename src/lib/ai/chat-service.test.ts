import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAIResponse, AI_PROVIDERS } from './chat-service'

vi.mock('@/lib/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({
    chatbot_model: 'claude-3-5-sonnet-latest',
    chatbot_system_prompt: null,
    chatbot_provider: 'anthropic',
    chatbot_enabled: true
  })
}))

vi.mock('@/lib/env', () => ({
  env: {
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    OPENAI_API_KEY: 'test-openai-key',
    GEMINI_API_KEY: 'test-gemini-key'
  }
}))

describe('AI Chat Service', () => {
  const mockMessages = [{ role: 'user' as const, content: 'J’ai besoin d’une prise de sang' }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should identify a booking intent with Anthropic', async () => {
    vi.spyOn(AI_PROVIDERS, 'anthropic').mockResolvedValue('Bien sûr. [BOOKING_INTENT:prise_de_sang]')

    const result = await generateAIResponse(mockMessages)

    expect(result.bookingIntent).toBe(true)
    expect(result.suggestedCareType).toBe('prise_de_sang')
    expect(result.provider).toBe('anthropic')
  })

  it('should fallback to OpenAI if Anthropic fails', async () => {
    vi.spyOn(AI_PROVIDERS, 'anthropic').mockRejectedValue(new Error('Anthropic Down'))
    vi.spyOn(AI_PROVIDERS, 'openai').mockResolvedValue('Réponse de OpenAI [BOOKING_INTENT:injections]')

    const result = await generateAIResponse(mockMessages)

    expect(result.provider).toBe('openai')
    expect(result.suggestedCareType).toBe('injections')
  })

  it('should fallback to Google if Anthropic and OpenAI fail', async () => {
    vi.spyOn(AI_PROVIDERS, 'anthropic').mockRejectedValue(new Error('Anthropic Down'))
    vi.spyOn(AI_PROVIDERS, 'openai').mockRejectedValue(new Error('OpenAI Down'))
    vi.spyOn(AI_PROVIDERS, 'google').mockResolvedValue('Réponse de Gemini [BOOKING_INTENT:pansements]')

    const result = await generateAIResponse(mockMessages)

    expect(result.provider).toBe('google')
    expect(result.suggestedCareType).toBe('pansements')
  })

  it('should identify an emergency triage', async () => {
    vi.spyOn(AI_PROVIDERS, 'anthropic').mockResolvedValue('Appelez le 112 ! [EMERGENCY_TRIAGE_112]')

    const result = await generateAIResponse([{ role: 'user', content: 'Douleur poitrine' }])

    expect(result.isEmergency).toBe(true)
    expect(result.displayMessage).toContain('Appelez le 112')
  })
})
