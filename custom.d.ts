interface Array<T> {
  find(predicate: (search: T) => boolean) : T;
  findIndex(predicate: (search: T) => boolean) : number;
}