async function startStreaming() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) {
    alert('Please enter a message!');
    return;
  }

  document.getElementById('output').innerText = 'Loading...';
  console.log(userInput);
  const response = await fetch(`http://127.0.0.1:8000/code-vision/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userInput }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  document.getElementById('output').innerText = ''; // Clear previous response

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    fullText += text;
    document.getElementById('output').innerText = fullText; // Display live streaming
  }
}
