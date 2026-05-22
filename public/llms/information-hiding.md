# Info Hiding

> Lo que no es público no puede romperse desde afuera. Cada módulo debería exponer solo lo mínimo necesario y ocultar todo lo demás detrás de una interfaz estable.

Ocultá las decisiones de diseño que probablemente van a cambiar. Lo que no es público no puede romperse desde afuera. Cada módulo debería exponer solo lo mínimo necesario.

## Concepto

¿Qué es Information Hiding?

Lo que no ves no te puede romper

Information Hiding dice que cada módulo debería **ocultar sus decisiones de diseño internas** detrás de una interfaz estable. Los detalles de implementación —cómo almacena datos, qué algoritmo usa, qué estructura interna tiene— no deberían ser visibles para nadie más.

El principio lo formuló **David Parnas en 1972** como criterio para modularizar sistemas: cada módulo debería ser responsable de ocultar una _decisión de diseño que es probable que cambie_. Si algo cambia, solo ese módulo debería verse afectado.

Módulo interno

● getTotal()

● save(data)

● isValid()

◌ #items\[\]

◌ #calcVat()

◌ #dbConn

◌ #parseRow()

interfaz

pública

Lo que el mundo ve

✓ getTotal()

✓ save(data)

✓ isValid()

El resto no existe para el cliente. Cambiar la implementación interna no le afecta.

> ☕ Cuando usás un café de cápsula no sabés qué temperatura exacta calienta el agua, qué presión de extracción usa ni qué materiales tienen los conductos internos. Usás la interfaz —botón, taza, cápsula— y el resto está oculto. _Si el fabricante cambia el sistema de calentamiento en la próxima versión, vos seguís usando el mismo botón._
> 🔑 Information Hiding no es solo sobre `private` y `public`. Es una _decisión de diseño_: qué aspectos del módulo son su contrato estable con el mundo, y cuáles son detalles que pueden cambiar libremente sin romper a nadie.
> **TIP:** **La pregunta de Parnas** Al diseñar un módulo, preguntate: _"¿Qué decisiones de diseño podrían cambiar en el futuro?"_ Esas son exactamente las cosas que deberías ocultar. Lo que exponés es tu contrato: debería ser estable. Lo que ocultás son tus detalles de implementación: pueden cambiar libremente.

## Qué ocultar

¿Qué se oculta?

Las decisiones que probablemente van a cambiar

Parnas fue muy específico: lo que hay que ocultar son las **decisiones de diseño que son propensas a cambiar**. No todo lo interno merece ocultarse por el principio en sí —se oculta lo que, si estuviera expuesto, crearía acoplamiento que hace costosos los cambios futuros.

🗄️ Mecanismo de almacenamiento

Si el código externo conoce que usás PostgreSQL, una migración a MongoDB rompe todo lo que depende de ese detalle. _Exponé operaciones de dominio, no consultas SQL._

✗ exponer db.query('SELECT \* FROM orders WHERE...')

✓ ocultar orderRepo.findByStatus('pending')

⚙️ Algoritmos y estructuras internas

El algoritmo de ordenamiento, la estructura de datos elegida, la fórmula de cálculo. Si cambiás de bubble sort a quicksort, nadie debería saberlo. _Exponé el resultado, no el proceso._

✗ exponer this.#items (el array interno)

✓ ocultar getItems() retorna copia inmutable

🔌 Dependencias externas concretas

La librería de email, el SDK del proveedor de pagos, el cliente de caché. Si cambiás de SendGrid a SES, solo debería cambiar el adaptador. _Nadie más debería enterarse._

✗ exponer sendgrid.send({ to, subject, html })

✓ ocultar mailer.sendWelcome(user)

📐 Formato y representación de datos

Cómo se serializa internamente un objeto, en qué unidades se almacenan los valores, qué formato tienen los IDs. _El contrato externo puede ser estable aunque el formato interno cambie._

✗ exponer { price\_cents: 4999 }

✓ ocultar product.getPrice() → { amount, currency }

🔒 Estado de implementación mutable

Los campos internos de un objeto que forman su estado. Exponerlos directamente permite que código externo manipule el estado sin pasar por las reglas del objeto. _El estado se modifica a través de comportamiento, no de asignación directa._

