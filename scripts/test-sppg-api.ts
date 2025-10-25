/**
 * Test SPPG API endpoint dengan real fetch call
 */

async function testSppgApi() {
  console.log('🧪 Testing SPPG API endpoint...\n')
  
  try {
    console.log('📡 Calling: http://localhost:3000/api/admin/sppg')
    
    const response = await fetch('http://localhost:3000/api/admin/sppg', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: This won't have auth session since it's not from browser
      credentials: 'include'
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()))
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('\n✅ Success!')
      console.log('Data structure:', {
        success: data.success,
        dataKeys: Object.keys(data.data || {}),
        sppgCount: data.data?.data?.length || 0,
        pagination: data.data?.pagination
      })
    } else {
      console.log('\n❌ Error Response!')
      console.log('Error:', data)
    }
    
  } catch (error) {
    console.error('\n💥 Fetch Error:', error)
  }
}

testSppgApi()
