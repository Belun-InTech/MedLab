/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_URL?: string;
  readonly VITE_OLLAMA_TEXT_MODEL?: string;
  readonly VITE_OLLAMA_VISION_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
