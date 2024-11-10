use candid::{CandidType, Deserialize};
use ic_cdk::export::candid::candid_method;
use serde::Serialize;
use std::collections::HashMap;
use std::cell::RefCell;

// Import from our sibling module
use crate::onnx;

#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct TokenizerResult {
    pub tokens: Vec<i64>,
    pub text: String,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct GenerationResult {
    pub text: String,
    pub tokens: Vec<i64>,
}

thread_local! {
    static VOCAB: RefCell<HashMap<String, i64>> = RefCell::new(HashMap::new());
    static MERGES: RefCell<HashMap<(String, String), i64>> = RefCell::new(HashMap::new());
}

// Make init public so lib.rs can call it
pub fn init() {
    let vocab = init_vocab();
    let merges = init_merges();
    
    VOCAB.with(|v| *v.borrow_mut() = vocab);
    MERGES.with(|m| *m.borrow_mut() = merges);
}

fn init_vocab() -> HashMap<String, i64> {
    let mut vocab = HashMap::new();
    vocab.insert("<|endoftext|>".to_string(), 50256);
    vocab
}

fn init_merges() -> HashMap<(String, String), i64> {
    let mut merges = HashMap::new();
    merges.insert(("he".to_string(), "llo".to_string()), 1);
    merges
}

#[ic_cdk::update]
#[candid_method(update)]
pub async fn generate_text(input: String, max_tokens: u8) -> Result<GenerationResult, String> {
    let tokenized = encode(input.clone());
    
    match onnx::model_inference(max_tokens, tokenized.tokens) {
        Ok(output_tokens) => {
            let output_text = decode(output_tokens.clone());
            
            Ok(GenerationResult {
                text: output_text,
                tokens: output_tokens,
            })
        },
        Err(e) => Err(format!("Model inference failed: {}", e)),
    }
}

#[ic_cdk::query]
#[candid_method(query)]
pub fn encode(text: String) -> TokenizerResult {
    let mut tokens = Vec::new();
    let words: Vec<&str> = text.split_whitespace().collect();
    
    for word in words {
        VOCAB.with(|v| {
            if let Some(&token_id) = v.borrow().get(word) {
                tokens.push(token_id);
            }
        });
    }

    TokenizerResult {
        tokens,
        text: text.clone(),
    }
}

#[ic_cdk::query]
#[candid_method(query)]
pub fn decode(tokens: Vec<i64>) -> String {
    let mut result = Vec::new();
    
    VOCAB.with(|v| {
        let vocab = v.borrow();
        for token in tokens {
            for (word, &id) in vocab.iter() {
                if id == token {
                    result.push(word.clone());
                    break;
                }
            }
        }
    });

    result.join(" ")
}

// Function to initialize tokenizer with vocabulary and merges
#[ic_cdk::update]
#[candid_method(update)]
fn initialize_tokenizer(vocab_bytes: Vec<u8>, merges_bytes: Vec<u8>) -> Result<(), String> {
    // Parse vocabulary JSON
    let vocab: HashMap<String, i64> = serde_json::from_slice(&vocab_bytes)
        .map_err(|e| format!("Failed to parse vocab: {}", e))?;
    
    // Parse merges file
    let merges = parse_merges(&merges_bytes)?;
    
    // Store in global state
    VOCAB.with(|v| *v.borrow_mut() = vocab);
    MERGES.with(|m| *m.borrow_mut() = merges);
    
    Ok(())
}

fn parse_merges(bytes: &[u8]) -> Result<HashMap<(String, String), i64>, String> {
    let content = String::from_utf8(bytes.to_vec())
        .map_err(|e| format!("Invalid UTF-8 in merges: {}", e))?;
    
    let mut merges = HashMap::new();
    let mut merge_id = 0;
    
    for line in content.lines().skip(1) {  // Skip header
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            merges.insert(
                (parts[0].to_string(), parts[1].to_string()),
                merge_id,
            );
            merge_id += 1;
        }
    }
    
    Ok(merges)
}

candid::export_service!();