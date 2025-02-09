document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKeyInput').value.trim();

    console.log('API Key entered:', apiKey); // Log input for debugging

    if (apiKey) {
        chrome.storage.local.set({ openAIKey: apiKey }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving API Key:', chrome.runtime.lastError.message);
                showTooltip('Failed to save API Key.');
            } else {
                console.log('API Key saved successfully!');
                showTooltip('API Key saved successfully!');
            }
        });
    } else {
        showTooltip('Please enter a valid API Key.');
    }
});

function showTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.position = 'fixed';
    tooltip.style.bottom = '20px';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = '#4CAF50';
    tooltip.style.color = 'white';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 2000);
} 