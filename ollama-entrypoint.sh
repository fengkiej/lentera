#!/bin/bash
set -e

# Start Ollama server in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
echo "Waiting for Ollama to start..."
until (echo > /dev/tcp/localhost/11434) >/dev/null 2>&1; do
  sleep 2
done

echo "Ollama is up and running. Checking and pulling required models..."

# Function to check if a model exists
model_exists() {
  ollama list | grep -q "$1"
  return $?
}

# Check and pull the required models for Lentera
LLM_MODEL="hf.co/second-state/gemma-3n-E2B-it-GGUF:Q5_K_S"
if model_exists "$LLM_MODEL"; then
  echo "LLM model already exists: $LLM_MODEL"
else
  echo "Pulling LLM model: $LLM_MODEL"
  ollama pull "$LLM_MODEL"
fi

EMBEDDING_MODEL="all-minilm:l12-v2"
if model_exists "$EMBEDDING_MODEL"; then
  echo "Embedding model already exists: $EMBEDDING_MODEL"
else
  echo "Pulling embedding model: $EMBEDDING_MODEL"
  ollama pull "$EMBEDDING_MODEL"
fi

echo "All required models are available!"

# Wait for the Ollama process
wait $OLLAMA_PID