export const idlFactory = ({ IDL }) => {
  const ModelInferenceResult = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Int64),
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'append_model_bytes' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'clear_model_bytes' : IDL.Func([], [], []),
    'model_bytes_length' : IDL.Func([], [IDL.Nat64], ['query']),
    'model_inference' : IDL.Func(
        [IDL.Nat8, IDL.Vec(IDL.Int64)],
        [ModelInferenceResult],
        [],
      ),
    'setup_model' : IDL.Func([], [IDL.Opt(IDL.Text)], []),
  });
};
export const init = ({ IDL }) => { return []; };
