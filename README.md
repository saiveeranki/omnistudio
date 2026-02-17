# OmniStudio Multimodal - Streamlit Edition

![OmniStudio Logo](./logo.svg)

A professional-grade multimodal interface built to bridge local compute power (**Ollama**) with cloud-scale creative engines (**Google Gemini & Veo**). This application replicates the Streamlit "Look & Feel" while providing a powerful GUI for text, image, and video generation.

---

## 🎨 Branding
The **OmniStudio** logo represents the fusion of three core modalities (Text, Image, Video) within a unified "Creative Box" (Hexagon). It utilizes the **Streamlit Red (#FF4B4B)** to signify speed and creativity.

---

## 🚀 Requirements

1.  **Hardware**:
    *   **Text/Logic (Local)**: Minimum 8GB RAM (16GB+ recommended for Llama 3).
    *   **Visual/Motion (Cloud)**: Requires an internet connection and a Gemini API Key.
2.  **Software**:
    *   [Ollama](https://ollama.com/) (For local LLM support).
    *   A modern web browser (Chrome, Edge, or Brave recommended).
    *   A static file server (Node.js, Python, or similar).

---

## 🦙 Ollama Setup & Configuration

### 1. Install Ollama
Download and install the client for your OS from [ollama.com/download](https://ollama.com/download).

### 2. Configure CORS (Critical Step)
By default, Ollama blocks requests from browsers. You **must** allow the application to communicate with it by setting the `OLLAMA_ORIGINS` environment variable.

#### **Windows (PowerShell)**
```powershell
$env:OLLAMA_ORIGINS="http://localhost:*"
ollama serve
```

#### **macOS & Linux (Terminal)**
```bash
OLLAMA_ORIGINS="http://localhost:*" ollama serve
```

---

## 🛠️ Installation & Execution

### **Linux / macOS / Windows**
1. **Clone/Save** this repository to your machine.
2. **Start Ollama** with the CORS settings mentioned above.
3. **Run a local server**:
   * If you have Node.js: `npx serve .`
   * If you have Python: `python -m http.server 8000`
4. **Access the UI**: Open `http://localhost:3000` (or `8000`) in your browser.

---

## 🖥️ Operating System Specifics

### **Windows**
- **Persistence**: To make `OLLAMA_ORIGINS` permanent, add it as a System Environment Variable via the Control Panel.

### **macOS**
- **Terminal Launch**: Ensure you quit the Ollama menu bar app before running the `OLLAMA_ORIGINS` command in Terminal.

### **Linux**
- **Systemd Service**: Edit your service file to include the environment variable for persistence across reboots:
  ```bash
  sudo systemctl edit ollama.service
  # Add: Environment="OLLAMA_ORIGINS=http://localhost:*"
  ```

---

## 🔒 Connection Debugging
*   Check if Ollama is responsive: `http://localhost:11434/`
*   Ensure your browser isn't blocking local requests (some strict privacy extensions might).
*   For cloud tasks, ensure your `process.env.API_KEY` is correctly injected by the platform.

---
*OmniStudio - Build 4.5.12-R | Streamlit Core Integration*
