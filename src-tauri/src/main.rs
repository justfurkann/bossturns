// BOSS TURNS — masaüstü kılıfı.
// Oyunun kendisi ../index.html'dir (tek kaynak). Burada yalnızca tarayıcının
// yapamadığı şeyler var: global patron tuşu ve sistem tepsisi.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Global patron tuşu: pencere odakta olmasa bile çalışır.
fn boss_key() -> Shortcut {
    Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space)
}

/// Pencereyi anında gizle / geri getir. Gizlerken oyunu duraklatır.
fn toggle_window(app: &AppHandle) {
    let Some(w) = app.get_webview_window("main") else { return };
    if w.is_visible().unwrap_or(false) && !w.is_minimized().unwrap_or(false) {
        let _ = w.eval("window.__btDesktopHide && window.__btDesktopHide()");
        let _ = w.hide();
    } else {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if shortcut == &boss_key() && event.state() == ShortcutState::Pressed {
                        toggle_window(app);
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Kısayol başka bir programda kullanılıyorsa oyun yine de açılsın.
            if let Err(e) = app.global_shortcut().register(boss_key()) {
                eprintln!("Patron tuşu kaydedilemedi: {e}");
            }

            let toggle = MenuItem::with_id(app, "toggle", "Göster / Gizle  (Ctrl+Shift+Boşluk)", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle, &quit])?;

            let mut tray = TrayIconBuilder::new()
                .tooltip("BOSS TURNS")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle" => toggle_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        toggle_window(tray.app_handle());
                    }
                });
            if let Some(icon) = app.default_window_icon() {
                tray = tray.icon(icon.clone());
            }
            tray.build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("BOSS TURNS başlatılamadı");
}
