/**
 * Promise controlada para induzir o estado `loading` em testes de hooks.
 *
 * Permite renderizar o hook com o fetcher pendente (`mockImplementationOnce(() =>
 * promise)`) e só então resolver/rejeitar dentro de `act`, exercitando a
 * transição `loading → success/error` de verdade — fase 04 §3 item 2.
 */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
