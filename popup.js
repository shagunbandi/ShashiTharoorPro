document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKeyInput').value;
    if (apiKey) {
        chrome.storage.sync.set({ openAIKey: apiKey }, () => {
            showTooltip('API Key saved successfully!');
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
        setTimeout(() => {
            window.close();
        }, 2000);
    }, 1000);
} 