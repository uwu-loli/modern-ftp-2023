use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
pub struct JsonTalk {
    pub event: String,
    pub args: Value,
}

pub mod custom_reader{
    use crate::JsonTalk;
    
    pub static mut EVENTS: Vec<fn(&JsonTalk)> = Vec::new();
    
    pub fn init() {
        loop{
            let mut line = String::new();
            match std::io::stdin().read_line(&mut line) {
                Ok(_) => {
                    let new_line = line.replace('\n', "");
            
                    let res = serde_json::from_str(new_line.as_str());
                    match res {
                        Ok(arg) => {
                            unsafe{
                                for ev in &EVENTS{
                                    ev(&arg);
                                }
                            }
                        }
                        Err(err) => {
                            crate::exts::log(format!("[Error] Failed while parsing responses: {err}"));
                        }
                    }
                }
                Err(err) => {
                    crate::exts::log(format!("[Error] Failed while receiving responses: {err}"));
                }
            };
        }
    }
    
    pub fn inject_method(met: fn(&JsonTalk)){
        unsafe { EVENTS.push(met); }
    }

    pub fn uninject_method(met: fn(&JsonTalk)){
        unsafe{
            let pos = EVENTS.iter().position(|&x| x == met);
            if pos != Option::None {
                EVENTS.remove(pos.unwrap());
            }
        }
    }
}