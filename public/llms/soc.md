# SoC

> Cada parte del sistema debería ocuparse de una sola preocupación. Separar el <em>qué</em> del <em>cómo</em> del <em>cuándo</em> es la diferencia entre código que escala y código que colapsa.

Cada unidad de código debería ocuparse de una sola preocupación. Separá el qué del cómo del cuándo. Es el principio más fundamental del diseño de software.

## Concepto

¿Qué es Separation of Concerns?

Una preocupación, un lugar

SoC dice que cada módulo, clase o función debería tener **una única preocupación**: una dimensión del problema que resuelve. Una "preocupación" es cualquier aspecto del sistema que tiene razones propias para cambiar - la lógica de negocio, la presentación, el acceso a datos, la orquestación.

Es el principio más fundamental del diseño de software. SRP de SOLID es SoC aplicado a clases. Los principios de cohesión de paquetes son SoC aplicado a módulos. MVC, Clean Architecture y Hexagonal son SoC aplicado a la arquitectura entera.

> 📺 Un televisor separa perfectamente sus preocupaciones: el sintonizador recibe la señal, el procesador la decodifica, el panel la muestra, el parlante emite el audio. Cada componente puede mejorarse o reemplazarse sin tocar los otros. _Si todo estuviera mezclado en un solo chip, cambiar el panel implicaría rediseñar el sintonizador._
> 📰 Dijkstra acuñó el término "separation of concerns" en 1974. La idea es que una mente humana solo puede manejar cierta cantidad de complejidad a la vez. _Separar preocupaciones no es solo una buena práctica técnica: es una adaptación a los límites cognitivos de quien tiene que leer y mantener el código._
> **TIP:** **La pregunta diagnóstica de SoC** "Si cambia _X_, ¿qué código tengo que tocar?" Si la respuesta involucra partes del sistema que conceptualmente no tienen nada que ver con _X_, las preocupaciones están mezcladas. El objetivo es que cada cambio esté contenido en el lugar que le corresponde.

## Qué / Cómo / Cuándo

Las tres dimensiones

Qué · Cómo · Cuándo

La forma más concreta de aplicar SoC es separar tres preguntas que en el código mal estructurado siempre terminan mezcladas: **qué hace el sistema**, **cómo lo hace**, y **cuándo lo hace**. Son tres preocupaciones distintas con razones de cambio completamente distintas.

El qué

Dominio

Las _reglas de negocio_. Lo que el sistema sabe y decide. Completamente independiente de tecnología, frameworks o bases de datos.

→ "Un pedido con más de $500 tiene envío gratis"

→ "Un usuario no puede tener dos cuentas activas"

→ "El precio final incluye IVA del 21%"

El cómo

Infraestructura

Los _detalles de implementación_. Cómo se persiste, cómo se comunica, qué tecnologías se usan. Puede cambiar sin tocar el dominio.

→ Guardar en PostgreSQL o en DynamoDB

→ Enviar email con SendGrid o con SES

→ Cachear en Redis o en memoria

El cuándo

Orquestación

El _flujo y la secuencia_. Quién llama a quién, en qué orden, cómo se coordinan los pasos. Es la capa que conecta el qué con el cómo.

→ Al crear un pedido, notificar al almacén

→ Si el pago falla, revertir el stock

→ Cada medianoche, procesar facturas pendientes

> 🍕 En una pizzería: _qué_ es la receta (ingredientes, proporciones, temperatura). _Cómo_ es el horno (de leña, eléctrico, de gas). _Cuándo_ es el proceso (amasar primero, salsear después, hornear al final). Podés cambiar el horno sin cambiar la receta, y cambiar el proceso sin cambiar ninguno de los dos.
> **TIP:** **Por qué importa esta distinción** El **qué** cambia cuando cambian los requisitos de negocio. El **cómo** cambia cuando cambia la tecnología o el rendimiento. El **cuándo** cambia cuando cambia el flujo del proceso. Son tres frecuencias distintas de cambio. Si están mezclados, cualquiera de los tres fuerza cambios en los otros dos.

