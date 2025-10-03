import { useState } from 'react'
import { Button } from './ui/button'
import { debugAuth, isAuthenticated } from '../utils/authDebug'
import { testAuthenticatedRequest, testClockInRequest } from '../utils/testAuth'

export function AuthDebugPanel() {
  const [debugResult, setDebugResult] = useState<any>(null)

  const runDebug = () => {
    const result = debugAuth()
    setDebugResult(result)
  }

  const testAuth = () => {
    const authenticated = isAuthenticated()
    console.log('Is Authenticated:', authenticated)
    alert(`Authentication Status: ${authenticated ? 'Valid' : 'Invalid/Expired'}`)
  }

  const clearAuth = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    alert('Authentication data cleared')
    setDebugResult(null)
  }

  const testAPI = async () => {
    const result = await testAuthenticatedRequest()
    console.log('API Test Result:', result)
    alert(`API Test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.error || 'Connection OK'}`)
  }

  const testClockIn = async () => {
    const result = await testClockInRequest()
    console.log('Clock-in Test Result:', result)
    alert(`Clock-in Test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.error || 'Clock-in OK'}`)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-4">🔧 Auth Debug Panel</h3>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={runDebug} variant="outline" size="sm">
          Debug Auth
        </Button>
        <Button onClick={testAuth} variant="outline" size="sm">
          Test Token
        </Button>
        <Button onClick={testAPI} variant="outline" size="sm">
          Test API
        </Button>
        <Button onClick={testClockIn} variant="outline" size="sm">
          Test Clock-in
        </Button>
        <Button onClick={clearAuth} variant="destructive" size="sm">
          Clear Auth
        </Button>
      </div>

      {debugResult && (
        <div className="bg-gray-100 p-3 rounded text-xs">
          <pre>{JSON.stringify(debugResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}