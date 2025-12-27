import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Gemini API
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{ content: { parts: [{ text: 'Mocked response' }] } }]
    })
  }),
]
