# Fail Fast

> Cuando algo está mal, el sistema debería decirlo de inmediato y de forma ruidosa. Un bug que explota en el momento exacto en que ocurre es exponencialmente más barato que uno que se descubre tres pasos después.

Cuando algo está mal, el sistema debería decirlo de inmediato y de forma ruidosa. El costo de un fallo crece exponencialmente con la distancia entre dónde ocurre y dónde se detecta.

## Concepto

¿Qué es Fail Fast?

Fallá pronto · Fallá fuerte · Fallá claro

Fail Fast dice que cuando el sistema detecta una condición inválida, debería **fallar de inmediato y de manera visible**, en lugar de continuar con un estado potencialmente corrupto que va a causar errores mucho más difíciles de diagnosticar más adelante.

El principio fue articulado por **Jim Shore en 2004** en IEEE Software. La idea central: **el costo de un fallo crece exponencialmente con la distancia entre dónde ocurre el problema y dónde se detecta**. Detectar temprano es barato. Detectar tarde es catastrófico.

Costo del fallo según cuándo se detecta

Fail Fast

falla

→ stack trace exacto, estado conocido, fácil de reproducir

costo bajo

Fallo tardío

ejecuta...

corrompe...

falla lejos

costo alto

Fallo silencioso

ejecuta...

datos malos...

se propagan...

costo enorme

> 🏗️ En construcción, cuando un ladrillo está mal colocado, mejor descubrirlo ahora que cuando el edificio tiene diez pisos arriba. El costo de reparar la cimentación crece con cada capa que se agrega encima. _El mismo principio aplica a los bugs: cuanto más tarde se detectan, más código construiste encima del error._
> 🩺 Un sistema que no falla ruidosamente cuando tiene un problema es como un paciente que no siente dolor cuando debería. El dolor es una señal de alarma del cuerpo —molesta, pero es mucho mejor que no sentirlo y que la enfermedad progrese sin síntomas. _Las excepciones son el dolor del software._
> **TIP:** **La regla de Jim Shore** "Comprobá frecuentemente, fallá ruidosamente, no continúes con estado inválido." Un sistema que detecta un problema y sigue ejecutando como si no hubiera pasado nada es mucho más peligroso que uno que se detiene inmediatamente. El primero corrompe datos; el segundo solo interrumpe.

## Cuándo aplicar

¿Cuándo aplicar Fail Fast?

Las cuatro señales de alarma que deben fallar pronto

Fail Fast no significa lanzar excepciones por todo. Significa identificar los **puntos críticos donde un estado inválido no debería propagarse** y cortarlo ahí. Hay cuatro categorías principales donde siempre aplica.

01 — Precondiciones

Validar entradas al inicio de cada función

Antes de ejecutar cualquier lógica, verificar que los argumentos son válidos. Si no lo son, _fallar de inmediato_ con un mensaje claro que diga exactamente qué está mal y dónde.

✓ if (!userId) throw new Error('userId requerido')  
✓ if (amount <= 0) throw new Error('amount > 0')

02 — Bordes del sistema

Validar todo lo que entra desde afuera

HTTP requests, archivos, mensajes de queues, respuestas de APIs externas. Todo lo que viene de afuera del sistema es no confiable. _Validar en el borde, antes de que los datos lleguen al dominio._

✗ aceptar JSON sin parsear ni validar schema  
✓ validar con Zod/Joi/Pydantic en el controller

03 — Invariantes de dominio

Reglas que nunca deben violarse

Las condiciones que el sistema asume que siempre son verdaderas. Si se violan, hay un bug —no una condición de negocio. _Usar assertions para detectarlos en el momento exacto en que ocurren._

✓ assert(items.length > 0, 'order sin items')  
✓ assert(total >= 0, 'total negativo')

04 — Errores de configuración

Fallar al inicio, no en runtime

Si falta una variable de entorno, una clave de API o una conexión a base de datos, _fallar inmediatamente al arrancar_, no cuando el primer usuario intenta hacer algo y recibe un error críptico.

✗ leer process.env.API\_KEY cuando se usa  
✓ verificar todas las vars al inicio del proceso

