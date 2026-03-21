import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifyPatient, type NotificationContext } from './patient-notifications'
import { getSettings } from '@/lib/settings'

// Mock dependencies
vi.mock('@/lib/settings', () => ({
  getSettings: vi.fn(),
}))

// Mock dynamic imports
const mockSendEmail = vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
vi.mock('resend', () => ({
  Resend: function() {
    return {
      emails: {
        send: mockSendEmail,
      },
    }
  },
}))

const mockSendWhatsApp = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/whatsapp/client', () => ({
  sendWhatsAppMessage: mockSendWhatsApp,
}))

describe('Patient Notifications Dispatcher', () => {
  const mockBooking = {
    id: 'b1',
    patient_name: 'Jane Doe',
    patient_email: 'jane@example.com',
    patient_phone: '0470123456',
    care_type: 'soins_generaux' as any,
    date: '2026-03-25',
    time_slot_start: '10:00:00',
    time_slot_end: '11:00:00',
  }

  const context: NotificationContext = {
    event: 'booking_confirmed',
    booking: mockBooking as any,
    adminNotes: 'Please be ready.',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 're_test_key'
  })

  it('should send email but not WhatsApp when only email is enabled', async () => {
    ;(getSettings as any).mockResolvedValue({
      patient_notify_email: true,
      patient_notify_whatsapp: false,
    })

    await notifyPatient(context)

    expect(mockSendEmail).toHaveBeenCalled()
    expect(mockSendWhatsApp).not.toHaveBeenCalled()
    
    const emailArgs = mockSendEmail.mock.calls[0][0]
    expect(emailArgs.to).toBe('jane@example.com')
    expect(emailArgs.subject).toContain('confirmé')
    expect(emailArgs.html).toContain('Jane Doe')
    expect(emailArgs.html).toContain('Please be ready.')
  })

  it('should send WhatsApp but not email when only WhatsApp is enabled', async () => {
    ;(getSettings as any).mockResolvedValue({
      patient_notify_email: false,
      patient_notify_whatsapp: true,
    })

    await notifyPatient(context)

    expect(mockSendEmail).not.toHaveBeenCalled()
    expect(mockSendWhatsApp).toHaveBeenCalled()
    
    const waArgs = mockSendWhatsApp.mock.calls[0][0]
    expect(waArgs.to).toBe('32470123456') // Normalized 0470... -> 32470...
    expect(waArgs.text).toContain('Jane Doe')
    expect(waArgs.text).toContain('confirmé')
  })

  it('should send both when both are enabled', async () => {
    ;(getSettings as any).mockResolvedValue({
      patient_notify_email: true,
      patient_notify_whatsapp: true,
    })

    await notifyPatient(context)

    expect(mockSendEmail).toHaveBeenCalled()
    expect(mockSendWhatsApp).toHaveBeenCalled()
  })

  it('should handle "modified" event with previous details', async () => {
    ;(getSettings as any).mockResolvedValue({
      patient_notify_email: true,
      patient_notify_whatsapp: false,
    })

    const modContext: NotificationContext = {
      event: 'booking_modified',
      booking: mockBooking as any,
      previousDate: '2026-03-24',
      previousTimeStart: '09:00:00',
      previousTimeEnd: '10:00:00',
    }

    await notifyPatient(modContext)

    expect(mockSendEmail).toHaveBeenCalled()
    const emailArgs = mockSendEmail.mock.calls[0][0]
    expect(emailArgs.subject).toContain('Modification')
    expect(emailArgs.html).toContain('24 mars 2026') // date-fns formatted
    expect(emailArgs.html).toContain('25 mars 2026')
  })

  it('should not throw if a channel fails', async () => {
    ;(getSettings as any).mockResolvedValue({
      patient_notify_email: true,
      patient_notify_whatsapp: true,
    })

    mockSendEmail.mockRejectedValueOnce(new Error('Resend failed'))
    mockSendWhatsApp.mockResolvedValueOnce(undefined)

    // Should not throw
    await expect(notifyPatient(context)).resolves.not.toThrow()
    
    expect(mockSendWhatsApp).toHaveBeenCalled()
  })
})
