# OmniStudio Multimodal - Streamlit Edition

A professional-grade multimodal interface built to bridge local compute power (**Ollama**) with cloud-scale creative engines (**Google Gemini & Veo**). This application replicates the Streamlit "Look & Feel" while providing a powerful GUI for text, image, and video generation.

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
By default, Ollama blocks requests from browsers for security. You **must** allow the application to communicate with it by setting the `OLLAMA_ORIGINS` environment variable.

#### **Windows (PowerShell)**
```powershell
$env:OLLAMA_ORIGINS="http://localhost:*"
ollama serve
```

#### **macOS & Linux (Terminal)**
```bash
OLLAMA_ORIGINS="http://localhost:*" ollama serve
```

### 3. Download Models
To use specific models in the OmniStudio interface, you must "pull" them via your terminal first:
```bash
ollama pull llama3
ollama pull mistral
ollama pull bakllava
```

---

## 🛠️ How to Start the Application

### **Method A: Using Node.js (Recommended)**
1. Open your project folder in a terminal.
2. Run: `npx serve .`
3. Open `http://localhost:3000` in your browser.

### **Method B: Using Python**
1. Open your project folder in a terminal.
2. Run: `python -m http.server 8000`
3. Open `http://localhost:8000` in your browser.

---

## 🖥️ Operating System Specifics

### **Windows**
- **Ports**: Ollama uses port `11434`. If you have a firewall, ensure this port is open for local traffic.
- **Persistence**: To make `OLLAMA_ORIGINS` permanent:
  1. Search for "Edit the system environment variables".
  2. Click "Environment Variables".
  3. Add a New User Variable: Name: `OLLAMA_ORIGINS`, Value: `http://localhost:*`.

### **macOS**
- **Service**: If Ollama is running in the menu bar, quit it first. Then run it from the Terminal with the environment variable as shown in the "Ollama Setup" section to ensure the settings take effect.

### **Linux**
- **Systemd**: If you installed Ollama via the official script, you may need to edit the service file:
  ```bash
  sudo systemctl edit ollama.service
  ```
  Add these lines:
  ```ini
  [Service]
  Environment="OLLAMA_ORIGINS=http://localhost:*"
  ```
  Then reload and restart:
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl restart ollama
  ```

---

## 🎮 Using the Interface

1.  **Sidebar**: Use the **Model Provider** toggle to switch between **Local (Ollama)** and **Cloud (Gemini)**.
2.  **Model Selection**: 
    *   When on **Local**, the "Base Model Engine" dropdown corresponds to the models you have `pull`ed in your terminal (e.g., `llama3`). 
    *   *Note: If you want to use a model not in the list, you can modify the `App.tsx` options or simply pull it locally and the API will find it if the names match.*
3.  **Tabs**: 
    *   **Text Logic**: Works with both Local and Cloud.
    *   **Image/Video**: Optimized for Cloud (Gemini/Veo) as local video/image generation requires significant GPU resources not typically handled by standard Ollama distributions.

---

## 🔒 Port Information

| Service | Port | Protocol | Description |
| :--- | :--- | :--- | :--- |
| **Ollama** | `11434` | HTTP | The local API endpoint for LLM inference. |
| **Web App** | `3000/8000` | HTTP | The frontend UI you interact with in the browser. |

*If you cannot connect to Ollama, check `http://localhost:11434` in your browser. You should see "Ollama is running".*
