// Nuevos templates de prompts más específicos para diferentes tipos de análisis

export const promptTemplates = {
  // Template para análisis legislativo
  legislative: `
Analiza esta noticia sobre legislación desde la perspectiva del partido {party}:

{newsDetails}

INSTRUCCIONES:
1. Identifica las implicaciones específicas de esta ley/proyecto para diferentes sectores
2. Analiza cómo afecta a las prioridades políticas del partido {party}
3. Menciona precedentes legislativos relevantes
4. Evalúa los posibles efectos a corto y largo plazo
5. Sugiere una postura concreta y acciones específicas
6. Relaciona con el programa político del partido pero adaptado a ESTE caso específico

Genera un análisis detallado y específico para esta noticia legislativa.
  `,

  // Template para análisis económico
  economic: `
Analiza esta noticia económica desde la perspectiva del partido {party}:

{newsDetails}

INSTRUCCIONES:
1. Identifica los indicadores económicos específicos mencionados
2. Analiza el impacto en diferentes sectores productivos y sociales
3. Evalúa las causas estructurales y coyunturales de la situación
4. Relaciona con políticas económicas previas o propuestas
5. Sugiere medidas concretas alineadas con la visión económica del partido
6. Menciona datos específicos de la noticia en tu análisis

Genera un análisis económico detallado y específico para esta noticia.
  `,

  // Template para análisis de política internacional
  international: `
Analiza esta noticia de política internacional desde la perspectiva del partido {party}:

{newsDetails}

INSTRUCCIONES:
1. Identifica los actores internacionales clave y sus intereses
2. Analiza las implicaciones para Argentina y la región
3. Evalúa el alineamiento con la política exterior propuesta por el partido
4. Considera aspectos geopolíticos, comerciales y diplomáticos específicos
5. Sugiere un posicionamiento concreto frente a esta situación particular
6. Menciona precedentes históricos relevantes si aplican

Genera un análisis de política internacional detallado y específico para esta noticia.
  `,

  // Template para análisis social
  social: `
Analiza esta noticia sobre temas sociales desde la perspectiva del partido {party}:

{newsDetails}

INSTRUCCIONES:
1. Identifica los grupos sociales afectados y cómo
2. Analiza las causas estructurales del problema social específico
3. Evalúa las políticas actuales relacionadas con este tema concreto
4. Relaciona con la visión de justicia social del partido
5. Sugiere medidas específicas para abordar este problema particular
6. Menciona datos o testimonios específicos de la noticia

Genera un análisis social detallado y específico para esta noticia.
  `,

  // Template para análisis ambiental
  environmental: `
Analiza esta noticia ambiental desde la perspectiva del partido {party}:

{newsDetails}

INSTRUCCIONES:
1. Identifica el impacto ambiental específico y sus causas
2. Analiza los actores involucrados (empresas, gobierno, comunidades)
3. Evalúa las políticas ambientales actuales relacionadas con este caso
4. Relaciona con la visión de desarrollo sostenible del partido
5. Sugiere medidas concretas para abordar este problema ambiental específico
6. Menciona datos científicos o técnicos relevantes de la noticia

Genera un análisis ambiental detallado y específico para esta noticia.
  `,
}

// Función para seleccionar el template adecuado según la categoría y subcategoría
export function selectPromptTemplate(category: string, subcategory?: string): string {
  if (category === "politics" || subcategory === "legislative" || subcategory === "judicial") {
    return promptTemplates.legislative
  } else if (
    category === "business" ||
    category === "economy" ||
    subcategory === "fiscal" ||
    subcategory === "monetary"
  ) {
    return promptTemplates.economic
  } else if (subcategory === "diplomatic" || category === "international") {
    return promptTemplates.international
  } else if (category === "health" || category === "education" || subcategory === "social" || subcategory === "labor") {
    return promptTemplates.social
  } else if (
    category === "environment" ||
    subcategory === "climate" ||
    subcategory === "conservation" ||
    subcategory === "pollution"
  ) {
    return promptTemplates.environmental
  }

  // Template por defecto
  return promptTemplates.legislative
}

// Función para preparar el prompt con los detalles específicos
export function preparePrompt(template: string, party: string, newsItem: any): string {
  const newsDetails = `
Título: ${newsItem.title}
Resumen: ${newsItem.summary || "No disponible"}
Fuente: ${newsItem.source}
Categoría: ${newsItem.category}
Subcategoría: ${newsItem.subcategory || "No especificada"}
Tipo de noticia: ${newsItem.newsType || "Estándar"}
Contexto: ${newsItem.context || "No disponible"}
Fecha de publicación: ${newsItem.publishedAt || "No disponible"}
  `

  return template.replace("{party}", party).replace("{newsDetails}", newsDetails)
}
