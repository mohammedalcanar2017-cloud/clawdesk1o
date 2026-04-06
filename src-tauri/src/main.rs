#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    clawdesk_lib::run();
}

// En un archivo separado o módulo
mod clawdesk_lib {
    use tauri::Manager;
    
    #[tauri::command]
    fn greet(name: &str) -> String {
        format!("Hello, {}! CLAWDESK is ready.", name)
    }
    
    #[tauri::command]
    fn get_status() -> String {
        "✅ CLAWDESK Ultimate is running".to_string()
    }
    
    pub fn run() {
        tauri::Builder::default()
            .setup(|app| {
                #[cfg(debug_assertions)]
                {
                    let window = app.get_webview_window("main").unwrap();
                    window.open_devtools();
                }
                Ok(())
            })
            .invoke_handler(tauri::generate_handler![greet, get_status])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    }
}