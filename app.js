"use strict";

const scale = document.querySelector("#scale");
const scaleValue = document.querySelector("#scale-value");
const ruler = document.querySelector("#ruler");
const acuityTest = document.querySelector("#acuity-test");
const acuityStatus = document.querySelector("#acuity-status");
const optotype = document.querySelector("#optotype");
const acuityResults = document.querySelector("#acuity-results");
const summaryCard = document.querySelector("#summary-card");
const summary = document.querySelector("#summary");
// URL del servicio que entrega los registros de oftalmología.
const apiEndpoint = "https://proyecto-final-programacion-creativa-production.up.railway.app/api/oftalmologia";
// Elementos del HTML que muestran y controlan la sección de la API.
const apiLoadButton = document.querySelector("#load-api");
const apiSearch = document.querySelector("#api-search");
const apiDiagnosisFilter = document.querySelector("#api-diagnosis-filter");
const apiSort = document.querySelector("#api-sort");
const apiTheme = document.querySelector("#api-theme");
const apiTotal = document.querySelector("#api-total");
const apiFetchInfo = document.querySelector("#api-fetch-info");
const apiStatus = document.querySelector("#api-status");
const apiResults = document.querySelector("#api-results");
const apiLoadMore = document.querySelector("#api-load-more");
const acuityDenominators = [200, 100, 70, 50, 40, 30, 25, 20];
const directions = ["up", "right", "down", "left"];
const arrowNames = { up: "arriba", right: "derecha", down: "abajo", left: "izquierda" };
const eyes = { right: "derecho", left: "izquierdo" };
const eyeResults = {};
let acuityRun = null;
let colorRun = null;
let apiRecords = [];
let apiDeclaredCount = null;
let apiTopic = "";
// Al inicio se muestran 12 tarjetas; el botón permite mostrar más.
let apiVisibleLimit = 12;

function updateScale() {
  const factor = Number(scale.value);
  ruler.style.width = `${189 * factor}px`;
  scaleValue.value = `${Math.round(factor * 100)}%`;
  scaleValue.textContent = scaleValue.value;
}

function renderE(direction, denominator) {
  const factor = Number(scale.value);
  const heightMm = 400 * Math.tan((5 / 60) * Math.PI / 180) * denominator / 20;
  const heightPx = Math.max(2, heightMm * (189 / 50) * factor);
  const strokePx = heightPx / 5;
  const widthPx = heightPx;
  optotype.replaceChildren();
  optotype.setAttribute("viewBox", `0 0 ${widthPx} ${heightPx}`);
  optotype.setAttribute("width", `${widthPx}`);
  optotype.setAttribute("height", `${heightPx}`);

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("fill", "#111");
  group.setAttribute("transform", `rotate(${{ right: 0, down: 90, left: 180, up: 270 }[direction]} ${widthPx / 2} ${heightPx / 2})`);
  const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shape.setAttribute("d", `M 0 0 H ${widthPx} V ${strokePx} H ${strokePx} V ${heightPx / 2 - strokePx / 2} H ${widthPx * .8} V ${heightPx / 2 + strokePx / 2} H ${strokePx} V ${heightPx - strokePx} H ${widthPx} V ${heightPx} H 0 Z`);
  group.append(shape);
  optotype.append(group);
  optotype.setAttribute("aria-label", `Letra E apuntando hacia ${arrowNames[direction]}`);
}

function startAcuity(eye) {
  acuityRun = { eye, row: 0, asked: 0, correct: 0, passed: -1, direction: "" };
  acuityResults.textContent = "";
  acuityTest.hidden = false;
  nextOptotype();
}

function nextOptotype() {
  const run = acuityRun;
  if (!run) return;
  if (run.row >= acuityDenominators.length) {
    finishAcuity();
    return;
  }
  run.direction = directions[Math.floor(Math.random() * directions.length)];
  renderE(run.direction, acuityDenominators[run.row]);
  acuityStatus.textContent = `Ojo ${eyes[run.eye]} · línea 20/${acuityDenominators[run.row]} · intento ${run.asked + 1} de 5`;
}

function answerAcuity(answer) {
  if (!acuityRun) return;
  const run = acuityRun;
  run.asked++;
  if (answer === run.direction) run.correct++;
  if (run.asked < 5) {
    nextOptotype();
    return;
  }
  if (run.correct >= 4) {
    run.passed = run.row;
    run.row++;
    run.asked = 0;
    run.correct = 0;
    nextOptotype();
    return;
  }
  finishAcuity();
}

