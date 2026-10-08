# Visión Clara

Aplicación web educativa hecha con HTML, CSS y JavaScript. Contiene actividades orientativas de visión y una sección que consulta registros de una API externa.

> **Importante:** las actividades no diagnostican problemas visuales. Los registros de la API son datos publicados por un servicio y no indican la condición de quien visita la página.

## Archivos

- `index.html`: contenido y estructura de la página.
- `styles.css`: colores, diseño adaptable a celular/computadora y estilos de impresión.
- `app.js`: pruebas visuales, solicitud a la API, filtros y resultados.

Los comentarios dentro de los archivos explican las partes principales del código.

## Cómo ejecutar el proyecto

1. Guarda `index.html`, `styles.css` y `app.js` en la misma carpeta.
2. Abre esa carpeta en Visual Studio Code.
3. Abre `index.html` en un navegador. Para trabajar cómodamente, puedes instalar la extensión **Live Server**, hacer clic derecho en `index.html` y elegir **Open with Live Server**.
4. Conecta el dispositivo a internet. La sección de oftalmología consulta automáticamente la API al abrir la página.
5. Cuando veas **“Conectado”**, busca, filtra u ordena los registros. Usa **Actualizar registros** para volver a consultar.

No hace falta instalar paquetes ni configurar una base de datos.

## Qué hace la API

La página consulta esta dirección usando una petición de lectura (HTTP GET):

`https://proyecto-final-programacion-creativa-production.up.railway.app/api/oftalmologia`

La respuesta incluye una temática, una cantidad y una lista de registros. La página muestra la temática, el total, la edad, la agudeza visual y el diagnóstico tal como lo informa el servicio. Permite buscar y filtrar, ordenar los casos y mostrar más resultados.

La respuesta también contiene nombres, pero la interfaz no los muestra. Los diagnósticos se etiquetan como **reportados**: la página no puede comprobar si son datos de ejemplo ni confirmar diagnósticos médicos. Estos registros no se mezclan con las pruebas visuales personales.

## Si no carga

- Revisa que haya conexión a internet y pulsa **Reintentar carga** o **Actualizar registros**.
- La solicitud se cancela si tarda más de 12 segundos.
- Si aparece un error CORS, el servidor de la API debe autorizar el sitio desde el que se publica la página. CORS se configura en el servidor de la API, no en este HTML.
- Si falla una actualización después de cargar datos correctamente, la página conserva los últimos resultados mientras permanezca abierta.

## Privacidad y salud

Las respuestas de las pruebas y el nombre opcional no se guardan ni se envían. Para mostrar los casos publicados, el navegador sí consulta la API externa. Usa la herramienta solo con fines educativos y consulta a un optometrista u oftalmólogo para una evaluación.
