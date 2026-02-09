# Cómo compartir tu proyecto (Port Forwarding)

El error `spawn e:\Antigravity\bin\code-tunnel.exe ENOENT` indica un problema con la herramienta de túnel integrada.

Para compartir tu proyecto con amigos, te recomiendo usar **SSH** con **Serveo** (no requiere instalación) o **Localtunnel**.

## Opción 1: SSH + Serveo (Recomendada)

1.  Abre una nueva terminal en VS Code (`Ctrl + Shift + ñ`).
2.  Ejecuta el siguiente comando:

    ```bash
    ssh -R 80:localhost:3000 serveo.net
    ```

3.  Verás una URL como `https://un-nombre.serveo.net`. Copia y envía esa URL a tus amigos.

## Opción 2: Localtunnel (Requiere instalación)

Si la opción anterior falla, puedes usar Localtunnel:

1.  Ejecuta:
    ```bash
    npx localtunnel --port 3000
    ```
2.  Sigue las instrucciones en pantalla.