## En el código

SoC en el código

El problema visible antes de volverse invisible

Las violaciones de SoC en el código son fáciles de detectar cuando son nuevas y **muy difíciles de ver cuando llevan meses** acumulándose. Lo que empieza como "agrego esto acá para que sea más rápido" termina siendo un sistema donde nada se puede cambiar de forma aislada.

Viola SoC - todo mezclado

```js
// ruta HTTP que hace de todo
app.post('/checkout', async (req, res) => {
 // validación
 if (!req.body.items?.length)
 return res.status(400).json(...)

 // lógica de negocio
 const total = req.body.items
.reduce((s,i) => s + i.price, 0)
 const tax = total * 0.21

 // acceso a datos
 await db.query(
 'INSERT INTO orders...', [...]
)
 // envío de email
 await sendgrid.send({ to:... })

 res.json({ ok: true })
})
```

Respeta SoC

```js
// ruta: solo orquesta (cuándo)
app.post('/checkout', async (req, res) => {
 const result = await
 checkoutService.process(req.body)
 res.json(result)
})

// servicio: orquesta pasos (cuándo)
async process(data) {
 const order = Order.create(data) // qué
 await orderRepo.save(order)  // cómo
 await mailer.sendConfirm(order)// cómo
 return order
}
```

Viola SoC - lógica en la vista

```js
// componente React con
// lógica de negocio dentro
function OrderSummary({ items }) {
 // esto no debería estar acá
 const tax = items
.reduce((s,i) => s + i.price, 0)
 * 0.21
 const free = total > 500

 return <div>{tax}</div>
}
```

Respeta SoC

```js
// dominio: calcula (qué)
class Order {
 calcTax() { return... }
 hasFreeShip() { return... }
}

// vista: solo presenta (cómo)
function OrderSummary({ order }) {
 return <div>
 {order.calcTax()}
 </div>
}
```

> **TIP:** **El test de aislamiento** Si para testear la lógica de negocio necesitás levantar una base de datos, mockear HTTP o renderizar HTML, las preocupaciones están mezcladas. La lógica de dominio pura debería testearse con funciones simples, sin infraestructura. Si no podés, el _qué_ está contaminado con el _cómo_.

## En la arquitectura

SoC en la arquitectura

Las grandes decisiones estructurales

SoC aplicado a nivel arquitectónico define cómo se organiza el sistema completo. **La mayoría de los patrones de arquitectura de software son, en esencia, formas distintas de aplicar SoC** a distintos tipos de sistemas y problemas.

MVC

Model · View · Controller

La separación más conocida

▾

El patrón más adoptado en desarrollo web. Separa **qué saben los datos** (Model), **cómo se presentan** (View) y **quién coordina** los dos (Controller). Cada capa tiene una razón de cambio distinta: el modelo cambia con las reglas de negocio, la vista con el diseño, el controller con el flujo de la app.

Model datos, validaciones, lógica de negocio

↕

Controller orquesta request → model → view

↕

View presenta, no decide nada

La violación más común de MVC es poner lógica de negocio en el Controller ("Fat Controller") o en la View. El Model debería ser el único lugar donde viven las reglas.

Layered

Arquitectura por capas

Presentación · Negocio · Datos

▾

Organiza el sistema en capas horizontales donde **cada capa solo depende de la capa inmediatamente inferior**. La capa de presentación no sabe nada de base de datos; la capa de datos no sabe nada de la interfaz de usuario.

Presentación UI, API, CLI - entrada/salida

↓

Negocio casos de uso, reglas, validaciones

↓

Persistencia base de datos, archivos, caché

El problema de la arquitectura por capas clásica es que la dependencia apunta hacia la capa de datos, lo que acopla el negocio a la infraestructura. Clean Architecture invierte esa dependencia.

Hexagonal

Arquitectura hexagonal · Ports & Adapters

El dominio en el centro, la infraestructura afuera