function finishAcuity() {
  const run = acuityRun;
  acuityRun = null;
  acuityTest.hidden = true;
  const denominator = run.passed < 0 ? null : acuityDenominators[run.passed];
  eyeResults[run.eye] = denominator;
  const finding = denominator
    ? `Ojo ${eyes[run.eye]}: identificó al menos 4 de 5 símbolos en la línea 20/${denominator}.`
    : `Ojo ${eyes[run.eye]}: no identificó al menos 4 de 5 símbolos en la línea más grande de esta prueba.`;
  acuityResults.textContent = `${finding} Es un resultado de tamizaje, no un diagnóstico.`;
  updateSummary();
}

const digitPatterns = {
  "2": ["11111", "00001", "00001", "11111", "10000", "10000", "11111"],
  "3": ["11111", "00001", "00001", "11111", "00001", "00001", "11111"],
  "5": ["11111", "10000", "10000", "11111", "00001", "00001", "11111"],
  "6": ["11111", "10000", "10000", "11111", "10001", "10001", "11111"],
  "8": ["11111", "10001", "10001", "11111", "10001", "10001", "11111"],
  "9": ["11111", "10001", "10001", "11111", "00001", "00001", "11111"]
};
const colorDigits = ["2", "3", "5", "6", "8", "9"];
const plateColors = [
  ["#728c42", "#b66850"], ["#6e8e52", "#b96560"],
  ["#7c8745", "#b96c4a"], ["#708652", "#b65d55"],
  ["#758d49", "#bc7052"], ["#6b8550", "#b96959"],
  ["#7a8b4b", "#b65f4c"], ["#718748", "#bd6d5b"]
];
const plateCanvas = document.querySelector("#plate");
const context = plateCanvas.getContext("2d");
const colorTest = document.querySelector("#color-test");
const colorStatus = document.querySelector("#color-status");
const colorChoices = document.querySelector("#color-choices");
const colorProgress = document.querySelector("#color-progress");
const progressBar = document.querySelector(".progress");
const colorResults = document.querySelector("#color-results");
const colorTotal = plateColors.length;

function drawPlate(digit, colors) {
  const size = plateCanvas.width;
  context.clearRect(0, 0, size, size);
  context.fillStyle = "#f4f2eb";
  context.fillRect(0, 0, size, size);
  const target = new Set();
  digitPatterns[digit].forEach((line, row) => [...line].forEach((on, col) => {
    if (on === "1") target.add(`${col},${row}`);
  }));
  const points = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const x = 25 + col * 17 + (Math.random() - .5) * 7;
      const y = 25 + row * 17 + (Math.random() - .5) * 7;
      if (Math.hypot(x - size / 2, y - size / 2) > size / 2 - 13) continue;
      const gridCol = Math.floor((x - 43) / 35);
      const gridRow = Math.floor((y - 72) / 18);
      const isTarget = gridCol >= 0 && gridCol < 5 && gridRow >= 0 && gridRow < 7 && target.has(`${gridCol},${gridRow}`);
      points.push({ x, y, isTarget, radius: 3 + Math.random() * 2.6 });
    }
  }
  points.forEach(point => {
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fillStyle = point.isTarget ? colors[1] : colors[0];
    context.fill();
  });
}

function startColorTest() {
  colorRun = { index: 0, correct: 0, digit: "" };
  colorResults.textContent = "";
  updateSummary();
  colorTest.hidden = false;
  nextColorPlate();
}

function nextColorPlate() {
  if (!colorRun || colorRun.index >= colorTotal) {
    finishColorTest();
    return;
  }
  colorRun.digit = colorDigits[Math.floor(Math.random() * colorDigits.length)];
  drawPlate(colorRun.digit, plateColors[colorRun.index]);
  colorStatus.textContent = `Lámina ${colorRun.index + 1} de ${colorTotal}`;
  const percentage = (colorRun.index / colorTotal) * 100;
  colorProgress.style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", `${colorRun.index}`);
  colorChoices.replaceChildren();
  [...colorDigits, "No veo"].forEach(value => {
    const button = document.createElement("button");
    button.className = "button button-secondary";
    button.textContent = value;
    button.addEventListener("click", () => {
      if (!colorRun) return;
      if (value === colorRun.digit) colorRun.correct++;
      colorRun.index++;
      nextColorPlate();
    });
    colorChoices.append(button);
  });
}

