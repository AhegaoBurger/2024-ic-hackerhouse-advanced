import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ModelInferenceResult = { 'Ok' : BigInt64Array | bigint[] } |
  { 'Err' : string };
export interface _SERVICE {
  'append_model_bytes' : ActorMethod<[Uint8Array | number[]], undefined>,
  'clear_model_bytes' : ActorMethod<[], undefined>,
  'model_bytes_length' : ActorMethod<[], bigint>,
  'model_inference' : ActorMethod<
    [number, BigInt64Array | bigint[]],
    ModelInferenceResult
  >,
  'setup_model' : ActorMethod<[], [] | [string]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