✗ exponer order.status = 'cancelled'

✓ ocultar order.cancel() — valida y cambia

🔧 Configuración y parámetros técnicos

Timeouts, tamaños de pool, reintentos, thresholds. Son detalles operacionales que no deberían ser parte del contrato público del módulo. _El cliente pide comportamiento, no configura infraestructura._

✗ exponer new HttpClient(timeout=5000, retries=3)

✓ ocultar apiClient.fetchUser(id)

> **TIP:** **El criterio de Parnas** No se oculta todo lo que es "privado" mecánicamente. Se oculta lo que es una _decisión de diseño probable de cambiar_. Si un detalle es estable y exponerlo simplifica el uso del módulo, puede estar justificado. El criterio no es "¿es interno?" sino "¿qué pasa si esto cambia?"

## En el código

Information Hiding en el código

Diseñar interfaces, no implementaciones

Information Hiding se aplica en cada capa: en el modificador de acceso de un campo, en el diseño de una API, en la estructura de un módulo. La pregunta siempre es la misma: **¿quién necesita saber esto y por qué?**

Viola IH — estado expuesto

```
class ShoppingCart {
  items = []       // público 😬
  total = 0       // público 😬
  discount = 0    // público 😬
}

// El cliente puede hacer:
cart.items.push({ price: -999 })
cart.total = 0  // bypass gratis
```

Respeta IH — estado encapsulado

```
class ShoppingCart {
  #items = []     // privado ✓
  #discount = 0   // privado ✓

  addItem(item) {
    this.#items.push(item)
  }
  getTotal() {
    return this.#items
      .reduce((s,i)=>s+i.price,0)
      * (1 - this.#discount)
  }
}
```

Viola IH — implementación filtrada

```js
// El módulo expone
// detalles de SQL
async function getOrders(filters) {
  return db.query(`
    SELECT o.*, c.name, c.email
    FROM orders o
    JOIN customers c ON c.id = o.cid
    WHERE o.status = $1
  `, [filters.status])
}
// el llamador recibe filas crudas
// y sabe del esquema de BD 😬
```

Respeta IH — interfaz de dominio

```js
// El módulo retorna objetos
// de dominio, no filas SQL
async function getOrders(filters) {
  const rows = await db.query(...)
  return rows.map(toOrder)
}

// toOrder() es privado al módulo
// El esquema SQL no se filtra ✓
```

Modificadores de visibilidad — cuándo usar cada uno

Visibilidad

Quién accede

Cuándo usarla

private

Solo la propia clase

Estado interno, algoritmos, implementación. Es el default que debería usarse salvo razón explícita para ser más permisivo.

protected

La clase y sus subclases

Comportamiento que las subclases necesitan extender pero que no es parte del contrato público. Usarlo con criterio —es una forma de acoplamiento con la jerarquía.

internal / package

El mismo módulo o paquete

Colaboración entre clases del mismo módulo que no debería cruzar fronteras de paquete. Muy útil para Information Hiding a nivel de módulo.

public

Cualquier código

El contrato estable del módulo. Solo lo que el cliente _necesita_ para usar el módulo. Cuanto menos, mejor.

> **TIP:** **La regla de la visibilidad mínima** Empezá siempre con `private`. Hacé algo más visible solo cuando tenés una razón concreta para hacerlo. Es mucho más fácil hacer algo público después que volverlo privado una vez que hay código que depende de él.

## Encapsulación vs IH

Encapsulación vs Information Hiding

No son lo mismo — aunque van siempre juntos

Son conceptos distintos que se confunden habitualmente. **Encapsulación** es el mecanismo del lenguaje para agrupar datos y comportamiento. **Information Hiding** es el principio de diseño que decide qué ocultar y por qué. La encapsulación es la herramienta; IH es la intención.

Encapsulación

El mecanismo

Agrupar datos y las operaciones que los manejan en una misma unidad —la clase. Es una **característica del lenguaje**: clases, objetos, métodos, campos.  
  
La encapsulación te _da la capacidad_ de ocultar cosas. No te dice qué ocultar ni por qué. Podés tener encapsulación perfecta (todo en clases) y violar completamente Information Hiding (todo público).

