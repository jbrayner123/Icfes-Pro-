# Despliegue en Render (Pro Icfes)

Para desplegar este simulador en Render de manera fácil y rápida, tienes dos opciones según tus necesidades de persistencia de datos (cuentas de usuarios y puntajes):

---

## Opción A: Despliegue Gratuito (Render Free Tier)
Render ofrece un plan gratuito que puedes usar para estudiar en grupo. Debido al diseño de sincronización híbrida de la aplicación, los datos son sumamente resilientes:

* **¿Cómo funciona?**: Los datos de cada estudiante se guardan localmente en el navegador (`localStorage`) y se sincronizan con el servidor en tiempo real.
* **Si el servidor se reinicia**: Aunque Render borre los archivos temporales del servidor en su plan gratuito, la próxima vez que un estudiante abra la página desde su navegador, **su progreso local se sincronizará automáticamente de vuelta al servidor**.
* **Limitación**: Si un estudiante nuevo intenta ingresar desde un dispositivo nuevo mientras el servidor se ha reiniciado, tendrá que registrarse nuevamente en esa sesión (ya que el servidor no tiene memoria persistente global compartida en el plan gratuito si nadie está conectado para sincronizarla).

### Pasos para desplegar gratis:
1. Crea un servicio web en Render conectando tu repositorio de GitHub.
2. Configura los siguientes parámetros en Render:
   * **Runtime / Environment**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
3. Agrega las siguientes variables de entorno (Environment Variables):
   * `NODE_ENV`: `production`
   * `PORT`: `3000`
   * `GEMINI_API_KEY`: *(Tu clave de Gemini)*
   * `DEEPSEEK_API_KEY`: *(Tu clave de DeepSeek)*

---

## Opción B: Despliegue con Disco Persistente (Recomendado para persistencia absoluta)
Si quieres que las cuentas de todos los estudiantes y sus notas se guarden permanentemente en el servidor en un archivo JSON físico sin perderse nunca (y sin requerir bases de datos complejas), puedes usar un **Disco Persistente** de Render.

* **¿Cómo funciona?**: Guardamos los datos en un disco virtual montado en `/data`. Render no toca estos datos al reiniciar o redesplegar.
* **Costo**: Requiere una instancia de pago de Render (Plan Starter para Web Service y el disco virtual, aproximadamente $7 USD/mes).

### Pasos para desplegar con Disco Persistente (Usando Blueprint):
1. Sube tu código a GitHub. Hemos incluido un archivo `render.yaml` en la raíz de tu proyecto.
2. En tu panel de Render, ve a **Blueprints** y haz clic en **New Blueprint Instance**.
3. Selecciona tu repositorio. Render leerá automáticamente el archivo `render.yaml` y configurará el disco, el comando de construcción, el de inicio y las variables de entorno.
4. Introduce tus claves de `GEMINI_API_KEY` y `DEEPSEEK_API_KEY` cuando Render te lo solicite durante la configuración.
5. Haz clic en **Deploy** y ¡listo!

---

## Comprobar el funcionamiento
Una vez finalizado el despliegue, abre la URL que te proporciona Render (ej. `https://pro-icfes.onrender.com`).
* Podrán registrarse múltiples estudiantes con su nombre de usuario único.
* En la consola de IA o al responder preguntas, verás cómo se sincroniza y se genera todo de forma cooperativa.
