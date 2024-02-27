function getTextBetweenWords(inputText, startWord, endWord) {
    // Create a regular expression pattern that matches text between startWord and endWord
    const pattern = new RegExp(`${startWord}(.*?)(?=${endWord})`, 'g');
    
    // Use the pattern to find all matches in the inputText
    const matches = inputText.match(pattern);
  
    // Initialize an array to store the extracted text
    const extractedText = [];
  
    if (matches) {
      // Loop through the matches and extract the text between startWord and endWord
      for (const match of matches) {
        const text = match.replace(startWord, '').trim();
        extractedText.push(text);
      }
    }
  
    return extractedText;
  }

  function normalizeTextList(text) { 
    let entries = text.split(","); 
    let trimmedEntries = entries.map(entry => entry.trim()); 
    let result = trimmedEntries.join(","); 
    return result;
  }

  //export methods
  module.exports = { getTextBetweenWords, normalizeTextList};