Lenguaje → Clases, objetos, modificadores de acceso

Information Hiding

El principio

Decidir conscientemente qué aspectos del módulo son públicos y cuáles son detalles de implementación que deben estar ocultos. Es una **decisión de diseño**.  
  
IH te dice _qué_ ocultar y _por qué_: las decisiones que pueden cambiar. Puede aplicarse incluso sin POO —en módulos, en APIs, en interfaces de microservicios.

Diseño → Contratos estables, detalles variables ocultos

Encapsulación sin IH

Todo en una clase, todo público

Los datos están agrupados en una clase pero todos los campos son públicos. _La herramienta existe, el principio no se aplicó._

IH sin encapsulación

Módulos con interfaz bien definida

Un módulo de Go o de C con funciones exportadas e internas. _El principio aplica aunque no haya clases ni POO._

Encapsulación + IH

El objetivo real

Clase bien diseñada: los campos son privados, la interfaz pública es mínima y estable. _El mecanismo sirve al principio._

> **TIP:** **La distinción en una sola oración** Encapsulación te permite poner un candado en la puerta. Information Hiding te dice qué poner detrás de ese candado —y más importante: _por qué_.

## Trampas

Trampas comunes

Cuando la interfaz pública filtra más de lo que debería

Las violaciones de Information Hiding se llaman **"leaky abstractions"** —abstracciones que filtran detalles de implementación hacia afuera. El código que depende de esos detalles se rompe cuando la implementación cambia.

-   🔓
    
    **Getters y setters para todos los campos** Agregar automáticamente `getX()` y `setX()` para cada campo de la clase no es Information Hiding —es exponer todos los campos con nombres más largos. Un setter que solo asigna un valor hace que el campo sea efectivamente público. Los métodos deberían exponer _comportamiento_, no acceso al estado interno.
    
-   💉
    
    **Tipos de implementación en la interfaz pública** Cuando el método público retorna un `ArrayList` en lugar de una `List`, o un `HashMap` en lugar de un `Map`, el llamador empieza a depender de que sea específicamente esa implementación. Cuando cambiás a `LinkedList` o a `TreeMap`, el código del llamador puede romperse aunque el comportamiento sea equivalente.
    
-   📡
    
    **Exponer excepciones de implementación** Si tu módulo de dominio lanza `SQLException` o `RedisException`, el llamador ahora sabe qué tecnología de persistencia usás. Cuando cambiás de base de datos, tenés que cambiar también el manejo de errores en todos los clientes. Las excepciones que cruzan fronteras de módulo deberían ser excepciones de dominio, no de infraestructura.
    
-   🗂️
    
    **Estructura del módulo expuesta en los imports** Si los clientes hacen `import { calcVat } from './order/internal/tax/vatCalculator'`, conocen la estructura interna del módulo. Si reorganizás la carpeta `internal/`, rompés a todos. Los módulos deberían tener un punto de entrada único que reexporte lo que es público, ocultando la estructura interna.
    
-   🌊
    
    **Retornar referencias mutables a estado interno** Retornar el array interno directamente permite que el llamador lo modifique sin pasar por los métodos del objeto. `getItems()` que devuelve `this.#items` rompe el encapsulamiento aunque `#items` sea privado. La solución es retornar una copia inmutable o una vista de solo lectura.
    
-   🏷️
    
    **Nombres que filtran la implementación** Métodos como `saveToPostgres()`, `fetchFromRedis()` o `serializeToJSON()` en la interfaz pública revelan detalles de implementación en el nombre. Si cambiás de Postgres a MongoDB, el nombre del método queda mentiroso. Los contratos públicos deberían hablar el lenguaje del dominio: `persist()`, `getFromCache()`, `serialize()`.
    

> **TIP:** **El test del reemplazo libre** Si podés cambiar la implementación interna de un módulo —el algoritmo, la base de datos, la librería, la estructura de datos— sin que ningún código externo note la diferencia ni necesite modificarse, Information Hiding está bien aplicado. Si algún cliente se rompe por un cambio puramente interno, hay una abstracción con pérdidas.