function finishColorTest() {
  const score = colorRun.correct;
  colorRun = null;
  colorTest.hidden = true;
  colorProgress.style.width = "100%";
  progressBar.setAttribute("aria-valuenow", `${colorTotal}`);
  const result = score === colorTotal
    ? `Reconoció ${score} de ${colorTotal} láminas generadas en esta actividad. Esto no descarta una alteración de la visión cromática.`
    : `Reconoció ${score} de ${colorTotal} láminas generadas en esta actividad. Puede haber dificultad para distinguir algunos colores; se recomienda evaluación profesional para confirmarlo.`;
  colorResults.textContent = `${result} La prueba no permite identificar el tipo ni la causa.`;
  updateSummary();
}

function addSummaryRow(label, value) {
  const paragraph = document.createElement("p");
  const heading = document.createElement("strong");
  heading.textContent = `${label}: `;
  paragraph.append(heading, document.createTextNode(value));
  summary.append(paragraph);
}

function updateSummary() {
  const name = document.querySelector("#person").value.trim();
  const colorText = colorResults.textContent;
  summary.replaceChildren();

  if (name) addSummaryRow("Persona", name);
  if (Object.prototype.hasOwnProperty.call(eyeResults, "right")) {
    const value = eyeResults.right;
    addSummaryRow("Agudeza, ojo derecho", value
      ? `al menos 4/5 en 20/${value}`
      : "no alcanzó 4/5 en la línea mayor de la prueba");
  }
  if (Object.prototype.hasOwnProperty.call(eyeResults, "left")) {
    const value = eyeResults.left;
    addSummaryRow("Agudeza, ojo izquierdo", value
      ? `al menos 4/5 en 20/${value}`
      : "no alcanzó 4/5 en la línea mayor de la prueba");
  }
  if (colorText) addSummaryRow("Colores", colorText);
  addSummaryRow("Conclusión", "Estos datos son orientativos. No permiten afirmar que la persona tenga miopía, daltonismo u otra condición específica. Un profesional debe realizar las pruebas clínicas adecuadas.");
  summaryCard.hidden = !(Object.keys(eyeResults).length || colorText);
}

// Comprueba que el registro tenga los campos y tipos que la interfaz necesita.
function isOphthalmologyRecord(record) {
  return record !== null
    && typeof record === "object"
    && ((typeof record.id === "string" && record.id.trim() !== "")
      || (typeof record.id === "number" && Number.isSafeInteger(record.id)))
    && Number.isSafeInteger(record.edad)
    && record.edad >= 0
    && record.edad <= 130
    && typeof record.diagnostico === "string"
    && record.diagnostico.trim() !== ""
    && typeof record.agudezaVisual === "string"
    && record.agudezaVisual.trim() !== "";
}

// Hace la búsqueda insensible a mayúsculas y acentos (p. ej., "miopia"/"miopía").
function normalizeSearchText(value) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Ordena IDs numéricos correctamente y admite también IDs de texto.
function compareRecordIds(first, second) {
  if (typeof first.id === "number" && typeof second.id === "number") {
    return first.id - second.id;
  }
  return String(first.id).localeCompare(String(second.id), "es", { numeric: true });
}