> 🛫 Un avión no despega con un motor defectuoso esperando que "quizás no sea tan grave". La verificación pre-vuelo es un Fail Fast sistemático. _Es preferible cancelar el vuelo en tierra que descubrir el problema a 10.000 metros de altura._
> **TIP:** **El punto de validación correcto** Fail Fast no significa validar en todos los niveles del sistema. Significa validar _en el punto más cercano a la fuente del dato_. Los datos externos se validan en el borde. Las precondiciones de una función se validan al entrar. Los invariantes se verifican donde se modifica el estado. No repitas la validación en cada capa —eso viola DRY.

## En el código

Fail Fast en el código

Guard clauses, assertions y validación en el borde

Fail Fast se implementa con tres herramientas principales: **guard clauses** que cortan el flujo temprano, **assertions** que verifican invariantes en desarrollo, y **validación de schema** en las fronteras del sistema.

Fallo tardío y silencioso

```js
function processOrder(order) {
  // no validamos nada
  const total = order.items
    .reduce((s, i) => s + i.price, 0)

  // si order.customer es null:
  // falla acá con un error
  // que no dice nada útil 💥
  sendEmail(order.customer.email)

  saveToDb(total, order.customer.id)
}
```

Fail Fast — guard clauses

```js
function processOrder(order) {
  // validamos antes de empezar
  if (!order)
    throw new Error('order requerida')
  if (!order.customer?.email)
    throw new Error('email de cliente falta')
  if (!order.items?.length)
    throw new Error('orden sin items')

  // ahora el flujo principal
  // trabaja con datos válidos ✓
}
```

Config que falla tarde

```js
async function sendEmail(to, body) {
  // se lee cuando se usa
  const key = process.env.SENDGRID_KEY

  // si KEY no existe, falla acá
  // cuando el primer email se envía
  // quizás horas después del deploy 💥
  await sendgrid.send({ to, body, key })
}
```

Config que falla al arrancar

```js
// al inicio del proceso
const REQUIRED_VARS = [
  'SENDGRID_KEY', 'DATABASE_URL',
  'JWT_SECRET', 'APP_PORT'
]

for (const v of REQUIRED_VARS) {
  if (!process.env[v])
    throw new Error(`Falta: ${v}`)
}
// si llegamos acá, todo OK ✓
```

Retornar null — fallo diferido

```js
function findUser(id) {
  const user = db.query(id)
  if (!user) return null // 😬
  return user
}

// Quien llama recibe null y
// si no lo chequea, el
// NullPointerException aparece
// tres llamadas después 💥
```

Lanzar excepción — fallo inmediato

```js
function findUser(id) {
  const user = db.query(id)
  if (!user)
    throw new UserNotFoundError(id)
  return user // siempre válido ✓
}

// El error ocurre exactamente
// donde está el problema
// con un mensaje descriptivo ✓
```

> **TIP:** **Excepciones descriptivas, no genéricas** `throw new Error('error')` viola el espíritu de Fail Fast aunque técnicamente falle pronto. El mensaje debe decir _qué_ salió mal, _dónde_ y con _qué valor_. ``throw new Error(`userId inválido: esperado string, recibido ${typeof userId}`)`` es un fallo rápido útil. El error genérico es solo un fallo rápido ruidoso.

## Fail Fast vs Fail Safe

Fail Fast vs Fail Safe

No son opuestos — son herramientas para contextos distintos

Fail Safe es el otro extremo: diseñar el sistema para que, cuando algo falla, **degrade de forma controlada** en lugar de detenerse completamente. No son contradictorios —son complementarios y se aplican en capas distintas del sistema.

Fail Fast

Fallar inmediato y visible

Detectar el problema **en el momento en que ocurre** y reportarlo ruidosamente. El objetivo es que los errores sean obvios y fáciles de diagnosticar, especialmente en desarrollo.  
  
Prioriza la _integridad del sistema_ sobre la disponibilidad. Preferible que el sistema se detenga antes de continuar con datos corruptos.

→ Validación de precondiciones

→ Assertions de invariantes

→ Verificación de configuración al inicio

→ Lanzar excepción en lugar de retornar null

Fail Safe

Degradar de forma controlada

