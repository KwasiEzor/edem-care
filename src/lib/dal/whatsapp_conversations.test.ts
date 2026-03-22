import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWhatsAppConversations, getConversationById } from './whatsapp_conversations'
import { createAdminClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('react', () => ({
  experimental_taintObjectReference: vi.fn(),
}))

describe('WhatsApp Conversations Data Access Layer', () => {
  const mockSupabase = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    order: vi.fn(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
    mockSupabase.from.mockReturnValue(mockSupabase)
    mockSupabase.select.mockReturnValue(mockSupabase)
    mockSupabase.eq.mockReturnValue(mockSupabase)
    mockSupabase.order.mockReturnValue(mockSupabase)
    ;(createAdminClient as any).mockReturnValue(mockSupabase)
  })

  it('should get all conversations', async () => {
    const mockConversations = [{ id: '1', phone_number: '+123456' }]
    mockSupabase.order.mockResolvedValueOnce({ data: mockConversations, error: null })

    const { data, error } = await getWhatsAppConversations()

    expect(data).toEqual(mockConversations)
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_conversations')
  })

  it('should get a conversation by id', async () => {
    const mockConversation = { id: '1', phone_number: '+123456' }
    mockSupabase.single.mockResolvedValueOnce({ data: mockConversation, error: null })

    const { data, error } = await getConversationById('1')

    expect(data).toEqual(mockConversation)
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('whatsapp_conversations')
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })
})