// Filtra, ordena y dibuja las tarjetas a partir de los datos ya cargados.
function renderApiRecords() {
  const query = normalizeSearchText(apiSearch.value.trim());
  const diagnosis = apiDiagnosisFilter.value;
  const filteredRecords = apiRecords.filter(record => {
    // Si se eligió un diagnóstico, descarta los demás.
    if (diagnosis && record.diagnostico !== diagnosis) return false;
    // Solo se busca entre ID, edad, diagnóstico y agudeza; nunca en el nombre.
    const searchableText = normalizeSearchText(`${record.id} ${record.edad} ${record.diagnostico} ${record.agudezaVisual}`);
    return searchableText.includes(query);
  });
  const sortBy = apiSort.value;
  filteredRecords.sort((first, second) => {
    if (sortBy === "age-asc") return first.edad - second.edad || compareRecordIds(first, second);
    if (sortBy === "age-desc") return second.edad - first.edad || compareRecordIds(first, second);
    if (sortBy === "diagnosis") return first.diagnostico.localeCompare(second.diagnostico, "es") || compareRecordIds(first, second);
    return compareRecordIds(first, second);
  });

  apiResults.replaceChildren();
  if (filteredRecords.length === 0) {
    // Informa el resultado vacío sin dejar tarjetas anteriores en pantalla.
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "api-empty";
    emptyMessage.textContent = "No hay registros que coincidan con ese filtro.";
    apiResults.append(emptyMessage);
    apiStatus.textContent = "No se encontraron coincidencias. Prueba con otro término o diagnóstico.";
    apiLoadMore.hidden = true;
    return;
  }

  // Construye las tarjetas en memoria y las agrega juntas para evitar repintados repetidos.
  const fragment = document.createDocumentFragment();
  // La paginación limita cuántas tarjetas se dibujan inicialmente.
  const pageRecords = filteredRecords.slice(0, apiVisibleLimit);
  pageRecords.forEach(record => {
    const article = document.createElement("article");
    article.className = "api-record";

    const header = document.createElement("div");
    header.className = "api-record-header";
    const recordId = document.createElement("span");
    recordId.className = "api-record-id";
    recordId.textContent = `Registro #${record.id}`;
    const diagnosis = document.createElement("span");
    diagnosis.className = "api-diagnosis";
    // "Reportado" aclara que la interfaz presenta el dato de la API, no un diagnóstico propio.
    diagnosis.textContent = `Reportado: ${record.diagnostico}`;
    header.append(recordId, diagnosis);

    const details = document.createElement("dl");
    details.className = "api-record-details";
    [
      ["Edad reportada", `${record.edad} años`],
      ["Agudeza visual", record.agudezaVisual]
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      item.append(term, description);
      details.append(item);
    });

    article.append(header, details);
    fragment.append(article);
  });

  apiResults.append(fragment);
  apiStatus.textContent = `Mostrando ${pageRecords.length} de ${filteredRecords.length} registros coincidentes.`;
  apiLoadMore.hidden = pageRecords.length >= filteredRecords.length;
}

