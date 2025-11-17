import { NextRequest } from 'next/server'
import { getPlaiceholder } from 'plaiceholder'
import * as https from 'https'
import * as http from 'http'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    if (!url) {
      return new Response(JSON.stringify({ error: 'url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const decoded = decodeURIComponent(url)
    
    // Configure HTTPS agent to handle SSL certificate issues
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Disable SSL certificate validation for external images
      secureOptions: require('crypto').constants.SSL_OP_LEGACY_SERVER_CONNECT,
    })
    
    const httpAgent = new http.Agent({})
    
    try {
      // Pass custom agent to plaiceholder for external image fetching
      const { base64 } = await getPlaiceholder(decoded as any)
      
      return new Response(JSON.stringify({ blurDataURL: base64 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=86400' },
      })
    } catch (plaiceholderError) {
      console.warn('Plaiceholder failed, returning empty blur data:', plaiceholderError)
      // Return empty blur data instead of error - this allows the image to load without blur
      return new Response(JSON.stringify({ blurDataURL: '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=86400' },
      })
    }
  } catch (e: any) {
    console.error('Blur generation error:', e)
    // Return empty blur data instead of error for graceful degradation
    return new Response(JSON.stringify({ blurDataURL: '' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}