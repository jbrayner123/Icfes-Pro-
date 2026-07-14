import { Question } from "../types";

export const MOCK_QUESTIONS: Question[] = [
  // DISEÑO DE SOFTWARE (software-design)
  {
    id_pregunta: "sd_01",
    modulo: "Diseño de Software",
    enunciado: "En un ecosistema transaccional distribuido de alta carga (microservicios de Pedidos, Inventario y Facturación), la arquitectura original implementaba el protocolo Two-Phase Commit (2PC) para garantizar atomicidad global (ACID). No obstante, bajo tráfico pico, el sistema colapsa debido al bloqueo prolongado de recursos de red y bases de datos mientras se espera la fase de confirmación (commit phase). Para resolver este cuello de botella y garantizar escalabilidad manteniendo coherencia, la mejor decisión arquitectónica es:",
    opciones: [
      {
        letra: "A",
        texto: "Implementar el patrón Saga Orquestado, sustituyendo la atomicidad ACID inmediata por consistencia eventual (BASE) y definiendo transacciones compensatorias explícitas para cada paso del flujo.",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "Reemplazar todas las bases de datos relacionales por un único clúster distribuido NoSQL sin transacciones, confiando en que el hardware de red elimine el retraso físico.",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "Envolver los llamados HTTP síncronos de los tres microservicios en un patrón Singleton global para serializar los hilos de ejecución concurrentes en el servidor.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Utilizar llamadas directas a nivel de base de datos entre esquemas cruzados usando vistas materializadas actualizadas en tiempo real mediante disparadores (triggers) recursivos.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "El patrón de diseño de comportamiento SAGA gestiona transacciones distribuidas mediante una secuencia de transacciones locales independientes. Cada paso actualiza la base de datos de un servicio específico y publica un evento. Si un paso falla, se ejecutan transacciones compensatorias en sentido inverso para revertir los cambios de manera eventual, sustituyendo el costoso acoplamiento temporal de 2PC por un modelo asíncrono altamente escalable.",
    tema: "Sistemas Distribuidos y Saga"
  },
  {
    id_pregunta: "sd_02",
    modulo: "Diseño de Software",
    enunciado: "Un backend bancario debe consumir tres APIs externas de pasarelas de pago heredadas. La pasarela A responde con payloads SOAP/XML firmados digitalmente por certificados X.509; la pasarela B utiliza REST con cifrado simétrico AES-256 en JSON; y la pasarela C utiliza rpc nativo sobre gRPC. El sistema principal requiere procesar transacciones de manera uniforme, con tolerancia a fallos dinámica y capacidad de conmutar (failover) de pasarela en tiempo de ejecución. ¿Cómo se debe estructurar este diseño?",
    opciones: [
      {
        letra: "A",
        texto: "Implementar un bloque condicional 'switch-case' con herencia directa en la clase controladora de la interfaz de usuario, instanciando los SDKs de cada pasarela según se requiera.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Diseñar una abstracción unificada (IPasarelaPago) aplicando el patrón Adapter (Adaptador) para envolver las llamadas criptográficas y protocolos específicos de cada proveedor, y coordinar su selección dinámica mediante el patrón Strategy (Estrategia).",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Crear un objeto Singleton global que herede de todas las pasarelas simultáneamente mediante herencia múltiple de interfaces complejas para evitar la inyección de dependencias.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Serializar los payloads binarios de red en el navegador del cliente final utilizando WebAssembly, forzando a que sea el navegador el que traduzca las llamadas criptográficas antes de enviarlas al servidor.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "La combinación de Adapter y Strategy es óptima. Adapter homogeniza las APIs dispares (SOAP, REST, gRPC) bajo una interfaz única conocida por la aplicación principal (desacoplamiento). Strategy encapsula los algoritmos de selección del proveedor de pago, permitiendo cambiar la pasarela activa dinámicamente en tiempo de ejecución (por ejemplo, ante una falla en la pasarela principal) de manera transparente.",
    tema: "Patrones de Diseño de Software"
  },
  {
    id_pregunta: "sd_03",
    modulo: "Diseño de Software",
    enunciado: "Usted lidera la refactorización de un sistema modular de facturación acoplado directamente al driver nativo de base de datos relacional (PostgreSQL). El equipo debe migrar componentes clave a un motor NoSQL (MongoDB) para manejar Big Data de auditoría. Para cumplir estrictamente con los principios de Arquitectura Limpia e Inversión de Dependencias (DIP) de SOLID, de modo que las reglas de negocio permanezcan intactas y aisladas, el procedimiento correcto de refactorización es:",
    opciones: [
      {
        letra: "A",
        texto: "Definir puertos abstractos de acceso a datos (Interfaces de Repositorio) en las capas internas del dominio. Los casos de uso operan únicamente contra estas abstracciones. Las implementaciones concretas para PostgreSQL y MongoDB se ubican en la capa de infraestructura externa y se inyectan dinámicamente.",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "Escribir un traductor sintáctico de consultas SQL a consultas de agregación de MongoDB que intercepte los strings en tiempo de ejecución y los ejecute dinámicamente sobre la conexión del controlador activo.",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "Duplicar las clases de la capa de lógica de negocio (Casos de Uso), creando una versión 'FacturacionPostgres' y otra 'FacturacionMongo', administrando la bifurcación con variables de entorno de Node.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Mapear todas las tablas directamente a documentos NoSQL utilizando un ORM/ODM híbrido global, permitiendo que las clases de dominio hereden directamente del modelo de datos de bajo nivel.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "El principio de Inversión de Dependencias (DIP) establece que los módulos de alto nivel (reglas de negocio/casos de uso) no deben depender de los módulos de bajo nivel (infraestructura/bases de datos); ambos deben depender de abstracciones. Al colocar las interfaces de repositorio en las capas centrales, la lógica empresarial no sabe ni le importa de dónde provienen los datos, aislando de forma completa el núcleo del software de cambios tecnológicos.",
    tema: "Arquitectura Limpia y DIP"
  },
  {
    id_pregunta: "sd_04",
    modulo: "Diseño de Software",
    enunciado: "En un motor relacional OLTP altamente concurrente que procesa cobros sobre cuentas bancarias, dos hilos ejecutan transacciones simultáneas: la Transacción 1 lee el saldo de la cuenta A ($500) y de la cuenta B ($300) para transferir $100 de A a B. La Transacción 2 lee concurrentemente las mismas cuentas para transferir $50 de B a A. Si no se maneja la concurrencia, el sistema genera condiciones de carrera (race conditions) o bloqueos mutuos (Deadlocks) al adquirir bloqueos exclusivos desordenados. Para erradicar deadlocks manteniendo el aislamiento ACID estricto bajo alta concurrencia, el enfoque óptimo es:",
    opciones: [
      {
        letra: "A",
        texto: "Configurar el nivel de aislamiento de la base de datos en 'Read Uncommitted' y delegar la consistencia final a un algoritmo de cola en el cliente web.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Forzar un protocolo estricto de ordenamiento de recursos (por ejemplo, ordenar siempre los IDs de las cuentas numéricamente antes de efectuar bloqueos exclusivos de tipo SELECT FOR UPDATE), garantizando que las transacciones intenten bloquear las filas en el mismo orden secuencial predecible.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Implementar un bucle de reintento indefinido con retraso exponencial en el servidor, permitiendo que las transacciones colisionen de forma libre y abortando las que reporten fallas físicas.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Sustituir los bloqueos relacionales por una sincronización de memoria a nivel de sistema operativo que detenga todo procesamiento de red mientras una transacción esté activa.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "Un Deadlock ocurre cuando la Transacción 1 bloquea el recurso A y espera por B, mientras que la Transacción 2 bloquea B y espera por A. Al definir un orden estricto de adquisición de recursos (por ejemplo, bloquear siempre el registro con ID menor primero), es físicamente imposible que ocurra una espera circular. Esto destruye la cuarta condición necesaria de Coffman para deadlocks (espera circular), garantizando la estabilidad transaccional de manera determinista.",
    tema: "Concurrencia y Bases de Datos"
  },

  // COMUNICACIÓN (communication)
  {
    id_pregunta: "com_01",
    modulo: "Communication",
    enunciado: "Lea con atención el siguiente fragmento redactado por un Director de Comunicaciones durante una grave brecha de seguridad que expuso información confidencial de millones de usuarios:\n\n'Nuestra corporación opera bajo los más exigentes estándares de ciberseguridad global. Aunque un evento externo imprevisto de fuerza mayor comprometió de manera temporal un segmento marginal de registros históricos debido a fallos ajenos a nuestro control, el incidente fue contenido de inmediato. No existen pruebas de daño material directo a nuestros valiosos clientes. Por ende, los reportes alarmistas de la prensa carecen de fundamento científico y solo buscan desestabilizar el mercado financiero regional'.\n\nDesde el punto de vista del análisis del discurso crítico y la efectividad comunicativa institucional, ¿cuál es la principal debilidad de este comunicado?",
    opciones: [
      {
        letra: "A",
        texto: "Carece de una tesis explícita sobre el origen geográfico exacto de los atacantes cibernéticos.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Utiliza una retórica defensiva que minimiza la gravedad del evento mediante eufemismos ('evento imprevisto', 'segmento marginal', 'fallos ajenos') y descalifica a la prensa, lo que socava la transparencia institucional, genera desconfianza y elude la responsabilidad objetiva frente a los usuarios.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Es excesivamente corto y no contiene enlaces al código fuente del sistema de encriptación que falló durante el incidente.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "El autor utiliza conectores lógicos de causa que confunden los términos matemáticos del volumen real de registros comprometidos.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "En comunicación de crisis corporativa, el uso de eufemismos evasivos y el ataque a los medios ('alarmistas') se interpreta como un intento de ocultamiento. Reducir la exposición de datos sensibles a un 'evento imprevisto temporal' evade la responsabilidad sobre la custodia de la información, debilitando la reputación de la empresa y violando principios de asertividad y transparencia ética.",
    tema: "Comunicación de Crisis y Retórica"
  },
  {
    id_pregunta: "com_02",
    modulo: "Communication",
    enunciado: "Durante un foro académico internacional sobre políticas públicas de infraestructura digital en América Latina, un analista sostiene la siguiente premisa:\n\n'La transición acelerada hacia un modelo de gobernanza digital gubernamental basado en la nube pública de corporaciones extranjeras es el único camino viable para erradicar la corrupción burocrática estatal. Si un gobierno decide mantener servidores físicos o nubes privadas locales, está demostrando de forma implícita un interés corrupto en manipular los registros públicos sin auditorías globales'.\n\nAl deconstruir la estructura argumentativa del analista, se evidencia que su postura adolece de:",
    opciones: [
      {
        letra: "A",
        texto: "Una falacia de falso dilema (bifurcación exclusiva), puesto que reduce de manera arbitraria las opciones de infraestructura del Estado a dos extremos excluyentes (nube extranjera transparente vs. servidores locales corruptos), ignorando variables legítimas de seguridad nacional, soberanía de datos, costos y diseño técnico independiente.",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "Un exceso de términos estadísticos empíricos que saturan al lector con métricas de corrupción gubernamental de la ONU.",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "Una contradicción lógica inherente al sugerir que las corporaciones privadas globales no están sujetas a leyes tributarias.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Una falacia Ad Hominem directa contra los desarrolladores de software que construyen plataformas open-source para entidades estatales.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "El falso dilema ocurre al obligar al interlocutor a elegir entre dos opciones extremas como si fueran las únicas posibles, cuando en realidad existen múltiples alternativas (e.g., nubes híbridas, centros de datos locales certificados con estrictas auditorías y código abierto). Atribuir automáticamente malas intenciones (corrupción) a decisiones técnicas de soberanía tecnológica es un sesgo lógico inaceptable en una argumentación rigurosa.",
    tema: "Falacias Argumentativas"
  },

  // RAZONAMIENTO CUANTITATIVO (quantitative-reasoning)
  {
    id_pregunta: "rc_01",
    modulo: "Quantitative Reasoning",
    enunciado: "Un clúster distribuido de indexación de datos debe procesar un dataset masivo de 550 Terabytes (TB). Inicialmente, la infraestructura cuenta con 4 nodos activos que procesan a una tasa constante de 2.5 TB/hora por nodo. El equipo de TI decide incrementar el número de nodos activos a 10 para acelerar la operación. No obstante, debido a los cuellos de botella de sincronización e interconexión de red, la eficiencia de procesamiento individual de cada uno de los 10 nodos disminuye en un 12% con respecto a su tasa original. ¿Cuánto tiempo exacto tardará el clúster de 10 nodos en indexar el dataset completo y cuál es la ganancia de velocidad neta (throughput global) en comparación con el clúster inicial de 4 nodos?",
    opciones: [
      {
        letra: "A",
        texto: "Tardará 25 horas. La tasa global aumentó de 10 TB/hora (con 4 nodos) a 22 TB/hora (con 10 nodos), logrando una ganancia neta de throughput global del 120%.",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "Tardará 55 horas. La tasa global disminuyó debido al cuello de botella de red a 10 TB/hora, por lo que el rendimiento general no cambió.",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "Tardará 22 horas. El throughput global se redujo a 12 TB/hora debido a la pérdida drástica de eficiencia del 12% por nodo.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Tardará 30 horas. El incremento de nodos no compensa la latencia y la tasa neta se estabilizó en 18.33 TB/hora.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "Paso 1: Rendimiento original: 4 nodos * 2.5 TB/hora = 10 TB/hora. Paso 2: Nuevo rendimiento individual: Cada uno de los 10 nodos procesa un 12% menos: 2.5 * (1 - 0.12) = 2.2 TB/hora. Paso 3: Nuevo rendimiento global del clúster: 10 nodos * 2.2 TB/hora = 22 TB/hora. Paso 4: Tiempo requerido para 550 TB: 550 TB / 22 TB/hora = 25 horas. Paso 5: Ganancia neta de throughput: De 10 TB/h original a 22 TB/h actual hay un incremento del 120% ((22 - 10)/10 * 100).",
    tema: "Modelamiento y Proporcionalidad Marginal"
  },
  {
    id_pregunta: "rc_02",
    modulo: "Quantitative Reasoning",
    enunciado: "Una empresa proveedora de software SaaS dispone de un presupuesto máximo de $12,000 USD mensuales para su infraestructura de cómputo en la nube. Puede arrendar dos tipos de instancias virtuales:\n- Instancias Tipo A: 2 vCPUs, 8 GB de memoria RAM, costo de $150 USD mensuales.\n- Instancias Tipo B: 8 vCPUs, 32 GB de memoria RAM, costo de $450 USD mensuales.\n\nPara garantizar el acuerdo de nivel de servicio (SLA) en tráfico pico, la aplicación requiere un mínimo de 160 vCPUs totales en paralelo y al menos 640 GB de memoria RAM total. Adicionalmente, por restricciones de límites de cuotas lógicas del proveedor de nube, la empresa no puede arrendar más de 30 instancias de Tipo B en total. Con el fin de minimizar el costo mensual cumpliendo estrictamente con todas las restricciones técnicas, la configuración óptima que el equipo de arquitectura debe seleccionar es:",
    opciones: [
      {
        letra: "A",
        texto: "Arrendar 80 instancias de Tipo A y 0 instancias de Tipo B, para un costo total de $12,000 USD.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Arrendar 0 instancias de Tipo A y 20 instancias de Tipo B, para un costo mensual mínimo de $9,000 USD.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Arrendar 10 instancias de Tipo A y 15 instancias de Tipo B, para un costo total de $8,250 USD.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Arrendar 40 instancias de Tipo A y 10 instancias de Tipo B, para un costo mensual óptimo de $10,500 USD.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "Este es un problema de optimización de programación lineal. Denotemos A y B como la cantidad de instancias Tipo A y Tipo B. Restricciones: 1) vCPUs: 2A + 8B >= 160. 2) RAM: 8A + 32B >= 640. 3) Cuota: B <= 30. 4) Costo <= 12,000. Función objetivo a minimizar: Costo = 150A + 450B. Evaluando la relación vCPU/dólar y RAM/dólar, la instancia B es más económica por unidad de cómputo (vCPU de B cuesta $56.25 vs $75 en A). Al maximizar B para cubrir los requisitos mínimos: si A = 0 y B = 20, tenemos: vCPUs = 2(0) + 8(20) = 160 (CUMPLE); RAM = 8(0) + 32(20) = 640 GB (CUMPLE); Límite B: 20 <= 30 (CUMPLE). Costo = 150(0) + 450(20) = $9,000 USD. Cualquier otra combinación válida resulta en un costo superior o incumple alguna de las restricciones básicas.",
    tema: "Optimización bajo Restricciones"
  },

  // LECTURA CRÍTICA (critical-reading)
  {
    id_pregunta: "lc_01",
    modulo: "Critical Reading",
    enunciado: "Lea atentamente el siguiente fragmento del filósofo John Searle en relación con el experimento mental de la 'Habitación China':\n\n'Imaginemos que estoy encerrado en una habitación y que se me entrega un gran volumen de hojas escritas en chino junto con un conjunto de reglas en inglés que explican cómo correlacionar los caracteres chinos con otros. Las reglas me permiten responder de forma sintáctica a preguntas escritas en chino que se deslizan bajo la puerta, a pesar de que yo no comprendo absolutamente nada de ese idioma. Para un observador externo, mis respuestas son indistinguibles de las de un hablante nativo chino. Sin embargo, resulta evidente que yo no entiendo chino; simplemente manipulo símbolos de acuerdo con su forma formal y no con su significado. De esto se deduce que la mera implementación de un programa computacional formal no es una condición suficiente para la presencia de una mente con comprensión semántica genuina'.\n\n¿Cuál de las siguientes afirmaciones constituye una premisa implícita y fundamental que sostiene el argumento de Searle para rebatir la teoría de la 'Inteligencia Artificial Fuerte' (funcionalismo computacional)?",
    opciones: [
      {
        letra: "A",
        texto: "La sintaxis formal de un programa computacional es intrínsecamente idéntica a la semántica cognitiva humana, por lo que las máquinas eventualmente tendrán sentimientos reales.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "La manipulación formal de símbolos lógicos (sintaxis) no es idéntica ni suficiente por sí misma para constituir el entendimiento consciente de significados (semántica).",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "El idioma inglés posee una estructura neuronal intrínsecamente superior a la del idioma chino para procesar algoritmos matemáticos complejos.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Cualquier observador externo que interactúe con un sistema de software carece por completo de criterio racional para evaluar la validez del método científico.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "El argumento de Searle deconstruye la tesis de que la simulación perfecta de un comportamiento cognitivo equivale a la posesión real de estados mentales conscientes (comprensión). La premisa implícita de su razonamiento es que un sistema puede ser sintácticamente perfecto (como el computador o el hombre con el manual de reglas dentro del cuarto) y seguir careciendo de contenido semántico (comprensión del significado real de los caracteres).",
    tema: "Análisis Crítico y Premisas Implícitas"
  },
  {
    id_pregunta: "lc_02",
    modulo: "Critical Reading",
    enunciado: "Considere el siguiente fragmento adaptado del filósofo Byung-Chul Han en su obra 'La sociedad de la transparencia':\n\n'La transparencia es la palabra de orden de la sociedad contemporánea. Se le exige a la política, al mercado y al individuo. Sin embargo, la transparencia total no es un vehículo para la liberación o la verdad, sino una de las formas más sutiles y eficaces de dominación. En una sociedad donde todo está expuesto, desaparece la distancia, el misterio y la otredad. La transparencia aplana la diferencia y convierte al ser humano en un elemento hiper-legible, desprovisto de interioridad. Cuando el imperativo de visibilidad erradica el derecho al secreto, el control social ya no requiere de un panóptico exterior que vigile con violencia; el propio individuo se auto-expone voluntariamente al escrutinio masivo en un acto de auto-explotación digital consentida. La transparencia es la consumación del control sin coerción física'.\n\nDe acuerdo con la tesis expuesta por el autor, ¿cuál es la paradoja fundamental inherente a la exigencia de transparencia en la sociedad digital?",
    opciones: [
      {
        letra: "A",
        texto: "La transparencia promete democratizar el acceso a la riqueza económica, pero en realidad provoca una hiperinflación monetaria que perjudica a los bancos.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "La exigencia de visibilidad absoluta, presentada como una herramienta de libertad y democratización, se transforma en un mecanismo de hiper-vigilancia y dominación donde el sujeto se auto-somete voluntariamente al control masivo al eliminar su propia interioridad.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "El secreto de estado protege la democracia al permitir que los funcionarios públicos oculten las fallas fiscales de los proyectos de infraestructura.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "La digitalización extingue el interés del público general por participar de forma estética en debates filosóficos y humanistas presenciales.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "La paradoja de la transparencia identificada por el autor radica en que, bajo la promesa de la emancipación y la eliminación de secretos nocivos, se instaura un régimen de visibilidad obligatoria en el que la privacidad y la individualidad (la otredad) se extinguen. El control ya no se impone autoritariamente desde afuera, sino que es el propio individuo el que se despoja de su intimidad, facilitando su propia sumisión sistémica.",
    tema: "Deconstrucción Filosófica de Conceptos"
  },

  // COMPETENCIAS CIUDADANAS (citizen-competencies)
  {
    id_pregunta: "cc_01",
    modulo: "Citizen Competencies",
    enunciado: "En una situación de grave crisis económica nacional, el Presidente de la República de Colombia hace uso de las facultades del Estado de Emergencia Económica, Social y Ecológica (Art. 215 CN) y expide un Decreto Legislativo que suspende temporalmente las prestaciones sociales de los trabajadores particulares de medianas empresas para 'aliviar el flujo de caja corporativo y evitar quiebras masivas'. Ante esta medida unilateral del Ejecutivo, ¿cuál es el mecanismo constitucional e institucional previsto por el ordenamiento colombiano para salvaguardar el principio de separación de poderes y proteger los derechos laborales fundamentales?",
    opciones: [
      {
        letra: "A",
        texto: "El Decreto Legislativo adquiere validez jurídica permanente e irreversible tan pronto es firmado por el gabinete de ministros, impidiendo cualquier revisión judicial.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "El Decreto se somete automáticamente a un control constitucional oficioso por parte de la Corte Constitucional, la cual evaluará si la medida respeta la intangibilidad de los derechos fundamentales mínimos y los principios de conexidad, necesidad y proporcionalidad, pudiendo declararlo inexequible de forma inmediata.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "El Congreso de la República debe disolverse de inmediato y convocar a una asamblea constituyente popular para redactar un nuevo código sustantivo del trabajo.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Los gobernadores departamentales tienen la potestad de anular unilateralmente la aplicación del Decreto en sus respectivos territorios mediante un referendo local.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "En Colombia, el Estado de Emergencia otorga facultades excepcionales al Ejecutivo, pero estas no son absolutas ni dictatoriales. Todo decreto legislativo dictado bajo estados de excepción es remitido al día siguiente a la Corte Constitucional para un control automático de constitucionalidad (oficioso y riguroso). La Corte analiza límites estrictos de proporcionalidad y conexidad, asegurando que no se vulneren los derechos mínimos e irrenunciables de los trabajadores.",
    tema: "Estados de Excepción y Control de Poder"
  },
  {
    id_pregunta: "cc_02",
    modulo: "Citizen Competencies",
    enunciado: "Un pilar de la Justicia Transicional implementada en Colombia tras la firma de los Acuerdos de Paz es la Jurisdicción Especial para la Paz (JEP). Este modelo se fundamenta en la 'justicia restaurativa y prospectiva' en oposición a la 'justicia retributiva pura'. Si un compareciente de un grupo armado ilegal o agente estatal reconoce plenamente su responsabilidad en crímenes de lesa humanidad y aporta verdad exhaustiva, detallada y reparadora ante la JEP, el ordenamiento jurídico prevé que la sanción a imponer sea:",
    opciones: [
      {
        letra: "A",
        texto: "La amnistía total y automática, extinguiendo la responsabilidad penal sin requerir ningún tipo de reparación física o moral a las víctimas.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Una Sanción Propia (de 5 a 8 años) de restricción efectiva de la libertad y derechos en condiciones que no impliquen cárcel común, enfocada en trabajos y obras de reparación comunitaria y reconstrucción social (TOAR).",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Una pena privativa de la libertad idéntica en términos de años a las condenas del código penal ordinario en una cárcel de máxima seguridad nacional.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "La pérdida de los derechos de ciudadanía de por vida, obligando al compareciente al destierro físico del territorio colombiano de forma permanente.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "La JEP implementa justicia restaurativa. Si el compareciente aporta verdad plena y asume responsabilidad, se hace acreedor a sanciones propias (TOAR), las cuales consisten en la restricción de derechos y libertad en áreas delimitadas pero sin prisión tradicional, obligándolo a realizar actividades concretas de reparación a las víctimas (como desminado humanitario o reconstrucción de escuelas), equilibrando verdad, justicia y reconciliación.",
    tema: "Justicia Transicional y DDHH"
  },

  // INGLÉS (english)
  {
    id_pregunta: "en_01",
    modulo: "English",
    enunciado: "Read the academic text below and choose the option that best completes the gap:\n\n'The unprecedented surge in quantum computing capabilities has triggered severe concern among cybersecurity intelligence groups. Most contemporary cryptographic algorithms, which rely heavily on the prime factorization of immense numbers, are anticipated to be completely ______ by Shor’s algorithm once stable, fault-tolerant quantum machines emerge. Consequently, the immediate transition to post-quantum cryptography (PQC) is no longer a theoretical debate but an urgent systemic necessity.'",
    opciones: [
      {
        letra: "A",
        texto: "rendered obsolete",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "exponentially bolstered",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "superficially bypassed",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "mutually reconciled",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "The context explains that quantum computing and Shor's algorithm will compromise current cryptographic models that depend on prime factorization. Therefore, these algorithms will be made useless or out of date. 'Rendered obsolete' is the precise academic expression for this effect. 'Bolstered' means strengthened, which is the opposite; 'bypassed superficially' minimizes the issue; and 'reconciled' does not fit logically.",
    tema: "Advanced Reading & Vocabulary"
  },
  {
    id_pregunta: "en_02",
    modulo: "English",
    enunciado: "Select the option that structurally and grammatically completes the conditional analysis of the historical scientific event:\n\n'______ the design team anticipated the significant transactional latency overhead in their initial distributed database model, they would not have suffered from the cascading microservice timeouts that plagued the system during the high-traffic launch.'",
    opciones: [
      {
        letra: "A",
        texto: "Had",
        es_correcta: true
      },
      {
        letra: "B",
        texto: "If",
        es_correcta: false
      },
      {
        letra: "C",
        texto: "Should",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Were",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "This sentence requires a third conditional structure using inversion to express regret or an unfulfilled past condition. 'Had the design team anticipated' is equivalent to 'If the design team had anticipated'. Using 'If' on its own here is grammatically incorrect because it lacks the auxiliary 'had' (it would need to be 'If the design team had anticipated'). 'Should' is used for first conditional inversion (future possibility), and 'Were' is used for second conditional inversion (present/future hypothetical).",
    tema: "Inverted Conditionals"
  },

  // FORMULACIÓN DE PROYECTOS (project-formulation)
  {
    id_pregunta: "pf_01",
    modulo: "Project Formulation",
    enunciado: "En la formulación y evaluación financiera de proyectos de inversión en tecnología, un equipo de ingenieros analiza un proyecto de automatización agrícola. El costo inicial de inversión es de $400 millones de pesos. La Tasa de Interés de Oportunidad (TIO) de los inversionistas es del 12% anual. Al calcular los flujos netos de efectivo descontados a 5 años, el proyecto arroja un Valor Presente Neto de exactamente cero (VPN = 0). Desde una perspectiva metodológica rigurosa de toma de decisiones financieras, este resultado técnico de VPN = 0 indica que:",
    opciones: [
      {
        letra: "A",
        texto: "El proyecto genera pérdidas financieras netas idénticas al capital de inversión inicial y debe descartarse de inmediato.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "El proyecto rinde exactamente la tasa de retorno exigida por los inversionistas (12% anual), logrando cubrir la inversión y el costo de oportunidad, por lo cual es aceptable si no existen alternativas con mayor VPN.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "La Tasa Interna de Retorno (TIR) del proyecto es del 0%, lo que imposibilita de raíz el retorno de capital en el largo plazo.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "El periodo de recuperación de la inversión (Payback Period) es infinito, requiriendo un subsidio gubernamental perpetuo.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "Por definición, el Valor Presente Neto (VPN) evalúa la riqueza adicional creada por un proyecto por encima de la tasa de descuento (TIO) exigida. Un VPN = 0 significa que el proyecto recupera la inversión inicial y rinde exactamente la tasa de interés requerida (en este caso, la TIR es igual al 12% de la TIO). Por ende, el proyecto es financieramente viable e indiferente/aceptable desde el punto de vista del rendimiento mínimo esperado.",
    tema: "Criterios de Viabilidad Financiera"
  },

  // PENSAMIENTO CIENTÍFICO (scientific-thinking)
  {
    id_pregunta: "st_01",
    modulo: "Scientific Thinking",
    enunciado: "Un equipo de investigadores en ciencias de la computación postula la hipótesis de que un nuevo algoritmo heurístico de optimización combinatoria (OptimaX) encuentra mejores mínimos globales en el problema del agente viajero (TSP) que el algoritmo genético tradicional (AG_Standard). Para verificar la validez científica de esta hipótesis de forma rigurosa, descartando factores de confusión aleatorios o sesgos sistemáticos, el diseño metodológico correcto debe contemplar:",
    opciones: [
      {
        letra: "A",
        texto: "Seleccionar una muestra sesgada de grafos pequeños favorables a OptimaX y describir de manera cualitativa por qué su ejecución parece más elegante y compacta.",
        es_correcta: false
      },
      {
        letra: "B",
        texto: "Diseñar un estudio experimental controlado con asignación aleatoria de un conjunto estandarizado y heterogéneo de datasets de prueba (TSPLIB). Ejecutar ambos algoritmos bajo idénticas restricciones de hardware e hiperparámetros de control, registrar cuantitativamente el costo de ruta obtenido de forma repetida, y aplicar una prueba estadística de diferencia de medias (como Wilcoxon Signed-Rank Test) para comprobar significancia con un p-valor inferior a 0.05.",
        es_correcta: true
      },
      {
        letra: "C",
        texto: "Realizar una encuesta de opinión de satisfacción entre los ingenieros de software de la empresa sobre cuál de los dos códigos les resulta estéticamente más legible.",
        es_correcta: false
      },
      {
        letra: "D",
        texto: "Demostrar matemáticamente la complejidad asintótica Big-O de ambos algoritmos y omitir la fase de experimentación empírica por considerarla redundante.",
        es_correcta: false
      }
    ],
    explicacion_retroalimentacion: "La verificación científica en ciencias de la computación empírica exige un diseño experimental estricto. Al enfrentar heurísticas, se deben usar benchmarks públicos (TSPLIB) para evitar sesgos, asegurar la replicabilidad (mismo hardware) y aplicar pruebas estadísticas no paramétricas (como Wilcoxon, útil cuando no hay garantía de distribución normal) para certificar que la superioridad encontrada no es un artefacto del azar (p < 0.05).",
    tema: "Diseño Experimental e Inferencia"
  }
];

/**
 * Simulates fetching questions from an external FastAPI backend.
 * This satisfies the requirement: "Deja la lógica preparada para que este JSON pueda ser reemplazado fácilmente por un fetch() a un backend en FastAPI en el futuro."
 */
export async function fetchQuestionsFromBackend(moduloId?: string): Promise<Question[]> {
  if (!moduloId) {
    return MOCK_QUESTIONS;
  }

  try {
    const response = await fetch(`/api/questions?modulo=${moduloId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching questions from full-stack backend:", error);
  }

  // Fallback to local mock filter if server request fails
  const nameMap: Record<string, string> = {
    "communication": "Communication",
    "quantitative-reasoning": "Quantitative Reasoning",
    "critical-reading": "Critical Reading",
    "citizen-competencies": "Citizen Competencies",
    "english": "English",
    "project-formulation": "Project Formulation",
    "scientific-thinking": "Scientific Thinking",
    "software-design": "Diseño de Software"
  };

  const targetModuloName = nameMap[moduloId] || moduloId;
  return MOCK_QUESTIONS.filter(q => q.modulo.toLowerCase() === targetModuloName.toLowerCase());
}
