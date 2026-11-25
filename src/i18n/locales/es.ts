import type { ImportSummary as BackupCounts } from '../../data/backup';
import type { DurationParts } from '../../domain/days';
import type { Dictionary } from './en';

export const es: Dictionary = {
  languages: {
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
  },
  themes: {
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
  },
  common: {
    done: 'Listo',
    close: 'Cerrar',
  },
  tabs: {
    label: 'Navegación principal',
    home: 'Inicio',
    calendar: 'Calendario',
    stats: 'Estadísticas',
    profile: 'Perfil',
  },
  home: {
    greeting: {
      morning: 'Buenos días',
      day: 'Hola',
      evening: 'Buenas tardes',
      night: 'Hola, ave nocturna',
    },
    didYouKnow: '¿Sabías que…?',
    hideFact: 'Ocultar el dato de hoy',
    readMore: 'Leer más',
    migraineDaysLastFourWeeks: (n: number) =>
      n === 1
        ? '1 día de migraña en las últimas 4 semanas'
        : `${n} días de migraña en las últimas 4 semanas`,
    startMigraine: 'Iniciar crisis',
    insight: 'Observación',
  },
  attackKind: { migraine: 'Migraña', headache: 'Dolor de cabeza' },
  dayLegend: {
    migraine: 'Migraña',
    withMedication: '+ Medicamento',
    headache: 'Dolor de cabeza',
    today: 'Hoy',
  },
  dayDetail: {
    start: 'Inicio',
    end: 'Fin',
    ongoing: 'en curso',
    duration: 'Duración',
    pain: 'Intensidad',
    painOutOfTen: (n: number) => `${n}/10`,
    medications: 'Medicamentos',
    noEntry: 'Sin registros este día',
  },
  editAttack: {
    title: {
      attack: 'Editar crisis',
      migraine: 'Editar migraña',
      headache: 'Editar dolor de cabeza',
    },
    addTitle: 'Añadir crisis',
    kind: 'Tipo',
    start: 'Inicio',
    end: 'Fin',
    painLevel: 'Intensidad del dolor',
    medications: 'Medicamentos',
    addMedication: 'Añadir medicamento',
    takenAt: 'Tomado a las',
    removeIntake: (name: string) => `Quitar ${name}`,
    save: 'Guardar',
    delete: {
      attack: 'Eliminar crisis',
      migraine: 'Eliminar migraña',
      headache: 'Eliminar dolor de cabeza',
    },
    confirmDelete: '¿Eliminar de verdad?',
  },
  activeAttack: {
    label: {
      attack: 'Crisis activa',
      migraine: 'Migraña activa',
      headache: 'Dolor de cabeza activo',
    },
    duration: ({ days, hours, minutes }: DurationParts) =>
      days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    sinceToday: (time: string) => `desde las ${time}`,
    sinceOn: (dateTime: string) => `desde ${dateTime}`,
    pain: 'Dolor',
    painOutOf: 'de 10',
    painNow: 'Intensidad del dolor ahora',
    medicationsDuring: 'Medicamentos',
    logMedication: 'Registrar medicamento',
    end: {
      attack: 'Terminar crisis',
      migraine: 'Terminar migraña',
      headache: 'Terminar dolor de cabeza',
    },
    endedEarlier: '¿Terminó antes?',
    moreActions: 'Más acciones',
    deleteIntake: (name: string) => `Eliminar ${name}`,
  },
  medicationSheet: {
    notBefore: (time: string) => `desde las ${time}`,
    title: '¿Qué medicamento?',
    takenAt: 'Tomado a las',
    empty: 'Todavía no hay medicamentos guardados.',
    newMedication: 'Nuevo medicamento',
    name: 'Nombre',
    dose: 'Dosis (opcional)',
    isTriptan: 'Triptán',
    save: 'Guardar',
    done: 'Listo',
  },
  timePicker: {
    startTitle: '¿Cuándo empezó?',
    endTitle: '¿Cuándo terminó?',
    label: 'Fecha y hora',
    save: 'Guardar',
  },
  effectiveness: {
    strong: 'Mejoró mucho',
    slight: 'Mejoró un poco',
    none: 'Sin efecto',
    worse: 'Empeoró',
    pending: 'Efecto pendiente',
    sheetTitle: (name: string) => `Efecto · ${name}`,
  },
  prompts: {
    rateIntake: (name: string) => `¿Te ayudó ${name}?`,
    takenAt: (time: string) => `Tomado ${time}`,
    stillRunning: '¿Sigue la migraña?',
    stillRunningNextDay: '¿Ayer seguía siendo un día de migraña?',
    stillRunningNextDayHint: 'La migraña sigue marcada como activa.',
    stillGoing: 'Sigue',
    itIsOver: 'Ya pasó',
    endAtTime: 'Terminó antes',
  },
  errors: {
    attack: {
      startInFuture: 'Esta hora está en el futuro.',
      endBeforeStart: 'El fin tiene que ser después del inicio.',
      invalidPainLevel: 'La intensidad tiene que estar entre 0 y 10.',
      overlap: 'Se solapa con otra crisis.',
      activeAttackExists: 'Ya hay una crisis activa.',
      notFound: 'Esta migraña ya no existe.',
    },
    prevention: {
      endBeforeStart: 'La fecha de fin no puede ser anterior a la de inicio.',
      effectiveBeforeStart: 'No puede empezar a hacer efecto antes de la fecha de inicio.',
    },
  },
  insights: {
    tone: { good: 'Buena tendencia', bad: 'Mala tendencia', mixed: 'Tendencia mixta' },
    migraineDaysDropped: (before: string, after: string) =>
      `Los días de migraña bajaron de ${before} a ${after} al mes.`,
    migraineDaysRose: (before: string, after: string) =>
      `Los días de migraña subieron de ${before} a ${after} al mes.`,
    migraineDaysDetail: (before: string, after: string) =>
      `Compara ${after} con el periodo anterior de la misma duración (${before}). Se cuentan los días con migraña, llevados a 30 días.`,
    preventionMedicationDays: (name: string, before: string, after: string) =>
      `Desde ${name}: ${after} en vez de ${before} días con medicación al mes.`,
    preventionWeaker: (name: string, early: string, recent: string, before?: string) =>
      `${name} funciona peor que al principio: ${early} al principio, ${recent} días de migraña al mes últimamente${before ? ` (antes: ${before})` : ''}.`,
    preventionStronger: (name: string, early: string, recent: string, before?: string) =>
      `${name} funciona mejor que al principio: ${early} al principio, ${recent} días de migraña al mes últimamente${before ? ` (antes: ${before})` : ''}.`,
    preventionChangeDetail: (early: string, recent: string, before?: string) =>
      `Compara los primeros 90 días desde que debería hacer efecto (${early}) con los últimos 90 días (${recent}). Se cuentan los días con migraña, llevados a 30 días.${before ? ` «Antes» son hasta 90 días antes del inicio (${before}).` : ''}`,
    preventionDetail: (days: number, before: string, after: string) =>
      `Compara los ${days} días antes del inicio (${before}) con ${days} días desde que debería hacer efecto (${after}). Se cuentan los días con al menos una toma de medicamento, llevados a 30 días. Puedes indicar cuándo debería hacer efecto en Perfil → Prevención.`,
    lifeEventMigraineDays: (name: string, before: string, after: string) =>
      `Desde «${name}»: ${after} en vez de ${before} días de migraña al mes.`,
    lifeEventDetail: (days: number, before: string, after: string) =>
      `Compara los ${days} días antes del cambio (${before}) con los ${days} días desde el cambio (${after}). Se cuentan los días con migraña, llevados a 30 días.`,
    medicationHelpedLess: (name: string, before: string, after: string) =>
      `${name} te ha ayudado menos últimamente (${before} a ${after}).`,
    medicationHelpedMore: (name: string, before: string, after: string) =>
      `${name} te ha ayudado más últimamente (${before} a ${after}).`,
    effectivenessDetail: (before: string, after: string) =>
      `Compara ${after} con el periodo anterior de la misma duración (${before}). Se cuenta la parte de tomas valoradas que ayudaron mucho o un poco.`,
    dayEventRelated: (name: string, hits: number, count: number, baseline: string) =>
      `Después de «${name}» tuviste migraña ese día o el siguiente ${hits} de ${count} veces. Otros días: ${baseline}.`,
    dayEventUnrelated: (name: string) =>
      `Después de «${name}» no tuviste migraña más a menudo de lo habitual.`,
    dayEventDetail: (name: string) =>
      `Se cuenta si una migraña empezó el día de «${name}» o el día siguiente, comparado con todos los demás días desde tu primer registro. Muestra un patrón, no una causa.`,
    menstrualPattern: (hits: number, cycles: number) =>
      `En ${hits} de ${cycles} ciclos tuviste migraña alrededor del inicio de la regla. Encaja con una migraña relacionada con la menstruación; háblalo con tu médica o médico.`,
    menstrualDetail:
      'Se revisan desde dos días antes hasta dos días después del primer día de la regla, como en la clasificación internacional de cefaleas (ICHD-3). El aviso aparece a partir de dos de cada tres ciclos, si la migraña es claramente más frecuente entonces que en el resto del ciclo.',
    fewerButStronger: (points: string) =>
      `Menos crisis, pero de media ${points} puntos más fuertes.`,
  },
  calendar: {
    title: 'Calendario',
    migraineDays: (n: number) => (n === 1 ? '1 día de migraña' : `${n} días de migraña`),
    backTo: (month: string) => `← ${month}`,
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    tapADay: 'Toca un día para ver los detalles',
    addMigraine: 'Añadir crisis',
    headacheDays: (n: number) =>
      n === 1 ? '1 día de dolor de cabeza' : `${n} días de dolor de cabeza`,
  },
  stats: {
    startPattern: {
      title: 'Cuándo empieza',
      dayParts: {
        night: 'Noche',
        morning: 'Mañana',
        afternoon: 'Tarde',
        evening: 'Noche temprana',
      },
    },
    title: 'Estadísticas',
    range: {
      label: 'Periodo',
      '1W': '1S',
      '1M': '1M',
      '3M': '3M',
      '6M': '6M',
      '1Y': '1A',
      '2Y': '2A',
      all: 'Todo',
    },
    painAxis: 'Intensidad (0–10)',
    series: {
      migraine: 'Migraña',
      headache: 'Dolor de cabeza',
      medication: 'Medicamento',
    },
    chartLabel: 'Días de migraña y días con medicación al mes',
    howCalculated: 'Cómo se calcula',
    migraineDayCount: (n: number) => (n === 1 ? '1 día de migraña' : `${n} días de migraña`),
    medicationDayCount: (n: number) =>
      n === 1 ? '1 día con medicación' : `${n} días con medicación`,
    averageMigraineDays: 'Ø días de migraña/mes',
    averageHeadacheDays: 'Ø días de dolor de cabeza/mes',
    headacheDayCount: (n: number) =>
      n === 1 ? '1 día de dolor de cabeza' : `${n} días de dolor de cabeza`,
    effectivenessRate: 'Ø eficacia',
    unrated: (n: number) => (n === 1 ? '1 sin valorar' : `${n} sin valorar`),
    averagePain: 'Ø intensidad',
    medicationDays: 'Días con medicación',
    overuseTitle: 'Posible uso excesivo de medicación',
    overuseText: (months: string, triptanDays: number, medicationDays: number) =>
      `${months}: ${triptanDays} o más días con triptanes o ${medicationDays} o más días con medicación al mes pueden hacer que los dolores de cabeza sean más frecuentes. Consúltalo con tu médica o médico.`,
    insights: 'Observaciones',
    preventions: 'Prevención en este periodo',
    since: (month: string) => `desde ${month}`,
    active: 'activa',
    preventionMigraineDays: (before: string, after: string, arrow: string) =>
      `Días de migraña/mes: ${before} ${arrow} ${after}`,
    preventionMedicationDays: (before: string, after: string, arrow: string) =>
      `Días con medicación/mes: ${before} ${arrow} ${after}`,
    preventionEffectDetail: (days: number, before: string, after: string) =>
      `${days} días antes del inicio (${before}) frente a ${days} días desde el efecto esperado (${after}), llevados a 30 días. Se cuentan los días de migraña y los días con medicación. El efecto esperado se indica en Perfil → Prevención.`,
    preventionChartLabel: 'Días de migraña cada 30 días antes, durante y después de la prevención',
    chartMarkers: { start: 'Inicio', effective: 'Efecto', end: 'Fin', lifeEvent: 'Cambio' },
    migraineDaysPerMonth: (value: string) => `${value} días de migraña/mes`,
    chartDetail:
      'Días de migraña cada 30 días. Claro: antes del inicio y después del fin. Intenso: durante la prevención. Discontinua: media antes del inicio. Toca una barra para ver su periodo.',
    lifeEvents: 'Cambios en este periodo',
    lifeEventEffectDetail: (days: number, before: string, after: string) =>
      `${days} días antes del cambio (${before}) frente a ${days} días después (${after}), llevados a 30 días. Se cuentan los días de migraña y los días con medicación.`,
    lifeEventChartLabel: 'Días de migraña cada 30 días antes y después del cambio',
    lifeEventChartDetail:
      'Días de migraña cada 30 días. Claro: antes del cambio. Intenso: después. Discontinua: media antes del cambio. Toca una barra para ver su periodo.',
    lifeEventGap: {
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'No hay datos antes del cambio.'
          : `Solo hay ${days} días registrados antes del cambio; hacen falta al menos ${min}.`,
      shortAfter: (days: number, min: number) =>
        `Solo han pasado ${days} días desde el cambio; hacen falta al menos ${min}.`,
    },
    shortComparison: (days: number) => `Solo se comparan ${days} días, así que no dice mucho.`,
    detailLabels: { comparison: 'Comparación', note: 'Nota', chart: 'Gráfico' },
    endReason: (reason: string) => `Motivo para dejarla: ${reason}`,
    effectGap: {
      noData: 'Aún no hay datos',
      effectiveAfterEnd: 'La fecha del efecto esperado es posterior a la fecha de fin.',
      shortBefore: (days: number, min: number) =>
        days === 0
          ? 'No hay datos antes del inicio.'
          : `Solo hay ${days} días registrados antes del inicio; hacen falta al menos ${min}.`,
      shortAfter: (days: number, min: number) =>
        `Solo hay ${days} días para comparar después del inicio; hacen falta al menos ${min}.`,
      shortAfterEffective: (days: number, min: number) =>
        `Solo hay ${days} días para comparar desde que debería hacer efecto; hacen falta al menos ${min}.`,
    },
  },
  intro: {
    next: 'Siguiente',
    skip: 'Saltar',
    start: 'Empezar',
    openGuide: 'Abrir la guía',
    pages: [
      {
        title: 'Te damos la bienvenida a Headly',
        text: 'Un diario de migraña tranquilo.',
        items: [
          [
            '🌀',
            'Basta con un toque',
            'Toca «Iniciar crisis» cuando empiece. Los detalles, después.',
          ],
          [
            '🔒',
            'Solo en este dispositivo',
            'Sin cuenta, sin nube. Haz una copia de seguridad de vez en cuando en Perfil.',
          ],
        ],
      },
      {
        title: 'Añadir a la pantalla de inicio',
        text: 'Se abre como una app, incluso sin conexión.',
        items: [
          [
            '🍎',
            'iPhone',
            'En Safari, toca Compartir (detrás de ⋯ si no se ve) y luego «Añadir a pantalla de inicio».',
          ],
          ['🤖', 'Android', 'En Chrome, toca ⋮ y luego «Instalar aplicación».'],
        ],
      },
      {
        title: '¿Datos en otras apps?',
        text: 'De una app, una hoja de cálculo, un PDF o fotos: un asistente de IA puede convertirlos para Headly. Hemos preparado un prompt para eso.',
        guide: true,
        items: [
          ['📋', 'Copia el prompt', 'En Perfil, en «Datos de otras apps».'],
          ['🤝', 'Compartes datos de salud', 'Con la empresa que está detrás del asistente.'],
        ],
      },
    ],
  },
  importGuide: {
    title: 'Datos de otras apps',
    rowHint: 'Convertir con un asistente de IA',
    intro:
      '¿Tienes registros antiguos en otra app, una hoja de cálculo, un PDF de tu médica o fotos de un diario en papel? Un asistente de IA como ChatGPT o Claude puede convertirlos en un archivo que Headly sabe importar.',
    warningTitle: 'Estás compartiendo datos de salud',
    warning:
      'Todo lo que subas llega a la empresa que está detrás del asistente, fuera de Headly. Revisa lo que compartes y quita lo que no haga falta, como nombres o direcciones. Headly nunca envía nada.',
    stepsTitle: 'Cómo funciona',
    steps: [
      'Copia el prompt de abajo.',
      'Abre tu asistente, pega el prompt y adjunta tus datos: un archivo exportado, una hoja de cálculo, un PDF, capturas de pantalla o fotos.',
      'Descarga el archivo headly-import.json que crea el asistente.',
      'En Perfil, toca «Importar datos», elige el archivo y luego «Combinar». Revisa después el resumen.',
    ],
    promptTitle: 'Prompt',
    copy: 'Copiar prompt',
    copied: 'Copiado',
    prompt: (timeZone: string) =>
      `Convierte mis datos de migraña adjuntos en un archivo de importación para la app Headly. Crea un archivo descargable llamado headly-import.json con exactamente esta estructura:

{
  "app": "headly",
  "schemaVersion": 6,
  "exportedAt": <ahora en tiempo Unix en milisegundos>,
  "data": {
    "attacks": [{ "id", "createdAt", "updatedAt", "kind"?, "startedAt", "endedAt", "painLevel"?, "symptomIds"? }],
    "medications": [{ "id", "createdAt", "updatedAt", "name", "dose"?, "isTriptan", "minIntervalHours"?, "archived": false }],
    "medicationIntakes": [{ "id", "createdAt", "updatedAt", "medicationId", "attackId"?, "takenAt", "effectiveness"? }],
    "preventions": [{ "id", "createdAt", "updatedAt", "name", "type", "dose"?, "startDate", "endDate"? }],
    "lifeEvents": [{ "id", "createdAt", "updatedAt", "name", "date" }],
    "dayEventTypes": [{ "id", "createdAt", "updatedAt", "name", "kind" }],
    "dayEvents": [{ "id", "createdAt", "updatedAt", "typeId", "date" }],
    "symptoms": []
  }
}

Reglas:
- Todas las horas (startedAt, endedAt, takenAt, createdAt, updatedAt, exportedAt) son tiempo Unix en milisegundos (13 cifras) en mi zona horaria ${timeZone}. Pon en createdAt y updatedAt la hora del registro.
- id: un texto único por registro, p. ej. "attack-1", "med-1", "intake-1".
- painLevel: número entero de 0 a 10. Convierte otras escalas, p. ej. leve = 3, moderado = 6, fuerte = 9.
- Pon siempre endedAt. Si no se conoce el fin, usa el final de ese día. Los registros de attacks no pueden solaparse.
- kind: "headache" para dolores de cabeza que no son migraña, p. ej. cefalea tensional. En la migraña, deja fuera kind.
- Cada medicamento solo una vez en medications. isTriptan es true para triptanes como sumatriptán o rizatriptán.
- medicationId apunta a un medicamento; attackId a la migraña durante la que se tomó, si la hay.
- effectiveness solo si se conoce: "strong" (mejoró mucho), "slight" (mejoró un poco), "none" (sin efecto), "worse" (empeoró).
- preventions: type es "medication" o "lifestyle"; fechas como "YYYY-MM-DD". lifeEvents son cosas como un trabajo nuevo o una mudanza, con "date" como "YYYY-MM-DD".
- symptomIds: lista de síntomas durante la migraña. Usa "aura", "nausea" (náuseas), "vomiting" (vómitos), "light" (sensibilidad a la luz) y "noise" (sensibilidad al ruido). Deja "symptoms" vacío.
- minIntervalHours solo si he mencionado un intervalo mínimo entre dos tomas.
- Regla: una entrada en dayEventTypes con kind "period" y name "Regla", y en dayEvents una entrada por el primer día de cada regla ("date" como "YYYY-MM-DD"). Otras cosas que se repiten, como vuelos, dormir poco o alcohol, igual con kind "custom".
- Deja fuera los campos que no conozcas. No escribas nunca null y no inventes nada.
- Después del archivo, enumera brevemente lo que no hayas podido convertir.`,
  },
  symptoms: {
    title: 'Síntomas',
    builtIn: {
      aura: 'Aura',
      nausea: 'Náuseas',
      vomiting: 'Vómitos',
      light: 'Sensibilidad a la luz',
      noise: 'Sensibilidad al ruido',
    },
    auraHint: 'Cambios antes en la vista, el tacto, el habla u otros sentidos',
    done: 'Listo',
    newSymptom: 'Síntoma propio',
    manageHint: 'Desactiva lo que no necesites. Toca un nombre para cambiarlo o eliminarlo.',
    count: (shown: number) => (shown === 1 ? '1 visible' : `${shown} visibles`),
    reportSummary: (items: string, total: number) => `Síntomas en ${total} migrañas: ${items}`,
    reportItem: (name: string, count: number) => `${name} ${count}`,
  },
  dayEvents: {
    hint: 'Pequeñas cosas del día, p. ej. un vuelo o la regla',
    title: 'Eventos',
    today: 'Hoy',
    label: 'Eventos',
    newTitle: 'Nuevo evento',
    period: 'Regla',
    periodHint:
      'Para «Regla» basta con tocar el primer día. Headly comprueba entonces si hay migraña menstrual.',
    suggestions: ['Vuelo', 'Madrugón', 'Poco sueño', 'Alcohol', 'Estrés'],
    ownName: 'O uno propio',
    addOwn: 'Añadir',
    count: (n: number) => (n === 1 ? '1 vez' : `${n} veces`),
    manageHint:
      'Desactiva lo que no estés registrando ahora; los días registrados se conservan. Toca un nombre para cambiarlo.',
    editTitle: 'Editar evento',
    deleteWarning: 'También elimina todos los días en los que se registró.',
  },
  knowledge: {
    title: 'Saber',
    articleCount: (n: number) => (n === 1 ? '1 artículo' : `${n} artículos`),
    disclaimer:
      'No es consejo médico. Habla siempre con tu médica o médico antes de cambiar tu medicación.',
    groups: {
      basics: 'Lo básico',
      alternatives: 'Enfoques alternativos',
      lesserKnown: 'Menos conocido',
    },
  },
  profile: {
    minInterval: 'Intervalo mínimo en horas (opcional)',
    minIntervalHint:
      'Del prospecto o de tu médica. Headly te muestra entonces cuándo puedes volver a tomarlo.',
    lifeEventsHint: 'Grandes cambios, p. ej. un trabajo nuevo o una mudanza',
    tracking: 'Lo que registro',
    otherHeadaches: 'Otros dolores de cabeza',
    otherHeadachesHint: 'Registrarlos aparte de la migraña, p. ej. cefalea tensional',
    help: 'Ayuda e información',
    display: 'Pantalla',
    backupAndRestore: 'Copia de seguridad',
    title: 'Perfil',
    backToProfile: 'Perfil',
    medications: 'Medicamentos',
    manageMedications: 'Gestionar medicamentos',
    medicationCount: (n: number) => (n === 1 ? '1 medicamento' : `${n} medicamentos`),
    newMedication: 'Nuevo medicamento',
    editMedication: 'Editar medicamento',
    name: 'Nombre',
    dose: 'Dosis (opcional)',
    isTriptan: 'Triptán',
    archive: 'Archivar',
    restore: 'Recuperar',
    archived: 'Archivados',
    preventions: 'Prevención',
    managePreventions: 'Gestionar prevención',
    preventionCount: (total: number, active: number) =>
      `${total === 1 ? '1 prevención' : `${total} prevenciones`} · ${active} ${active === 1 ? 'activa' : 'activas'}`,
    manageLifeEvents: 'Cambios',
    newLifeEvent: 'Nuevo cambio',
    editLifeEvent: 'Editar cambio',
    lifeEventHint: 'Por ejemplo un trabajo nuevo, una mudanza o dejar la píldora',
    lifeEventDate: 'Fecha',
    newPrevention: 'Nueva prevención',
    editPrevention: 'Editar prevención',
    preventionType: 'Tipo',
    preventionTypes: {
      medication: 'Medicamento',
      lifestyle: 'Estilo de vida',
    },
    startDate: 'Fecha de inicio',
    effectiveFrom: 'Debería hacer efecto desde (opcional)',
    effectiveFromHint:
      'Muchas prevenciones tardan 2–3 meses en hacer efecto. Sin fecha, cuenta la fecha de inicio.',
    endDate: 'Fecha de fin (opcional)',
    endReason: 'Motivo para dejarla (opcional)',
    activePreventions: 'Activas',
    pastPreventions: 'Anteriores',
    since: (date: string) => `desde ${date}`,
    active: 'activa',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirmDelete: '¿Eliminar de verdad?',
    data: 'Datos',
    exportData: 'Exportar datos',
    lastBackup: (days: number | undefined) =>
      days === undefined
        ? 'Aún no hay copia'
        : days === 0
          ? 'Última copia: hoy'
          : days === 1
            ? 'Última copia: hace 1 día'
            : `Última copia: hace ${days} días`,
    exported: 'Copia guardada',
    removeAppHint: 'Si quitas la app de la pantalla de inicio, se borran todos los datos.',
    importData: 'Importar datos',
    importHint: 'Restaurar una copia',
    backupReminder: 'Recordatorio de copia',
    backupReminderHint: 'En Inicio, después de 30 días',
    deleteAll: 'Borrar todos los datos',
    deleteAllHint: 'No se puede deshacer',
    intro: 'Introducción',
    introHint: 'Cómo funciona Headly',
    language: 'Idioma',
    theme: 'Apariencia',
    privacy: 'Política de privacidad',
    feedback: 'Comentarios y errores',
    feedbackSubject: (version: string) => `Headly ${version}: comentarios`,
    about: 'Sobre Headly',
    version: (version: string) => `Versión ${version}`,
    aboutText:
      'Headly es un diario de migraña tranquilo. Todos los datos se quedan en tu navegador, en este dispositivo: sin cuenta, sin servidor, sin seguimiento.',
    disclaimer: 'Headly no es un producto sanitario y no sustituye el consejo médico.',
    pdfExport: 'Exportar PDF',
    pdfExportHint: 'Para tu médica o médico',
  },
  backup: {
    importTitle: 'Importar copia',
    fileContains: (counts: string) => `Esta copia contiene ${counts}.`,
    counts: ({
      attacks,
      medications,
      medicationIntakes,
      preventions,
      lifeEvents,
      dayEvents,
    }: BackupCounts) =>
      [
        attacks === 1 ? '1 migraña' : `${attacks} migrañas`,
        medications === 1 ? '1 medicamento' : `${medications} medicamentos`,
        medicationIntakes === 1 ? '1 toma' : `${medicationIntakes} tomas`,
        preventions === 1 ? '1 prevención' : `${preventions} prevenciones`,
        lifeEvents === 1 ? '1 cambio' : `${lifeEvents} cambios`,
        dayEvents === 1 ? '1 evento' : `${dayEvents} eventos`,
      ].join(', '),
    merge: 'Combinar',
    mergeHint: 'Añade registros nuevos y actualiza los que han cambiado.',
    replace: 'Reemplazar todo',
    replaceHint: 'Primero borra todos los registros actuales.',
    confirmReplace: '¿Reemplazar todo de verdad?',
    imported: (counts: string) => `Importado: ${counts}.`,
    done: 'Listo',
    errors: {
      invalidFile: 'Este archivo no es una copia de Headly o está dañado. No se ha cambiado nada.',
      newerVersion:
        'Esta copia es de una versión más nueva de Headly. Actualiza primero la app. No se ha cambiado nada.',
    },
    reminder: 'Tus datos solo están guardados en este dispositivo.',
    backUpNow: 'Hacer copia ahora',
    later: 'Más tarde',
    deleteAllTitle: 'Borrar todos los datos',
    deleteAllText:
      'Se borrarán de este dispositivo todas las migrañas, medicamentos, tomas y prevenciones. Si quieres conservarlos, exporta antes una copia.',
    deleteAll: 'Borrar todos los datos',
    confirmDeleteAll: '¿Borrar todo de verdad?',
  },
  report: {
    months: { '3M': '3 meses', '6M': '6 meses' },
    rangeLabel: 'Periodo',
    hint: 'Crea una tabla con una fila por día y abre el menú de impresión. Desde ahí puedes guardarla como PDF o compartirla.',
    create: 'Crear PDF',
    heading: 'Informe de migraña',
    period: (range: string) => `Periodo: ${range}`,
    month: 'Mes',
    attacks: 'Crisis',
    intakes: 'Tomas de medicamentos',
    date: 'Fecha',
    migraine: 'Migraña',
    headaches: 'Dolores de cabeza',
    kind: 'Tipo',
    yes: 'Sí',
    helped: 'Ayudó',
  },

  painScale: {
    label: 'Intensidad del dolor',
    low: 'sin dolor',
    high: 'insoportable',
    question: '¿Cuánto duele?',
  },
  dev: {
    title: 'Componentes',
    buttons: 'Botones',
    card: 'Tarjeta',
    cardText: 'Las tarjetas agrupan contenido relacionado sobre el color de superficie.',
    painScale: 'Escala de dolor',
    segmentedControl: 'Control segmentado',
    toggleChips: 'Chips',
    bottomSheet: 'Hoja inferior',
    openSheet: 'Abrir hoja',
    migraineDays: (n: number) => (n === 1 ? '1 día de migraña' : `${n} días de migraña`),
  },
};
