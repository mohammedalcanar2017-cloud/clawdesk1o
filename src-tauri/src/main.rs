#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;
use base64::engine::general_purpose;
use base64::Engine as _;

#[tauri::command]
fn capture_screen() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis();
        
        let temp_file = format!("/tmp/clawdesk_screenshot_{}.png", timestamp);
        
        // Capturar pantalla con screencapture (macOS nativo)
        let output = Command::new("screencapture")
            .arg("-x")
            .arg(&temp_file)
            .output()
            .map_err(|e| format!("Failed to capture screenshot: {}", e))?;
        
        if !output.status.success() {
            return Err("screencapture command failed".to_string());
        }
        
        // Leer y codificar la imagen
        let image_data = std::fs::read(&temp_file)
            .map_err(|e| format!("Failed to read screenshot: {}", e))?;
        
        // Limpiar archivo temporal
        let _ = std::fs::remove_file(&temp_file);
        
        let base64_data = general_purpose::STANDARD.encode(&image_data);
        Ok(base64_data)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok("This build is for macOS only".to_string())
    }
}

#[tauri::command]
fn mouse_click(x: i32, y: i32) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // AppleScript para hacer clic en macOS
        let script = format!(
            r#"
            tell application "System Events"
                click at {{{}, {}}}
            end tell
            "#,
            x, y
        );
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| format!("Failed to execute mouse click: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
fn keyboard_type(text: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // AppleScript para escribir texto
        let escaped_text = text.replace("\"", "\\\"");
        let script = format!(
            r#"
            tell application "System Events"
                keystroke "{}"
            end tell
            "#,
            escaped_text
        );
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| format!("Failed to type text: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
fn test_connection() -> String {
    "✅ CLAWDESK Ultimate is ready!".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            capture_screen,
            mouse_click,
            keyboard_type,
            test_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}