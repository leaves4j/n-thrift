const typeCache = null;
class A {
  constructor() {
    const b = new B();

    console.log(Reflect.getPrototypeOf(this).constructor.AA);
  }
  static get AA() { return 'AAA'; }
}
A.M = 123;
class B {

}
class C extends A {
}
const a = new C();
console.log();

