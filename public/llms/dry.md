# DRY

> Cada pieza de conocimiento debe tener una única, inequívoca y autoritativa representación dentro de un sistema.

Cada pieza de conocimiento debe tener una única representación. El riesgo no es el copy-paste: es la divergencia silenciosa cuando algo cambia en un lugar pero no en los otros.

## Concepto

¿Qué significa DRY?

Una sola fuente de verdad

DRY viene de _The Pragmatic Programmer_ (Hunt & Thomas, 1999) y dice que **cada pieza de conocimiento del sistema debe tener una única representación**. Cuando algo cambia, debería cambiar en un solo lugar. Si cambia en varios, alguno se va a olvidar.

> 🗺️ Imaginá que el precio de un producto está hardcodeado en la página de listado, en el carrito, en el email de confirmación y en la factura. Cuando el precio cambia, hay que actualizar cuatro lugares. Y siempre hay uno que se olvida. _DRY dice: el precio vive en un solo lugar; todos los demás lo leen de ahí._
> 📖 DRY no habla solo de código duplicado. Habla de **conocimiento duplicado**: la misma lógica de negocio en dos lugares, la misma validación en el frontend y el backend sin compartir la fuente, la misma estructura de datos definida dos veces. _El riesgo no es el copy-paste, es la divergencia silenciosa._
> **TIP:** **La pregunta clave de DRY** "Si esta regla cambia, ¿en cuántos lugares tengo que cambiar código?" Si la respuesta es más de uno, probablemente estás violando DRY. El objetivo es que la respuesta siempre sea exactamente uno.

## En el código

DRY en el código

El problema real no es el copy-paste, es la sincronización

La duplicación de código es un síntoma. El problema de fondo es que cuando la lógica cambia en un lugar pero no en el otro, el sistema queda en un **estado inconsistente que es difícil de detectar**.

Viola DRY — lógica repetida

```js
function createOrder(items) {
  const total = items
    .reduce((s, i) => s + i.price, 0)
  const tax = total * 0.21
  return { total, tax }
}

function createQuote(items) {
  const total = items
    .reduce((s, i) => s + i.price, 0)
  const tax = total * 0.21
  // IVA duplicado en dos lugares
  return { total, tax, valid: true }
}
```

Respeta DRY

```js
const TAX_RATE = 0.21

function calcTotals(items) {
  const total = items
    .reduce((s, i) => s + i.price, 0)
  return { total, tax: total * TAX_RATE }
}

function createOrder(items) {
  return calcTotals(items)
}
function createQuote(items) {
  return { ...calcTotals(items), valid: true }
}
```

Viola DRY — schema duplicado

```
// En la BD (migration)
users: name VARCHAR(100)

// En el backend (validación)
if (name.length > 100) error()

// En el frontend (form)
maxlength="100"

// La regla "100 chars" vive
// en 3 lugares distintos 😬
```

Respeta DRY

```js
// Una fuente de verdad
const USER_SCHEMA = {
  name: { maxLength: 100 }
}

// Backend lee de ahí
validate(name, USER_SCHEMA.name)

// Frontend genera el form
// a partir de USER_SCHEMA ✓
renderForm(USER_SCHEMA)
```

> **TIP:** **DRY aplica también a configuración y documentación** Una constante mágica como `0.21` hardcodeada en tres archivos es una violación de DRY. Una descripción de API que existe tanto en el código como en un documento Word separado también lo es. Cuando algo cambie, uno de los dos va a quedar desactualizado.

## DRY vs WET vs DAMP

DRY, WET y DAMP

No toda duplicación es mala

DRY tiene dos opuestos conocidos. **WET** (Write Everything Twice) es la violación directa. **DAMP** (Descriptive And Meaningful Phrases) es una alternativa deliberada para contextos donde la claridad importa más que la deduplicación —especialmente en tests.

DRY

Don't Repeat Yourself

Una sola fuente de verdad para cada pieza de conocimiento. Cambios en un lugar se propagan automáticamente. _Ideal para lógica de negocio, validaciones, esquemas._

WET

Write Everything Twice

Código duplicado sin justificación. Cuando la lógica cambia, hay que recordar actualizar cada copia. La fuente de innumerables bugs silenciosos. _Siempre es un problema._

DAMP

Descriptive And Meaningful Phrases

Duplicación aceptada cuando hace el código más legible. _Especialmente en tests:_ un test debe poder leerse sin saltar a helpers externos. La claridad tiene más valor que la deduplicación.

DRY extremo en tests — problema

```js
// Helper compartido, "DRY"
function makeUser(overrides) {
  return { id: 1, role: 'user', ...overrides }
}

test('admin can delete', () => {
  const u = makeUser({ role: 'admin' })
  // ¿Qué tiene este usuario?
  // Hay que ir a leer makeUser()
})
```

DAMP en tests — preferible

```js
test('admin can delete', () => {
  const user = {
    id: 42,
    role: 'admin',
    active: true
  }
  // Todo el contexto está acá,
  // el test se lee solo ✓
  expect(canDelete(user)).toBe(true)
})
```

> **TIP:** **Regla práctica** Usá DRY en código de producción: lógica de negocio, validaciones, constantes, esquemas. Usá DAMP en tests: cada test debería ser autocontenido y legible sin contexto externo. Los tests son documentación —la claridad es más importante que evitar la repetición.

## Trampas

Trampas comunes

DRY mal aplicado crea acoplamiento innecesario

El error más común con DRY es **abstraer demasiado temprano** basándose en similitud de código, cuando en realidad son dos conceptos distintos que hoy se parecen pero van a divergir. La deduplicación incorrecta crea acoplamiento entre cosas que deberían ser independientes.

-   🪤
    
    **Abstraer por similitud de código, no de concepto** Dos funciones que hacen cosas parecidas hoy no necesariamente representan el mismo conocimiento. Si el código de "calcular descuento para cliente VIP" y "calcular descuento en liquidación" se parece, no las unas en una función genérica: cuando los criterios de uno cambien, van a afectar al otro.
    
-   🔗
    
    **Crear acoplamiento entre módulos no relacionados** Para evitar repetir código, a veces se crea una función utilitaria compartida entre dos módulos que no deberían conocerse. El resultado es que cambiar esa utilidad afecta a ambos, y los módulos quedan acoplados por accidente.
    
-   🌀
    
    **La abstracción prematura por la regla de tres** Hay una heurística popular que dice "cuando copias algo por tercera vez, abstraelo". Es razonable como punto de partida, pero el número de copias no determina si algo merece una abstracción —lo determina si representan el mismo conocimiento o no.
    
-   🧩
    
    **Un helper que hace demasiado para evitar repetición** A veces se agregan parámetros a una función existente para reutilizarla en un nuevo contexto, en vez de crear una nueva función. El resultado es una función con muchas responsabilidades y lógica condicional compleja. Dos funciones simples son mejores que una función flexible.
    
-   📋
    
    **Ignorar DRY en la documentación y configuración** DRY se viola constantemente fuera del código: la misma información en el README, en la wiki y en los comentarios del código. Cuando algo cambia, las tres fuentes divergen y ninguna es confiable. Una sola fuente de verdad, con links desde las otras.