Diseñar para que cuando un componente falle, el sistema completo **siga funcionando de forma degradada** en lugar de colapsar. El objetivo es la resiliencia del sistema ante fallos inevitables.  
  
Prioriza la _disponibilidad_. Acceptable que algunas features fallen si el sistema sigue parcialmente operativo.

→ Circuit breakers en servicios externos

→ Fallback a caché si la BD no responde

→ Retry con backoff exponencial

→ Valores por defecto cuando un servicio falla

Contexto

Estrategia

Razonamiento

Bug de programación (null inesperado, tipo incorrecto)

Fail Fast

Es un bug —necesita ser detectado y corregido, no ignorado

Configuración inválida al arrancar

Fail Fast

El sistema no puede funcionar correctamente sin config válida

Servicio externo temporalmente caído

Fail Safe

Es una condición de red, no un bug. El sistema debería degradar

Feature no crítica con error

Fail Safe

No tiene sentido bajar todo el sistema por una feature secundaria

Input inválido de usuario

Ambos

Fail Fast para detectar el error, Fail Safe para mostrar un mensaje amigable

Datos corruptos en base de datos

Fail Fast

Datos inválidos no deben propagarse —mejor detener y alertar

> **TIP:** **La regla de las capas** Fail Fast aplica en el _interior_ del sistema: en las funciones, los servicios, el dominio. Fail Safe aplica en las _fronteras externas_: la comunicación con servicios de terceros, los recursos de red, las integraciones. El núcleo falla fuerte para que los bugs sean obvios; el borde falla con gracia para que los problemas externos no colapsen todo.

## Trampas

Trampas comunes

Las formas en que los bugs se vuelven invisibles

Violar Fail Fast casi siempre parece **la opción más segura** en el momento. Retornar null en lugar de lanzar, capturar la excepción para que "no moleste", devolver un valor por defecto "razonable". Estas decisiones vuelven los bugs invisibles hasta que el daño ya está hecho.

-   🔇
    
    **Swallowing exceptions — tragar el error** El antipatrón más dañino. Un bloque `try/catch` que captura la excepción y no hace nada con ella —o solo loguea "algo salió mal"— convierte un fallo ruidoso en uno silencioso. El sistema continúa en un estado inválido y el bug aparece mucho después, irreconocible.
    
    ✗ try { ... } catch (e) { console.log('error') }  
    ✓ try { ... } catch (e) { throw new AppError('contexto', e) }
    
-   👻
    
    **Retornar null, -1 o "" como señal de error** Retornar `null` cuando no se encuentra algo, `-1` cuando falla un índice, o `""` cuando falta un valor transfiere la responsabilidad de detectar el error al llamador —que quizás no lo chequea. La excepción falla en el origen; el `null` falla tres llamadas después con un NullPointerException sin contexto.
    
-   🧢
    
    **Valores por defecto que ocultan errores de configuración** `const timeout = process.env.TIMEOUT ?? 5000` parece prudente. Pero si `TIMEOUT` debería estar configurado y no lo está, el valor por defecto enmascara una mala configuración. El sistema funciona con un timeout incorrecto sin que nadie se entere. La alternativa es fallar al inicio si la variable es obligatoria.
    
-   🌊
    
    **Continuar después de detectar un estado inválido** Verificar que algo está mal y seguir de todas formas: `if (!user) { log('user not found'); return user; }` —el log dice que el usuario no existe, pero se retorna `undefined` de todos modos. El código que llama recibe `undefined` y falla más tarde. Si el estado es inválido, _no continúes_.
    
-   🔄
    
    **Validar solo en desarrollo, no en producción** Deshabilitar assertions o validaciones en producción "por performance" es una forma de Fail Slow selectivo. Los bugs que solo se manifiestan en producción —con datos reales, bajo carga real— son los más difíciles de diagnosticar. Las assertions tienen un costo mínimo y salvan horas de debugging.
    
-   📨
    
    **Mensajes de error sin contexto** `throw new Error('invalid input')` es Fail Fast en forma pero no en espíritu. Un error útil dice: qué valor recibió, qué esperaba, en qué función, con qué parámetros. ``throw new Error(`amount debe ser positivo, recibido: ${amount} en processPayment(orderId=${orderId})`)`` lleva al bug en segundos.
