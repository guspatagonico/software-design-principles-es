# SOLID

> Cinco reglas para escribir código que sea fácil de cambiar, extender y entender. Hacé clic en cada letra para explorar.

SRP, OCP, LSP, ISP, DIP. Cinco reglas para escribir código que sea fácil de cambiar, extender y entender. El vocabulario fundamental del diseño orientado a objetos.

## Single

Single Responsibility

Una clase, una razón para cambiar

Una clase debe tener **una sola responsabilidad**. Si una clase hace demasiadas cosas, cualquier cambio en una de ellas puede romper las otras - y la clase se vuelve imposible de testear de forma aislada.

> 🍳 Pensalo así: en un restaurante, el cocinero cocina, el mozo atiende y el cajero cobra. Si el cocinero también cobrara y atendiera las mesas, un problema en cocina paralizaría todo el servicio. _Cada rol tiene su propia razón de cambiar._

Viola SRP

```
class User {
 getName() { /* … */ }

 saveToDatabase() {
 // guarda en BD
 // ¿por qué User sabe de BD?
 }

 sendWelcomeEmail() {
 // envía email
 // ¿y también de emails?
 }
}
```

Respeta SRP

```
class User {
 getName() { /* … */ }
}

class UserRepository {
 save(user) { /* solo BD */ }
}

class Mailer {
 sendWelcome(user) {
 /* solo emails */
 }
}
```

> **TIP:** **💡 Truco mental** Preguntate: _"¿por qué motivo tendría que cambiar esta clase?"_. Si encontrás dos razones distintas, es señal de que debería ser dos clases.

## Open

Open / Closed

Abierta para extender · Cerrada para modificar

Podés agregar comportamiento nuevo **sin tocar el código que ya funciona**. Cada vez que editás una clase existente para agregar un caso, arriesgás romper algo que antes andaba.

> 🔌 Un tomacorriente no cambia cada vez que enchufás algo nuevo. Vos traés el enchufe nuevo, el tomacorriente ya sabe qué hacer. _La infraestructura no se toca; se extiende con nuevas implementaciones._

Viola OCP

```
class DiscountCalc {
 calc(type, price) {
 if (type === 'vip')
 return price * 0.8
 if (type === 'promo')
 return price * 0.9
 // cada nuevo descuento
 // edita esta clase 😬
 }
}
```

Respeta OCP

```js
class VipDiscount {
 apply(p) { return p * 0.8 }
}
class PromoDiscount {
 apply(p) { return p * 0.9 }
}
// nuevo descuento = nueva clase
// sin tocar las anteriores ✓

function applyDiscount(disc, p) {
 return disc.apply(p)
}
```

> **TIP:** **💡 Truco mental** Si cada nueva funcionalidad requiere abrir un `if/else` gigante en la misma clase, estás violando OCP. La solución casi siempre es una clase nueva que implementa una interfaz existente.

## Liskov

Liskov Substitution

Las subclases deben ser intercambiables

Si tu código espera un objeto de tipo `Animal`, debería funcionar igual con cualquier subclase: **sin sorpresas, sin excepciones especiales**. Si una subclase rompe ese contrato, la herencia está mal diseñada.

> 🚗 Si una función espera un _Vehículo_ para _acelerar()_, debería funcionar con un auto, una moto y un camión. Si una bicicleta lanza un error porque no tiene motor, la bicicleta no debería heredar de Vehículo.

Viola LSP

```
class Bird {
 fly() { /* vuela */ }
}

class Penguin extends Bird {
 fly() {
 throw "¡No puedo volar!"
 // rompe el contrato 💥
 // todo código que use Bird
 // ahora puede explotar
 }
}
```

Respeta LSP

```
class Bird { /* base */ }

class FlyingBird extends Bird {
 fly() { /* vuela ✓ */ }
}

class Penguin extends Bird {
 swim() { /* nada ✓ */ }
 // no hereda fly()
}
```

> **TIP:** **💡 Truco mental** Si una subclase necesita lanzar excepciones en métodos del padre, o dejarlos vacíos, la jerarquía de herencia está mal diseñada. Replantear la estructura siempre es mejor que parchar con ifs.

## Interface

Interface Segregation

Interfaces específicas, no monolíticas

Es mejor tener **muchas interfaces pequeñas** que una sola grande. Una clase no debería verse obligada a implementar métodos que nunca va a usar - eso genera código vacío o que lanza errores.

> 🎛️ Un control remoto de TV tiene botones para TV. No tiene freno de mano ni limpiaparabrisas. Si tuviera de todo, sería imposible de usar. _Cada dispositivo tiene solo los controles que le corresponden._

Viola ISP

```
interface Animal {
 eat()
 fly() // los perros no vuelan
 swim() // los pájaros no nadan
 bark() // los peces no ladran
}

// Todos implementan métodos
// que no necesitan 😬
```

Respeta ISP

```
interface Flyable {
 fly()
}
interface Swimmable {
 swim()
}
interface Barkable {
 bark()
}
// Cada clase implementa
// solo lo que necesita ✓
```

> **TIP:** **💡 Truco mental** Si implementás una interfaz y algunos métodos quedan con el cuerpo vacío o lanzan `NotImplemented`, es una señal clara de que la interfaz es demasiado grande y hay que dividirla.

## Dependency

Dependency Inversion

Dependé de abstracciones, no de concretos

Las clases de alto nivel no deben depender de las de bajo nivel. Ambas deben depender de **abstracciones**. Así podés cambiar una implementación (MySQL → PostgreSQL) sin tocar la lógica de negocio.

> 🔋 Un control remoto no está construido para pilas AA de una marca en particular. Está construido para _cualquier pila AA_. El contrato (tamaño + voltaje) es la abstracción. Podés cambiar de marca sin cambiar el control.

Viola DIP

```
class OrderService {
 constructor() {
 this.db = new MySQLDatabase()
 // acoplado a MySQL 💥
 // ¿cambio a Postgres?
 // hay que editar esta clase
 }

 createOrder(data) {
 this.db.save(data)
 }
}
```

Respeta DIP

```
class OrderService {
 constructor(db: Database) {
 this.db = db
 // recibe cualquier impl.
 // que cumpla la interfaz ✓
 }

 createOrder(data) {
 this.db.save(data)
 }
}
```

> **TIP:** **💡 Truco mental** Si en el constructor ves `new ClaseConcrета()`, preguntate si deberías recibir esa dependencia desde afuera mediante inyección. Ese patrón se llama _Dependency Injection_ y es la implementación más común de este principio.

## Origen del principio

Una **clase** es una plantilla que agrupa datos y comportamiento relacionados. En la práctica, podés pensarla como cualquier **unidad de código con identidad propia**: una clase en Python, Java o C#, un módulo en JavaScript, un servicio en Go, o una función con estado en un lenguaje funcional.  
  
Cuando SOLID dice "clase", habla de **cualquier unidad de organización de código** que tenga responsabilidades y dependa de otras unidades.

## Solo aplica a código?

SOLID nació en el mundo de la **Programación Orientada a Objetos** (Robert C. Martin, 2000), pero sus ideas son mucho más amplias. Hoy se aplican —con adaptaciones— en paradigmas funcionales, arquitectura de microservicios e incluso diseño de APIs.

> POO - nativo · Microservicios · Diseño de APIs · Funcional - parcial · Scripts simples - opcional

