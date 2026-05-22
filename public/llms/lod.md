# Law of Demeter

> Hablá solo con tus amigos directos. No le hables a los amigos de tus amigos. Cada objeto debería saber lo menos posible sobre la estructura interna de los demás.

Hablá solo con tus amigos directos. No navegues a través de la estructura interna de otros objetos. Cada objeto debería saber lo menos posible sobre los demás.

## Concepto

¿Qué es la Law of Demeter?

Principio del mínimo conocimiento

La LoD dice que un objeto debería **conocer lo menos posible sobre la estructura interna de otros objetos**. Solo debería hablar con sus "amigos directos" (los objetos con los que tiene una relación inmediata) y nunca con los amigos de sus amigos.

Surgió en 1987 en la Universidad Northeastern durante el proyecto Demeter. La idea central: **cada unidad de código debería tener conocimiento limitado sobre otras unidades**. Solo conoce a las que están directamente relacionadas con ella.

> 🏘️ Si necesitás pedirle sal a tu vecino, golpeás su puerta y se la pedís a él directamente. No abrís su puerta, entrás a su cocina, abrís su alacena y sacás la sal vos. _Interactuás con tu vecino, no con su alacena. No necesitás saber cómo tiene organizada su cocina._

● El anti-patrón: "train wreck" - cadena de llamadas

order.getCustomer() · getAddress() · getCity() · toUpperCase()

order (amigo directo ✓ customer) amigo de order ✗ address (amigo de customer ✗ city) amigo de address ✗

> 🚆 El nombre "train wreck" (choque de trenes) describe visualmente la cadena de puntos. Cada punto es un vagón que se engancha al anterior. Si cualquier eslabón devuelve `null`, el tren descarrila. _Y el código que escribe esta cadena ahora conoce la estructura interna de cuatro objetos distintos._
> **TIP:** **La señal de alarma más rápida** Contá los puntos en una expresión. Un punto es casi siempre razonable. Dos puntos merece revisión. Tres o más puntos encadenados sobre objetos distintos es casi siempre una violación de LoD. (Los puntos sobre el mismo objeto en un fluent interface son la excepción, como veremos.)

## Las 4 reglas

Las cuatro reglas

¿A quién podés llamarle?

La LoD define con precisión cuáles son tus **"amigos directos"**: los objetos con los que podés interactuar directamente. Cualquier otro objeto es un extraño, y hablar con extraños a través de tus amigos viola el principio.

Regla 01

El propio objeto

Podés llamar cualquier método de _vos mismo_ (`this` o `self`). Sos tu amigo más directo.

✓ this.calcTotal()  
✓ this.validate()

Regla 02

Los parámetros del método

Los objetos que recibís como _argumentos_ en el método actual son amigos directos para ese método.

✓ process(order) {  
  order.getTotal() // ✓  
}

Regla 03

Objetos que el método crea

Los objetos que _instenciás dentro del método_ son tus amigos. Los creaste vos, los conocés directamente.

✓ const tax = new Tax()  
✓ tax.calc(amount)

Regla 04

Componentes directos del objeto

Los atributos de instancia de tu clase (las _propiedades que te pertenecen_) son amigos directos. No sus contenidos internos.

✓ this.mailer.send()  
✗ this.mailer.smtp.connect()

> 👥 Sos vos, tus herramientas (atributos), lo que te traen (parámetros) y lo que fabricás en el momento (objetos creados localmente). Todo lo demás son conocidos de tus conocidos - y con ellos _no hablás directamente._
> **TIP:** **Lo que NO está en la lista** Los objetos que obtenés llamando un método de otro objeto no son amigos directos. Si `order.getCustomer()` te devuelve un `Customer`, ese `Customer` es un extraño - es amigo de `order`, no tuyo. No deberías llamar métodos sobre él directamente.

## En el código

LoD en el código

Reemplazar navegación por delegación

