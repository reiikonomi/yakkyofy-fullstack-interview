<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../utils/api'
import '../styles/Screenshot.css'

const img = ref('')
const status = ref('')

onMounted(async () => {
  try {
    const screenshotId = JSON.parse(localStorage.getItem('screenshot')!).id

    if (screenshotId) {
      const response = await api('get', `/api/v1/screenshots/get/${screenshotId}`)

      status.value = response.status

      if (response.status === 'done') {
        img.value = bufferToBase64(response.file.data)
        localStorage.removeItem('screenshot')
      }

      if (response.status !== 'done') {
        setInterval(async () => {
          const response = await api('get', `/api/v1/screenshots/get/${screenshotId}`)

          if (response.status === 'done') {
            img.value = bufferToBase64(response.file.data)
            localStorage.removeItem('screenshot')
          }
        }, 5000)
      }
    }
  } catch (error) {
    console.error(error)
  }
})

const inputValue = ref('')
const handleClick = async () => {
  if (!inputValue.value || !inputValue.value.match(/^https?:\/\/.+/)) {
    alert('Please enter a valid url')
    return
  }
  try {
    const response = await api('post', '/api/v1/screenshots/create', {
      url: inputValue.value
    })

    if (response.status === 201) {
      inputValue.value = ''
      status.value = 'queued'
      localStorage.setItem('screenshot', JSON.stringify(response.data))
      alert('Screenshot created successfully')
      window.location.reload()
    }
  } catch (error) {
    console.error(error)
  }
}

const bufferToBase64 = (buffer: Buffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:image/jpeg;base64,' + window.btoa(binary)
}
</script>

<template>
  <div class="screenshot">
    <h1>Screenshot</h1>
    <div v-if="status === 'done'">
      <img :src="img" alt="Screenshot" />
    </div>
    <div>
      <div>
        <p>Waiting for the screenshot to be ready. Status {{ status }}</p>
      </div>
    </div>
    <input placeholder="Url" class="input" type="text" v-model="inputValue" />
    <button class="button" @click="handleClick">Click me</button>
  </div>
</template>
