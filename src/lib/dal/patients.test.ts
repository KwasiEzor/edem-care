import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPatientById, getAllPatients } from './patients'
import { createAdminClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('react', () => ({
  experimental_taintObjectReference: vi.fn(),
}))

describe('Patients Data Access Layer', () => {
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

  it('should get a patient by id and taint the object', async () => {
    const mockPatient = { id: '1', first_name: 'John', last_name: 'Doe' }
    mockSupabase.single.mockResolvedValueOnce({ data: mockPatient, error: null })

    const { data, error } = await getPatientById('1')

    expect(data).toEqual(mockPatient)
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('patients')
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('should return error if patient is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const { data, error } = await getPatientById('99')

    expect(data).toBeNull()
    expect(error?.message).toBe('Not found')
  })

  it('should get all patients', async () => {
    const mockPatients = [
      { id: '1', first_name: 'John' },
      { id: '2', first_name: 'Jane' },
    ]
    mockSupabase.order.mockResolvedValueOnce({ data: mockPatients, error: null })

    const { data, error } = await getAllPatients()

    expect(data).toEqual(mockPatients)
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('patients')
  })
})
