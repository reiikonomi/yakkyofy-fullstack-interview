const backendUrl = import.meta.env.VITE_BACKEND_URL

export const api: any = async (method: string, url: string, data?: any) => {
  try {
    const queryParams = method === 'GET' && data ? `?${encodeParams(data)}` : ''

    const response = await fetch(`${backendUrl}${url}${queryParams}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    throw new Error(error.message)
  }
}

const encodeParams = (params: any) => {
  const encodedParams = new URLSearchParams(params).toString()
  return encodedParams
}