// Pide los datos, valida la respuesta y mantiene los últimos resultados si falla una actualización.
async function loadApiRecords() {
  apiLoadButton.disabled = true;
  apiLoadButton.textContent = "Actualizando…";
  apiFetchInfo.textContent = "Conectando con el servicio seguro de la API…";
  apiStatus.textContent = "";
  if (apiRecords.length === 0) {
    apiSearch.disabled = true;
    apiDiagnosisFilter.disabled = true;
    apiSort.disabled = true;
    apiResults.hidden = true;
  }
  // Evita esperar indefinidamente si el servicio no responde.
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    // fetch realiza la petición HTTP; await espera la respuesta sin bloquear la página.
    const response = await fetch(apiEndpoint, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`La API respondió con el estado ${response.status}.`);
    }

    // Convierte el cuerpo JSON en un objeto de JavaScript.
    const payload = await response.json();
    // Verifica el formato general que anuncia la API antes de leer sus propiedades.
    if (!payload || typeof payload.tematica !== "string" || payload.tematica.trim() === ""
      || !Number.isSafeInteger(payload.cantidad) || payload.cantidad < 0
      || !Array.isArray(payload.recursos)) {
      throw new Error("La respuesta no tiene la estructura esperada (tematica, cantidad y recursos).");
    }

    // Copia solo los campos necesarios para la interfaz y omite intencionalmente "nombre".
    const validRecords = [];
    let skippedRecords = 0;
    payload.recursos.forEach(record => {
      if (!isOphthalmologyRecord(record)) {
        skippedRecords++;
        return;
      }

      validRecords.push({
        id: typeof record.id === "string" ? record.id.trim() : record.id,
        edad: record.edad,
        diagnostico: record.diagnostico.trim(),
        agudezaVisual: record.agudezaVisual.trim()
      });
    });

    if (payload.recursos.length > 0 && validRecords.length === 0) {
      throw new Error("La API respondió, pero ninguno de sus registros tiene el formato esperado.");
    }

    // Guarda los resultados válidos en memoria; no se escriben en disco ni en el servidor.
    apiRecords = validRecords;
    apiDeclaredCount = payload.cantidad;
    apiTopic = payload.tematica.trim();
    apiVisibleLimit = 12;
    apiTheme.textContent = apiTopic;
    apiTotal.textContent = `${apiDeclaredCount}`;
    apiLoadButton.textContent = "Actualizar registros";

    const diagnoses = [...new Set(apiRecords.map(record => record.diagnostico))]
      .sort((first, second) => first.localeCompare(second, "es"));
    apiDiagnosisFilter.replaceChildren(new Option("Todos los diagnósticos", ""));
    diagnoses.forEach(value => apiDiagnosisFilter.add(new Option(value, value)));

    if (apiRecords.length === 0) {
      apiFetchInfo.textContent = `La API respondió con el tema “${apiTopic}” y declara ${apiDeclaredCount} registros, pero la lista está vacía.`;
      apiResults.replaceChildren();
      apiResults.hidden = false;
      apiLoadMore.hidden = true;
      apiSearch.disabled = false;
      apiDiagnosisFilter.disabled = false;
      apiSort.disabled = false;
      apiStatus.textContent = "No hay registros disponibles para mostrar.";
      return;
    }

    apiSearch.disabled = false;
    apiDiagnosisFilter.disabled = false;
    apiSort.disabled = false;
    apiResults.hidden = false;
    // Compara la cantidad anunciada con el número real de elementos recibidos.
    const countMismatch = apiDeclaredCount !== payload.recursos.length
      ? ` La API declara ${apiDeclaredCount}, pero envió ${payload.recursos.length}.`
      : "";
    const skippedMessage = skippedRecords > 0
      ? ` Se omitieron ${skippedRecords} registros con datos incompletos o inválidos.`
      : "";
    apiFetchInfo.textContent = `Conectado · ${apiTopic} · ${apiRecords.length} registros válidos recibidos.${countMismatch}${skippedMessage}`;
    apiLoadButton.textContent = "Actualizar registros";
    renderApiRecords();
  } catch (error) {
    // Presenta errores concretos para red/CORS, JSON inválido o tiempo agotado.
    let detail = error.message;
    if (error.name === "AbortError") {
      detail = "La consulta excedió el tiempo límite de 12 segundos.";
    } else if (error instanceof TypeError) {
      detail = "No se pudo conectar. Comprueba internet o si el servidor permite la solicitud (CORS).";
    } else if (error instanceof SyntaxError) {
      detail = "El servidor no devolvió un JSON válido.";
    }
    apiFetchInfo.textContent = apiRecords.length > 0
      ? `No se pudieron actualizar los datos. Se mantienen los ${apiRecords.length} registros de la última carga. ${detail}`
      : `No se pudieron cargar los registros. ${detail}`;
    apiLoadButton.textContent = apiRecords.length > 0 ? "Reintentar actualización" : "Reintentar carga";
    if (apiRecords.length === 0) {
      apiStatus.textContent = "Los registros no están disponibles por el momento.";
    }
  } finally {
    // Limpia el temporizador y habilita otra vez el botón, haya éxito o error.
    window.clearTimeout(timeout);
    apiLoadButton.disabled = false;
  }
}

scale.addEventListener("input", updateScale);
updateScale();

document.querySelector("#start-right").addEventListener("click", () => startAcuity("right"));
document.querySelector("#start-left").addEventListener("click", () => startAcuity("left"));
document.querySelectorAll(".direction-button").forEach(button => {
  button.addEventListener("click", () => answerAcuity(button.dataset.answer));
});
document.querySelector("#start-color").addEventListener("click", startColorTest);
document.querySelector("#person").addEventListener("input", updateSummary);
document.querySelector("#print-summary").addEventListener("click", () => window.print());
// Cada evento actualiza la lista; solo el botón de carga vuelve a consultar la API.
apiLoadButton.addEventListener("click", loadApiRecords);
apiSearch.addEventListener("input", () => {
  apiVisibleLimit = 12;
  renderApiRecords();
});
apiDiagnosisFilter.addEventListener("change", () => {
  apiVisibleLimit = 12;
  renderApiRecords();
});
apiSort.addEventListener("change", renderApiRecords);
apiLoadMore.addEventListener("click", () => {
  apiVisibleLimit += 12;
  renderApiRecords();
});

// Carga los registros automáticamente cuando la página termina de iniciar.
loadApiRecords();