La solución a casi todas las violaciones de LoD es la misma: en lugar de **navegar** a través de la estructura interna de un objeto para obtener lo que necesitás, le **delegás** la tarea a ese objeto directamente. Él sabe dónde está todo; vos no necesitás saberlo.

Viola LoD - navegación

```js
class ShippingService {
 ship(order) {
 // atravesamos 3 objetos
 const city = order
.getCustomer() // extraño
.getAddress() // extraño
.getCity() // extraño

 sendTo(city)
 }
}
```

Respeta LoD - delegación

```
class Order {
 // Order conoce al Customer
 getShippingCity() {
 return this.customer
.getCity() // Customer lo delega
 }
}

class ShippingService {
 ship(order) {
 sendTo(order.getShippingCity())
 }
}
```

Viola LoD - decisiones sobre extraños

```
class Discount {
 apply(order) {
 // ¿cuánto sabe Discount
 // sobre la estructura de Order?
 if (order.getCustomer()
.getMembership()
.isGold()) {
 order.setDiscount(0.2)
 }
 }
}
```

Respeta LoD - preguntar lo justo

```
class Order {
 isEligibleForGoldDiscount() {
 return this.customer
.isGoldMember() // delega
 }
}

class Discount {
 apply(order) {
 if (order.isEligibleForGoldDiscount())
 order.setDiscount(0.2)
 }
}
```

Viola LoD - config anidada

```js
// Demasiado conocimiento
// sobre la estructura de config
const host = app
.getConfig()
.getDatabase()
.getConnection()
.getHost()

// Si cambia la estructura
// de Config, rompés acá 💥
```

Respeta LoD - fachada directa

```js
// Config expone lo que
// los clientes necesitan
class Config {
 getDatabaseHost() {
 return this.db.connection.host
 }
}

const host = app
.getConfig()
.getDatabaseHost() // ✓
```

> **TIP:** **La regla del "un punto" como heurística** En la mayoría de los casos, una línea con más de un encadenamiento de puntos sobre objetos distintos merece revisión. El primer punto (sobre tu amigo directo) es siempre válido. El segundo ya puede ser una señal. A partir del tercero, casi seguro estás violando LoD.

## Tell, Don't Ask

Tell, Don't Ask

Decí lo que querés que pase, no preguntes para decidir vos

**Tell, Don't Ask** es el principio hermano de la LoD. En lugar de pedirle datos a un objeto para tomar una decisión externa sobre él, **le decís directamente lo que querés que haga**. El objeto usa sus propios datos para decidir, sin exponer su estructura interna.

Ask - el problema

Pedir datos y decidir afuera

Preguntás el estado interno del objeto, lo traés hacia afuera y tomás la decisión en el llamador. El objeto pierde el control sobre su propio comportamiento. _La lógica sobre el objeto vive fuera del objeto._

Tell - la solución

Decir qué hacer, no cómo

Le decís al objeto qué resultado querés. Él usa sus propios datos para decidir cómo lograrlo. _La lógica sobre el objeto vive dentro del objeto, donde debería estar._

Ask - pedir para decidir afuera

```
// Preguntamos el estado interno
if (account.getBalance() >= amount
 && account.isActive()
 &&!account.isFrozen()) {
 account.setBalance(
 account.getBalance() - amount
)
}
// El llamador sabe demasiado
// sobre las reglas de Account 😬
```

Tell - decir qué queremos

```
class Account {
 debit(amount) {
 // Account maneja sus reglas
 if (!this.canDebit(amount))
 throw new Error('fondos insuf.')
 this.balance -= amount
 }
}

account.debit(amount) // ✓
```

> 🍕 No le preguntás al delivery si tiene la pizza lista, si el repartidor está disponible, y si la distancia es menor a 5km para decidir vos si pedís. _Le decís "quiero una pizza" y él resuelve todos esos detalles internamente._ Vos solo necesitás el resultado.

Cuándo sí es aceptable preguntar

