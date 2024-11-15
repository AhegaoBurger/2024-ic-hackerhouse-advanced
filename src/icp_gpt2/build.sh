#!/bin/bash
set -ex

export RUSTFLAGS=$RUSTFLAGS' -C target-feature=+simd128'
cargo build --release --target=wasm32-wasi
wasi2ic ./target/wasm32-wasi/release/icp_gpt2.wasm ./target/wasm32-wasi/release/icp_gpt2-ic.wasm
wasm-opt -Os -o ./target/wasm32-wasi/release/icp_gpt2-ic.wasm \
        ./target/wasm32-wasi/release/icp_gpt2-ic.wasm