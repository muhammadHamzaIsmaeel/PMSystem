/**
 * Two-Factor Authentication Page
 * Allows users to set up or manage 2FA
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [setupStep, setSetupStep] = useState(1) // 1: Setup, 2: Verify, 3: Complete
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Check if 2FA is already enabled for the user
    check2FAStatus()
  }, [user])

  const check2FAStatus = async () => {
    try {
      // For now, we'll just set the state based on a mock API call
      // In a real implementation, you'd have an API endpoint to check 2FA status
      // const response = await apiClient.get('/auth/2fa/status')
      // setIs2FAEnabled(response.enabled)
      setLoading(false)
    } catch (error) {
      console.error('Error checking 2FA status:', error)
      setLoading(false)
    }
  }

  const start2FASetup = async () => {
    try {
      // Mock implementation - in a real app, this would generate a secret and QR code
      // const response = await apiClient.get('/auth/2fa/setup')
      // setQrCode(response.qr_code)
      // setSecret(response.secret)

      // For demo purposes, we'll simulate a secret and QR code
      setSecret('ABC123XYZ789')
      setSetupStep(2) // Move to verification step
      setMessage('Please enter the 6-digit code from your authenticator app.')
      setMessageType('success')
    } catch (error: any) {
      console.error('Error starting 2FA setup:', error)
      setMessage(error.message || 'Failed to start 2FA setup')
      setMessageType('error')
    }
  }

  const verify2FASetup = async () => {
    if (verificationCode.length !== 6) {
      setMessage('Please enter a 6-digit code')
      setMessageType('error')
      return
    }

    try {
      // Mock verification - in a real app, this would verify the code with the backend
      // await apiClient.post('/auth/2fa/verify', {
      //   token: verificationCode,
      //   secret: secret
      // })

      // Enable 2FA for the user (mock)
      // await apiClient.post('/auth/2fa/enable', { secret: secret })

      // For demo purposes, we'll assume the code is valid
      setIs2FAEnabled(true)
      setSetupStep(3) // Move to completion step
      setMessage('Two-factor authentication enabled successfully!')
      setMessageType('success')
    } catch (error: any) {
      console.error('Error verifying 2FA:', error)
      setMessage(error.message || 'Failed to verify 2FA code')
      setMessageType('error')
    }
  }

  const toggle2FA = async () => {
    if (is2FAEnabled) {
      // Disable 2FA
      try {
        // await apiClient.post('/auth/2fa/disable')
        setIs2FAEnabled(false)
        setMessage('Two-factor authentication disabled')
        setMessageType('success')
      } catch (error: any) {
        console.error('Error disabling 2FA:', error)
        setMessage(error.message || 'Failed to disable 2FA')
        setMessageType('error')
      }
    } else {
      // Start setup process
      start2FASetup()
    }
  }

  const resetSetup = () => {
    setSetupStep(1)
    setVerificationCode('')
    setMessage('')
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">Add an extra layer of security to your account</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-gray-600">Secure your account with an additional verification step</p>
            </div>
            <div className="flex items-center">
              <span className={`mr-3 font-medium ${is2FAEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={toggle2FA}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  is2FAEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    is2FAEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {is2FAEnabled ? (
            <div className="mt-4">
              <p className="text-gray-700">Two-factor authentication is currently enabled on your account.</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    // In a real app, this would regenerate backup codes
                    alert('Backup codes would be regenerated here')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Regenerate Backup Codes
                </button>
              </div>
            </div>
          ) : setupStep > 1 ? (
            <div className="mt-4">
              {setupStep === 2 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verify with Authenticator App</h3>
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2">1. Download an authenticator app (like Google Authenticator or Authy)</p>
                    <p className="text-gray-700 mb-4">2. Scan the QR code below or enter the secret key manually:</p>

                    {/* QR Code */}
                    <div className="flex flex-col items-center mb-4">
                      {qrCode ? (
                        <div className="mb-4">
                          <img
                            src={qrCode}
                            alt="2FA QR Code"
                            className="w-48 h-48 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center mb-4">
                          <span className="text-gray-500">Loading QR Code...</span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Secret Key:</p>
                        <p className="font-mono bg-gray-100 px-3 py-2 rounded break-all">{secret}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter 6-digit code from your app
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={verify2FASetup}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Verify
                      </button>
                      <button
                        onClick={resetSetup}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {setupStep === 3 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Setup Complete!</h3>
                  <p className="text-gray-700 mb-4">Two-factor authentication is now enabled on your account.</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Important: Backup Codes</h4>
                    <p className="text-yellow-700 text-sm mb-2">Store these backup codes in a secure location. You can use them if you lose access to your authenticator app:</p>
                    <div className="font-mono text-sm grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded border">ABCD-1234</div>
                      <div className="bg-white p-2 rounded border">EFGH-5678</div>
                      <div className="bg-white p-2 rounded border">IJKL-9012</div>
                      <div className="bg-white p-2 rounded border">MNOP-3456</div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/settings')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Settings
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How Two-Factor Authentication Works</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
                <li>Add an extra layer of security to your account</li>
                <li>Requires a code from your phone in addition to your password</li>
                <li>Works with apps like Google Authenticator or Authy</li>
              </ul>
              <button
                onClick={start2FASetup}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}