#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;
use base64::engine::general_purpose;
use base64::Engine as _;

#[tauri::command]
fn capture_screen(quality: u8, width: Option<u32>) -> Result<String, String> {
    // Usar herramientas del sistema para captura de pantalla
    // En Linux: gnome-screenshot, scrot, etc.
    // En Windows: PowerShell
    // En macOS: screencapture
    
    #[cfg(target_os = "linux")]
    {
        let output = Command::new("gnome-screenshot")
            .arg("-f")
            .arg("/tmp/clawdesk_screenshot.png")
            .output()
            .map_err(|e| e.to_string())?;
        
        if !output.status.success() {
            return Err("Failed to capture screenshot".to_string());
        }
        
        // Leer y codificar la imagen
        let image_data = std::fs::read("/tmp/clawdesk_screenshot.png")
            .map_err(|e| e.to_string())?;
        
        let base64_data = general_purpose::STANDARD.encode(&image_data);
        Ok(base64_data)
    }
    
    #[cfg(target_os = "windows")]
    {
        // PowerShell command for Windows
        let ps_script = r#"
            Add-Type -AssemblyName System.Windows.Forms
            Add-Type -AssemblyName System.Drawing
            
            $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
            $bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            $graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
            
            $memoryStream = New-Object System.IO.MemoryStream
            $bitmap.Save($memoryStream, [System.Drawing.Imaging.ImageFormat]::Png)
            $bytes = $memoryStream.ToArray()
            [System.Convert]::ToBase64String($bytes)
            
            $graphics.Dispose()
            $bitmap.Dispose()
            $memoryStream.Dispose()
        "#;
        
        let output = Command::new("powershell")
            .arg("-Command")
            .arg(ps_script)
            .output()
            .map_err(|e| e.to_string())?;
        
        if output.status.success() {
            let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(result)
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("screencapture")
            .arg("-x")
            .arg("/tmp/clawdesk_screenshot.png")
            .output()
            .map_err(|e| e.to_string())?;
        
        if !output.status.success() {
            return Err("Failed to capture screenshot".to_string());
        }
        
        let image_data = std::fs::read("/tmp/clawdesk_screenshot.png")
            .map_err(|e| e.to_string())?;
        
        let base64_data = general_purpose::STANDARD.encode(&image_data);
        Ok(base64_data)
    }
    
    #[cfg(not(any(target_os = "linux", target_os = "windows", target_os = "macos")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

#[tauri::command]
fn mouse_click(x: i32, y: i32, button: String) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        // Usar xdotool en Linux
        let button_num = match button.as_str() {
            "left" => "1",
            "middle" => "2",
            "right" => "3",
            _ => return Err(format!("Unknown button: {}", button)),
        };
        
        Command::new("xdotool")
            .args(&["mousemove", &x.to_string(), &y.to_string()])
            .status()
            .map_err(|e| e.to_string())?;
        
        Command::new("xdotool")
            .args(&["click", button_num])
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "windows")]
    {
        // PowerShell para Windows
        let ps_script = format!(
            r#"
            Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);' -Name U32 -Namespace W;
            
            # Mover ratón
            [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point({}, {})
            
            # Hacer clic
            if ("{}" -eq "left") {{
                [W.U32]::mouse_event(0x0002, 0, 0, 0, 0) # MOUSEEVENTF_LEFTDOWN
                [W.U32]::mouse_event(0x0004, 0, 0, 0, 0) # MOUSEEVENTF_LEFTUP
            }} elseif ("{}" -eq "right") {{
                [W.U32]::mouse_event(0x0008, 0, 0, 0, 0) # MOUSEEVENTF_RIGHTDOWN
                [W.U32]::mouse_event(0x0010, 0, 0, 0, 0) # MOUSEEVENTF_RIGHTUP
            }}
            "#,
            x, y, button, button
        );
        
        Command::new("powershell")
            .arg("-Command")
            .arg(ps_script)
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        // AppleScript para macOS
        let script = format!(
            r#"
            tell application "System Events"
                set position of first button of first window of (process "SystemUIServer") to {{{}, {}}}
                if "{}" is equal to "left" then
                    click at {{{}, {}}}
                else if "{}" is equal to "right" then
                    right click at {{{}, {}}}
                end if
            end tell
            "#,
            x, y, button, x, y, button, x, y
        );
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn keyboard_type(text: String) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        Command::new("xdotool")
            .arg("type")
            .arg(&text)
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "windows")]
    {
        let ps_script = format!(
            r#"
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("{}")
            "#,
            text.replace("\"", "\"\"")
        );
        
        Command::new("powershell")
            .arg("-Command")
            .arg(&ps_script)
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        let script = format!(
            r#"
            tell application "System Events"
                keystroke "{}"
            end tell
            "#,
            text.replace("\"", "\\\"")
        );
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn get_screen_info() -> Result<Vec<ScreenInfo>, String> {
    // Información básica de pantalla
    let mut screens = Vec::new();
    
    #[cfg(target_os = "linux")]
    {
        // xrandr para Linux
        let output = Command::new("xrandr")
            .arg("--query")
            .output()
            .map_err(|e| e.to_string())?;
        
        let output_str = String::from_utf8_lossy(&output.stdout);
        for line in output_str.lines() {
            if line.contains(" connected ") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 3 {
                    let resolution = parts[2];
                    if let Some((width, height)) = resolution.split_once('x') {
                        screens.push(ScreenInfo {
                            id: screens.len() as u32,
                            x: 0,
                            y: 0,
                            width: width.parse().unwrap_or(1920),
                            height: height.parse().unwrap_or(1080),
                        });
                    }
                }
            }
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // PowerShell para Windows
        let ps_script = r#"
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.Screen]::AllScreens | ForEach-Object {
                Write-Output "$($_.Bounds.X),$($_.Bounds.Y),$($_.Bounds.Width),$($_.Bounds.Height)"
            }
        "#;
        
        let output = Command::new("powershell")
            .arg("-Command")
            .arg(ps_script)
            .output()
            .map_err(|e| e.to_string())?;
        
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for (i, line) in output_str.lines().enumerate() {
                let coords: Vec<&str> = line.split(',').collect();
                if coords.len() == 4 {
                    screens.push(ScreenInfo {
                        id: i as u32,
                        x: coords[0].parse().unwrap_or(0),
                        y: coords[1].parse().unwrap_or(0),
                        width: coords[2].parse().unwrap_or(1920),
                        height: coords[3].parse().unwrap_or(1080),
                    });
                }
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        // system_profiler para macOS
        let output = Command::new("system_profiler")
            .arg("SPDisplaysDataType")
            .output()
            .map_err(|e| e.to_string())?;
        
        let output_str = String::from_utf8_lossy(&output.stdout);
        // Parsear salida (simplificado)
        screens.push(ScreenInfo {
            id: 0,
            x: 0,
            y: 0,
            width: 2560,
            height: 1600,
        });
    }
    
    if screens.is_empty() {
        // Valores por defecto
        screens.push(ScreenInfo {
            id: 0,
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        });
    }
    
    Ok(screens)
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