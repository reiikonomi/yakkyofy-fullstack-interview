<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../utils/api'
import '../styles/Screenshot.css'

const img = ref('')

setInterval(async () => {
  try {
    const screenshotId = JSON.parse(localStorage.getItem('screenshot')!).id

    if (screenshotId) {
      const response = await api('get', `/api/v1/screenshots/get/${screenshotId}`)

      console.log(response.data.status)
    }
  } catch (error) {
    console.error(error)
  }
}, 5000)

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

    console.log(response.status)

    if (response.status === 201) {
      inputValue.value = ''
      localStorage.setItem('screenshot', JSON.stringify(response.data))
      alert('Screenshot created successfully')
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="screenshot">
    <input placeholder="Url" class="input" type="text" v-model="inputValue" />
    <button class="button" @click="handleClick">Click me</button>
  </div>
</template>
