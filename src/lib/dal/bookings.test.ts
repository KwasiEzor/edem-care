import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBookings, getBookingById } from './bookings'
import { createAdminClient } from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('react', () => ({
  experimental_taintObjectReference: vi.fn(),
}))

describe('Bookings Data Access Layer', () => {
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

  it('should get a booking by id and taint the object', async () => {
    const mockBooking = { id: '1', patient_name: 'John Doe', patient_notes: 'Sensitive info' }
    mockSupabase.single.mockResolvedValueOnce({ data: mockBooking, error: null })

    const { data, error } = await getBookingById('1')

    expect(data).toEqual(mockBooking)
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('bookings')
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1')
  })

  it('should return error if booking is not found', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const { data, error } = await getBookingById('99')

    expect(data).toBeNull()
    expect(error?.message).toBe('Not found')
  })

  it('should get all bookings with patient address', async () => {
    const mockBookings = [
      { id: '1', patient_name: 'John', patients: { address: '123 Main St' } },
    ]
    mockSupabase.order.mockResolvedValueOnce({ data: mockBookings, error: null })

    const { data, error } = await getBookings()

    expect(data).toEqual([
      { id: '1', patient_name: 'John', patients: { address: '123 Main St' }, patient_address: '123 Main St' }
    ])
    expect(error).toBeNull()
    expect(mockSupabase.from).toHaveBeenCalledWith('bookings')
    expect(mockSupabase.select).toHaveBeenCalledWith('*, patients(address)')
  })
})
