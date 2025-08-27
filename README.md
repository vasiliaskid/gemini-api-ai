# Gemini Flash API Example

This project demonstrates how to use the Google Gemini Flash API with Node.js and Express to perform various generative AI tasks, including text generation, image analysis, document processing, and audio transcription.

## Endpoints

- `POST /generate-text`: Generate text from a given prompt.
- `POST /generate-from-image`: Generate text from an image and a prompt.
- `POST /generate-from-document`: Generate text from a document and a prompt.
- `POST /generate-from-audio`: Transcribe audio and generate text from a prompt.

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd gemini-flash-api
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your Gemini API key and model name:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    GEMINI_MODEL_NAME=gemini-1.5-flash-latest
    ```

4.  **Run the application**:
    ```bash
    node index.js
    ```

    The server will start on `http://localhost:3000`.

## Usage (with `curl` examples for `bash`)

### Generate Text

```bash
curl -X POST http://localhost:3000/generate-text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short poem about the ocean."}'
```

### Generate from Image

```bash
curl -X POST http://localhost:3000/generate-from-image \
  -H "Content-Type: multipart/form-data" \
  -F "prompt=Describe what is in this image." \
  -F "image=@/path/to/your/image.jpg"
```

### Generate from Document

```bash
curl -X POST http://localhost:3000/generate-from-document \
  -H "Content-Type: multipart/form-data" \
  -F "prompt=Summarize this document." \
  -F "document=@/path/to/your/document.pdf"
```

### Generate from Audio

```bash
curl -X POST http://localhost:3000/generate-from-audio \
  -H "Content-Type: multipart/form-data" \
  -F "prompt=Transkripsikan audio ini." \
  -F "audio=@/path/to/your/audio.mp3"
```

## Usage (with PowerShell examples for Windows)

### Generate from Audio

```powershell
$filePath = "E:\path\to\your\audio.mp3"
$uri = "http://localhost:3000/generate-from-audio"
$form = @{
    prompt = "Transkripsikan audio ini."
    audio = Get-Item $filePath
}

Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data" -Form $form
```