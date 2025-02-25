async function startStreaming() {
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) {
    alert('Please enter a message!');
    return;
  }

  document.getElementById('explanation').innerText = 'Loading explanation...';
  document.getElementById('optimizedCode').innerText =
    'Loading optimized code...';
  document.getElementById('language').innerText = 'Detecting language...';

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
  let explanation = '';
  let optimizedCode = '';
  let detectedLanguage = '';
  let currentSection = 'explanation';
  let language = '';
  let indexoflanguage = 0;
  let isLanguageDetected = false;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    //console.log(text);
    fullText += text;

    // Split response into parts
    if (
      fullText.includes('<EXPLANATION_START>') &&
      !fullText.includes('<EXPLANATION_END>')
    ) {
      //currentSection = 'optimizedCode';
      if (text === '<EXPLANATION_START>') continue;
      explanation = explanation.concat(text);
    }
    if (fullText.includes('<DETECT_LANGUAGE_START>')) {
      currentSection = 'language';
      isLanguageDetected = true;
    }

    // Extract different parts
    const explanationPart =
      fullText
        .split('<EXPLANATION_START>')[1]
        ?.replace('### Explanation:', '')
        .trim() || '';
    const optimizedCodePart =
      fullText
        .split('### Optimized Code:')[1]
        ?.split('### detect language')[0]
        ?.trim() || '';

    // const languagePart = fullText.split('### detect language')[1]?.trim() || '';
    const languagePart = fullText.split('### detect language')[1]?.trim() || '';
    if (!optimizedCodePart && languagePart) {
      language = language.concat(text);
    }
    // console.log('langh', languagePart);

    // Update UI dynamically
    document.getElementById('explanation').innerText = fullText;
    document.getElementById('optimizedCode').innerText = '';
    document.getElementById('language').innerText = language;
  }
}