▾

Alistair Cockburn (2005). El **dominio vive en el centro** y no depende de nada externo. Define _puertos_ (interfaces) que describen lo que necesita. Los _adaptadores_ implementan esas interfaces conectando con el mundo real: base de datos, HTTP, email, eventos.

Adaptadores externos HTTP, BD, queues, servicios externos

implementan ↓ · dependen de ↓

Puertos (interfaces) contratos definidos por el dominio

protegen ↓

Dominio puro sin imports de frameworks ni BD

La ventaja clave: podés correr todos los tests del dominio sin base de datos, sin red, sin ninguna infraestructura. El dominio es puro Python/JS/Java con lógica de negocio.

Clean Arch

Clean Architecture · Onion Architecture

La regla de dependencia: siempre hacia adentro

▾

Robert C. Martin (2012). Formaliza Hexagonal con una regla estricta: **las dependencias solo pueden apuntar hacia adentro**. El núcleo (entidades y casos de uso) no importa nada del exterior. Los frameworks, la base de datos y la UI son detalles que se enchufan desde afuera.

El beneficio principal: podés reemplazar el framework web, la base de datos o la UI **sin tocar una línea de lógica de negocio**. Los casos de uso son testeables con tests unitarios puros, sin mocks de infraestructura.

> **TIP:** **La regla de dependencia** Código en un anillo externo puede importar de anillos internos. Código en un anillo interno nunca puede importar de anillos externos. Si el dominio importa `express`, `sequelize` o `axios`, Clean Architecture está rota.

## Trampas

Trampas comunes

Cómo se mezclan las preocupaciones sin que nadie lo note

Las violaciones de SoC raramente son decisiones conscientes. Son **atajos razonables que se acumulan**. Un `console.log` acá, una query allá, un cálculo en el template. Seis meses después, nadie sabe dónde está nada.

-   🍝
    
    **Lógica de negocio en los controllers o rutas HTTP** El controller debería recibir el request, llamar al servicio correspondiente y devolver la respuesta. Cuando empieza a tener `if`s de negocio, cálculos de precios o validaciones de dominio, el _qué_ y el _cuándo_ están mezclados. Testear esa lógica requiere levantar todo el stack HTTP.
    
-   🖼️
    
    **Lógica en las vistas o componentes de UI** Un componente React, un template Blade o una vista Jinja2 que calcula descuentos, filtra datos o decide qué mostrar según reglas de negocio mezcla el _qué_ con el _cómo_. La vista debería recibir los datos ya calculados y limitarse a presentarlos.
    
-   🔒
    
    **Dominio acoplado a la infraestructura** Cuando una entidad de dominio extiende un modelo de ORM (`class Order extends Model`), importa el cliente de base de datos directamente, o llama a una API externa desde la lógica de negocio, el _qué_ está contaminado con el _cómo_. Cambiar de ORM implica reescribir el dominio.
    
-   🧵
    
    **Orquestación distribuida entre capas** El flujo "al crear un pedido, notificar al almacén, descontar stock y enviar email" debería vivir en un solo lugar. Si parte del flujo está en el controller, parte en el modelo y parte en un event listener disperso, el _cuándo_ está repartido y es imposible seguir la secuencia de un proceso completo.
    
-   📋
    
    **Validaciones de negocio duplicadas en múltiples capas** Tener la validación "el stock no puede ser negativo" en el frontend, en el controller y en el trigger de la base de datos parece robusto pero viola DRY y SoC. La regla de negocio debería vivir en el dominio; las otras capas confían en esa validación o la delegan a ella.
    
-   🌀
    
    **Separación por capa técnica en lugar de por preocupación** Una carpeta `services/` con 40 archivos que mezclan lógica de órdenes, de usuarios, de pagos y de notificaciones no es separación de preocupaciones - es separación de tipos de archivo. Una preocupación verdadera es "todo lo relacionado con el ciclo de vida de un pedido", no "todos los archivos que son services".
