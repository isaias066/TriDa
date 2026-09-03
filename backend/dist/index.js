// ¿Qué? Punto de entrada de la aplicación Node.js.
// ¿Para qué? Arrancar el servidor web y escuchar en el puerto definido.
// ¿Impacto? Es el archivo que ejecuta pm2/docker/node en producción.
import app from './app.js';
import { config } from './config.js';
app.listen(config.PORT, () => {
    console.log(` Servidor TriDa corriendo en http://localhost:${config.PORT}`);
    console.log(` Entorno: ${config.NODE_ENV}`);
});
//# sourceMappingURL=index.js.map