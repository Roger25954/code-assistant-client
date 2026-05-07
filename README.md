# 🤖 Code Assistant — Cliente VS Code

Extensión de VS Code que conecta el editor con el servidor LSP de Code Assistant, un asistente de código con IA construido con LangGraph, Groq, Gemini y ChromaDB.

---

## ✨ Features

### Autocompletado inteligente — `Ctrl+K → Alt+C`
Sugerencias de código bajo demanda basadas en el contexto del archivo actual.

### Explicación de código — `Ctrl+K → Alt+E`
Selecciona cualquier fragmento y obtén una explicación clara en español.

### Fix de bugs — `Ctrl+K → Alt+F`
Selecciona el código con el error y el agente lo corrige automáticamente.

### Generación de tests — `Ctrl+K → Alt+T`
Genera tests completos con pytest para cualquier función o clase.

### Búsqueda web — `Ctrl+K → Alt+S`
Busca documentación y soluciones con Tavily. El resultado se sintetiza con Groq.

### Generación de código — `Ctrl+K → Alt+G`
Escribe una instrucción en lenguaje natural. El agente LangGraph decide qué tools usar:
- Consulta el codebase del proyecto (RAG) si la instrucción referencia algo existente
- Busca documentación externa si necesita info adicional
- Ejecuta el código en Docker para verificar
- Corrige automáticamente si hay errores

### RAG sobre codebase — `Ctrl+K → Alt+I`
Indexa todos los `.py` del workspace en ChromaDB. Los archivos también se indexan automáticamente al abrirlos o modificarlos.

### Limpiar memoria — `Ctrl+K → Alt+L`
Resetea el historial conversacional del archivo actual.

---

## ⌨️ Atajos de teclado

| Atajo | Acción |
|---|---|
| `Ctrl+K → Alt+C` | Autocompletar código |
| `Ctrl+K → Alt+E` | Explicar código seleccionado |
| `Ctrl+K → Alt+F` | Fix de bugs |
| `Ctrl+K → Alt+T` | Generar tests |
| `Ctrl+K → Alt+S` | Buscar documentación |
| `Ctrl+K → Alt+G` | Generar código |
| `Ctrl+K → Alt+L` | Limpiar memoria |
| `Ctrl+K → Alt+I` | Indexar workspace en RAG |

---

## 📋 Requisitos

Esta extensión requiere que el servidor LSP esté corriendo. Consulta el repositorio principal para la instalación completa:

- Python 3.11+ con el entorno `code-assistant` configurado
- Docker Desktop corriendo (ChromaDB + sandbox de ejecución)
- API Keys de Groq, Gemini y Tavily en el archivo `.env`

Repositorio del servidor: [Code-Assistant](https://github.com/Roger25954/Code-Assistant)

---

## ⚙️ Configuración

Antes de usar la extensión, actualiza las rutas en `src/extension.ts`:

```typescript
const serverOptions: ServerOptions = {
    command: 'RUTA_A_TU_PYTHON',
    // Windows Anaconda: C:\\Users\\TU_USUARIO\\anaconda3\\envs\\code-assistant\\python.exe
    // Mac/Linux:        /home/TU_USUARIO/anaconda3/envs/code-assistant/bin/python
    args: ['RUTA_COMPLETA_A/Code Assistant/server.py']
};
```

---

## 🚀 Instalación

```bash
cd code-assistant-client
npm install
npm run compile
npx vsce package
code --install-extension code-assistant-client-0.0.1.vsix
```

---

## 📝 Notas

- Docker Desktop debe estar corriendo antes de usar la extensión
- ChromaDB debe estar levantado: `docker run -d -p 8000:8000 --name chromadb chromadb/chroma`
- El entorno Anaconda `code-assistant` debe estar activo en el servidor

---

## 📄 Release Notes

### 0.0.1
Release inicial — autocompletado, explicación, fix, tests, búsqueda web, generación de código con agente LangGraph y RAG sobre codebase.