# KISS — Keep It Simple, Stupid

> La solución más simple que funciona casi siempre es la correcta. La complejidad innecesaria es deuda técnica disfrazada de sofisticación.

La solución más simple que funciona es casi siempre la correcta. El código que no existe no puede tener bugs. El freno natural contra la sobreingeniería antes de que empiece.

## Concepto

¿Qué significa KISS?

La simplicidad es una feature, no una limitación

KISS es un principio de diseño que dice que los sistemas funcionan mejor cuando son simples. Surgió en la ingeniería aeronáutica de la Navy de EE.UU. en los años 60 y fue adoptado por el desarrollo de software porque aplica perfectamente: **el código que no existe no puede tener bugs**, y el código simple es más fácil de leer, testear y modificar.

> ✏️ Un lápiz resuelve el problema de escribir en el espacio igual que un bolígrafo de tinta especialmente presurizado. La NASA usó el segundo. Los rusos usaron el lápiz. _La solución correcta no es la más sofisticada, sino la más adecuada al problema._
> 🗓️ El código que escribís hoy lo va a leer alguien —probablemente vos mismo— dentro de seis meses a las 11 de la noche intentando arreglar un bug en producción. _Escribí para ese momento, no para impresionar en una entrevista._
> **TIP:** **La pregunta clave** Antes de agregar una abstracción, un patrón o una capa nueva, preguntate: _¿esto resuelve un problema real que tengo ahora, o un problema imaginario que podría tener en el futuro?_ Si es lo segundo, probablemente estás violando KISS —y también YAGNI.

## En el código

KISS en el código

Simple no significa trivial

Código simple no es código corto ni código sin estructura. Es código cuya intención se entiende de inmediato. **La complejidad accidental** es la que aparece cuando sobre-diseñamos o cuando resolvemos el problema equivocado.

Viola KISS

```js
// ¿Qué hace esto?
const result = data
  .filter(x => !x.d)
  .reduce((a, c) =>
    ({...a, [c.k]: [...(a[c.k]||[]), c.v]}),
  {})

// Hay que ejecutarlo en la mente
// para saber qué hace 🤯
```

Respeta KISS

```js
// Filtrá los activos
const activeItems = data
  .filter(item => !item.deleted)

// Agrupalos por categoría
const byCategory = {}
for (const item of activeItems) {
  const key = item.category
  byCategory[key] ??= []
  byCategory[key].push(item.value)
}
```

Viola KISS — sobre-abstracción

```
class UserValidatorFactoryStrategy {
  createValidator(type) {
    return new ValidatorFactory()
      .getStrategy(type)
      .build()
  }
}
// Tres clases para validar
// un email 🙃
```

Respeta KISS

```js
function isValidEmail(email) {
  return email.includes('@')
    && email.includes('.')
}

// Fácil de leer, fácil de
// testear, fácil de cambiar ✓
```

> **TIP:** **Regla de los tres segundos** Si después de leer una función por tres segundos no sabés qué hace, es demasiado compleja. Renombrá variables, extraé funciones auxiliares con nombres descriptivos, o dividí en pasos explícitos.

## Reglas

Reglas prácticas

Guías concretas para aplicar KISS

KISS no es una regla con forma de código. Es una **actitud de diseño** que se aplica en cada decisión: cómo nombrás una variable, cuántas capas tiene tu arquitectura, qué tanto abstraés antes de tiempo.

01

Una función, una tarea

Si una función necesita la conjunción "y" para describirse, hace demasiado. `validateAndSave()` debería ser dos funciones.

02

Nombres que explican la intención

Una variable llamada `x` o `d` obliga a quien lee a ejecutar el código en la mente. `deletedAt` no necesita comentario.

03

Menos capas de abstracción

Cada capa de abstracción es un costo cognitivo. Agregala solo cuando el beneficio —reuso, testabilidad, flexibilidad real— supera ese costo.

04

Preferí el flujo lineal

Un bloque de código que se lee de arriba a abajo sin saltar entre archivos es más simple que diez clases bien encapsuladas que hacen exactamente lo mismo.

05

Estructuras de datos planas

Un objeto con dos niveles de anidamiento es más fácil de manejar que uno con cinco. Si necesitás cinco niveles, probablemente el modelo de datos tiene un problema.

06

Código borrable > código flexible

El mejor código no es el más reutilizable, sino el más fácil de reemplazar cuando los requisitos cambian. La flexibilidad anticipada casi nunca apunta en la dirección correcta.

> **TIP:** **El test del colega** Mostrále tu función a un colega sin contexto. Si en 30 segundos no puede decirte qué hace, la función viola KISS. El objetivo es código que se explica solo —el comentario más claro es no necesitar comentarios.

## Trampas

Trampas comunes

KISS mal entendido también tiene costos

KISS no significa "escribí el código más corto posible" ni "no uses patrones". Hay formas muy comunes de violar KISS sin darse cuenta, **generalmente por querer demostrar habilidad técnica** o por anticipar problemas que nunca van a ocurrir.

-   🧠
    
    **Código inteligente en lugar de código claro** Un one-liner con encadenamiento de métodos, comprensiones de lista anidadas o bit manipulation puede ser impresionante. También puede ser incomprensible. El objetivo es comunicar, no demostrar.
    
-   🏗️
    
    **Arquitectura para un sistema 10x más grande** Diseñar microservicios, event sourcing y CQRS para una app que tiene 50 usuarios activos es complejidad accidental pura. La arquitectura correcta es la mínima que soporta los requisitos actuales más un margen razonable.
    
-   📦
    
    **Patrones de diseño como solución a todo** Un Factory, un Decorator o un Observer tienen su lugar. Usados sin un problema concreto que justifique su complejidad, añaden capas de indirección que hacen el código más difícil de seguir, no más flexible.
    
-   🔄
    
    **Confundir KISS con código sin estructura** KISS no es excusa para escribir funciones de 400 líneas o archivos con todo mezclado. La estructura que ayuda a entender el código —separación en módulos, nombres claros, funciones cortas— es precisamente lo que hace el código simple.
    
-   ⚙️
    
    **Optimizar antes de medir** El código optimizado prematuramente casi siempre es más complejo y menos legible. Escribí la versión simple primero, medí dónde está el cuello de botella real, y optimizá solo eso.

## Origen del principio

KISS fue formulado por **Kelly Johnson**, ingeniero aeronáutico de Lockheed, en la década de 1960. La idea era que los aviones de combate debían poder ser reparados en condiciones de campo con herramientas básicas. En software, la frase se popularizó en los años 70 y es hoy uno de los principios más citados en ingeniería de software, junto a DRY y YAGNI.

## Solo aplica a código?

No. KISS aplica en cualquier nivel de decisión técnica.

> Código · Arquitectura · APIs · Bases de datos · UX / interfaces

