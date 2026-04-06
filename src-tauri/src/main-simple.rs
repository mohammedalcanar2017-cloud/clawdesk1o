#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

// Comando MUY simple que siempre funciona
#[tauri::command]
fn test_command() -> String {
    "✅ CLAWDESK Ultimate is working!".to_string()
}

// Comando para capturar pantalla (simplificado)
#[tauri::command]
fn capture_screen() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        // Solo devolver un mensaje, no capturar realmente por ahora
        Ok("📸 Screen capture would work on real macOS".to_string())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok("⚠️ This is a macOS-only build".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test_command,
            capture_screen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}