-   ✅
    
    **Queries de solo lectura sin efecto** Preguntar el estado de un objeto para mostrarlo en una vista (sin tomar decisiones de negocio sobre él) es razonable. `order.getTotal()` para mostrar el precio en pantalla no viola Tell, Don't Ask porque no produce efectos secundarios basados en ese valor.
    
-   ✅
    
    **Predicados para flujo de control externo legítimo** A veces el llamador tiene contexto que el objeto no tiene. Un router que pregunta `user.hasPermission('admin')` para decidir qué ruta mostrar es razonable: la decisión de routing no pertenece al objeto `User`.
    

> **TIP:** **El test de Tell, Don't Ask** Si ves código que hace `getX()` y luego usa ese valor para llamar `setX()` sobre el mismo objeto, es casi siempre un candidato a reemplazar por un método que encapsule ambas operaciones. El objeto debería ser responsable de su propia transformación de estado.

## Trampas

Trampas comunes

Cuándo LoD se aplica mal - en ambas direcciones

La LoD tiene dos tipos de errores: violaciones reales que aumentan el acoplamiento, y **aplicación excesiva** que genera métodos de delegación innecesarios. Como todo principio, requiere criterio.

-   🚆
    
    **El train wreck en consultas de configuración** `app.getConfig().getDb().getPool().getMaxConnections()` es el ejemplo más frecuente en código real. Cada capa de configuración anidada acopla al llamador con la estructura completa. La solución es que `Config` exponga métodos de fachada: `config.getDbMaxConnections()`.
    
-   🌊
    
    **Confundir fluent interfaces con violaciones de LoD** `QueryBuilder.select('*').from('users').where('active', true).limit(10)` no viola LoD. Cada método devuelve _el mismo objeto_ (`this`), no un objeto distinto. Los fluent interfaces son un patrón de diseño intencional - los puntos están sobre el mismo "amigo". La LoD habla de navegar a través de objetos distintos.
    
-   🧱
    
    **Crear métodos de delegación innecesarios** Aplicar LoD mecánicamente puede llevar a agregar docenas de métodos delgados que solo llaman a métodos de componentes internos. Si `Order` empieza a tener `getCustomerName()`, `getCustomerEmail()`, `getCustomerCity()`… el remedio es peor que la enfermedad. A veces la solución correcta es repensar el diseño, no agregar delegadores.
    
-   📦
    
    **LoD aplicada a estructuras de datos puras** La LoD aplica a _objetos con comportamiento_, no a estructuras de datos simples. Acceder a `response.data.user.email` en una respuesta de API, un DTO o un JSON no es una violación - son datos planos sin lógica de negocio. No tiene sentido agregar métodos de delegación a una estructura de datos.
    
-   🔍
    
    **Ignorar LoD en los tests** Un test que arma una cadena de mocks anidados (`mockOrder.getCustomer().returns(mockCustomer)`, luego `mockCustomer.getAddress().returns(mockAddress)`…) es una señal de que el código de producción viola LoD. Si testear algo requiere mockear tres niveles de profundidad, el acoplamiento ya es un problema.
    

> **TIP:** **La señal más clara de una violación real** Si un cambio en la estructura interna de un objeto (renombrar un campo, cambiar cómo almacena algo) rompe código en una clase que no debería saber nada de ese objeto, la LoD está siendo violada. El acoplamiento estructural se propaga silenciosamente hasta que un refactor lo hace visible.

## Origen del principio

La Law of Demeter fue formulada en **1987** por Karl Lieberherr e Ian Holland en la Universidad Northeastern (proyecto Demeter). El nombre es una referencia a Deméter, diosa griega de la tierra y la agricultura —la misma raíz del proyecto. También se la conoce como el **Principio del Mínimo Conocimiento** (_Principle of Least Knowledge_), que es quizás el nombre más descriptivo.

## Solo aplica a código?

Aplica a cualquier sistema donde haya unidades que se comunican entre sí.

> POO - nativo · Microservicios · Diseño de APIs REST · GraphQL · Funcional - adaptado · Datos planos - no aplica

