use std::{env, path::Path};
use crate::events_core;
use serde_json::{json, Value};


#[allow(dead_code)]
pub fn log(message: String){
    let cls = events_core::JsonTalk{
        event: "log".to_string(),
        args: json!(message)
    };
    match serde_json::to_string(&cls) {
        Ok(write_str) => {
            println!("{}", write_str);
        }
        Err(_) => {}
    }
}

#[allow(dead_code)]
pub fn call_event(ev: String, arg: Value){
    let cls = events_core::JsonTalk{
        event: ev,
        args: arg,
    };
    match serde_json::to_string(&cls) {
        Ok(write_str) => {
            println!("{}", write_str);
        }
        Err(_) => {}
    }
}

#[allow(dead_code)]
pub fn get_appdata() -> String {
    if cfg!(windows) {
        let dir = env::var("APPDATA");
        return format!("{}", dir.unwrap_or_default());
    }
    if cfg!(unix) {
        let dir = env::var("HOME");
        let appdata = format!("{}", dir.unwrap_or_default());
        return format!("{:?}", Path::new(&appdata).join(".config"));
    }
    return format!("{}", env::temp_dir().display());
}