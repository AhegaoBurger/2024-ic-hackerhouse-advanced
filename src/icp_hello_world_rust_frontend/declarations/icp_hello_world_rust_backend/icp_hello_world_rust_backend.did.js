export const idlFactory = ({ IDL }) => {
  const TokenizerResult = IDL.Record({
    'text' : IDL.Text,
    'tokens' : IDL.Vec(IDL.Int64),
  });
  const GenerationResult = IDL.Record({
    'text' : IDL.Text,
    'tokens' : IDL.Vec(IDL.Int64),
  });
  return IDL.Service({
    'decode' : IDL.Func([IDL.Vec(IDL.Int64)], [IDL.Text], ['query']),
    'encode' : IDL.Func([IDL.Text], [TokenizerResult], ['query']),
    'generate_text' : IDL.Func(
        [IDL.Text, IDL.Nat8],
        [IDL.Variant({ 'Ok' : GenerationResult, 'Err' : IDL.Text })],
        [],
      ),
    'initialize_tokenizer' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
