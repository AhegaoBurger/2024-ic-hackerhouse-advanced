import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GenerationResult {
  'text' : string,
  'tokens' : BigInt64Array | bigint[],
}
export interface TokenizerResult {
  'text' : string,
  'tokens' : BigInt64Array | bigint[],
}
export interface _SERVICE {
  'decode' : ActorMethod<[BigInt64Array | bigint[]], string>,
  'encode' : ActorMethod<[string], TokenizerResult>,
  'generate_text' : ActorMethod<
    [string, number],
    { 'Ok' : GenerationResult } |
      { 'Err' : string }
  >,
  'initialize_tokenizer' : ActorMethod<
    [Uint8Array | number[], Uint8Array | number[]],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
