if [ -f ai-text-improver-extension.zip ]; then
    echo "Deleting existing .zip file..."
    rm ai-text-improver-extension.zip
fi
echo "Running npm build..."
npm run build
echo "Creating new .zip file..."
zip -r ai-text-improver-extension.zip . --exclude=.git/\*