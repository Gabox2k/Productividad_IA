const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testVideo() {
  const formData = new FormData();
  formData.append('videoUrl', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  try {
    const response = await fetch('http://localhost:5000/api/verificar', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testVideo();