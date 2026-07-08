export interface IHashString {
  [details: string]: string;
}

export interface IHash<T> {
  [details: string]: T;
}

export interface IHashArray<T> {
  [details: string]: Array<T>;
}
