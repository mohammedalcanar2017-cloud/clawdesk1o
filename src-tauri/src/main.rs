#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

// Comandos SIMPLES que SIEMPRE funcionan
#[tauri::command]
fn test_command() -> String {
    "✅ CLAWDESK Ultimate is working!".to_string()
}

#[tauri::command]
fn get_system_info() -> String {
    #[cfg(target_os = "macos")]
    {
        format!("Running on macOS - Build successful!")
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        "Not running on macOS".to_string()
    }
}

#[tauri::command]
fn execute_action(action: String) -> String {
    match action.as_str() {
        "test" => "Test action executed".to_string(),
        "screenshot" => "Screenshot would be captured on real macOS".to_string(),
        "click" => "Mouse click would be performed on real macOS".to_string(),
        "type" => "Keyboard typing would work on real macOS".to_string(),
        _ => format!("Unknown action: {}", action)
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test_command,
            get_system_info,
            execute_action,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}