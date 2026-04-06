#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;
use base64::engine::general_purpose;
use base64::Engine as _;

#[tauri::command]
fn capture_screen(quality: u8, width: Option<u32>) -> Result<String, String> {
    // Para macOS: usar screencapture nativo
    #[cfg(target_os = "macos")]
    {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis();
        
        let temp_file = format!("/tmp/clawdesk_screenshot_{}.png", timestamp);
        
        // Capturar pantalla con screencapture
        let output = Command::new("screencapture")
            .arg("-x")  // Sin sonido
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
        Err("This build is for macOS only".to_string())
    }
}

#[tauri::command]
fn mouse_click(x: i32, y: i32, button: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // AppleScript para control de ratón en macOS
        let script = match button.as_str() {
            "left" => format!(
                r#"
                tell application "System Events"
                    set position of first button of first window of (process "SystemUIServer") to {{{}, {}}}
                    click at {{{}, {}}}
                end tell
                "#,
                x, y, x, y
            ),
            "right" => format!(
                r#"
                tell application "System Events"
                    set position of first button of first window of (process "SystemUIServer") to {{{}, {}}}
                    right click at {{{}, {}}}
                end tell
                "#,
                x, y, x, y
            ),
            _ => return Err(format!("Unsupported button: {}", button)),
        };
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| format!("Failed to execute mouse click: {}", e))?;
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        return Err("This build is for macOS only".to_string());
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
    
    #[cfg(not(target_os = "macos"))]
    {
        return Err("This build is for macOS only".to_string());
    }
    
    Ok(())
}

#[tauri::command]
fn get_screen_info() -> Result<Vec<ScreenInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        // AppleScript para obtener información de pantalla
        let script = r#"
        tell application "Finder"
            get bounds of window of desktop
        end tell
        "#;
        
        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("Failed to get screen info: {}", e))?;
        
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let coords: Vec<&str> = output_str.trim().split(", ").collect();
            
            if coords.len() >= 4 {
                let width: u32 = coords[2].parse().unwrap_or(1440);
                let height: u32 = coords[3].parse().unwrap_or(900);
                
                return Ok(vec![ScreenInfo {
                    id: 0,
                    x: 0,
                    y: 0,
                    width,
                    height,
                }]);
            }
        }
        
        // Valores por defecto para Mac
        Ok(vec![ScreenInfo {
            id: 0,
            x: 0,
            y: 0,
            width: 1440,
            height: 900,
        }])
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("This build is for macOS only".to_string())
    }
}

#[derive(serde::Serialize)]
struct ScreenInfo {
    id: u32,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            capture_screen,
            mouse_click,
            keyboard_type,
            get_screen_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}