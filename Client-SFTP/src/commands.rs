use std::{io::{Read, Write}, path::Path, fs::{File, self}};

use ssh2::Session;

use crate::{Client, exts};

pub fn startup(client: Client){
    check_installed(&client.session);
    loop{
        let mut s = String::new();
        let mut channel = client.session.channel_session().unwrap();
        channel.exec("/etc/HostUtil load").unwrap();
        channel.read_to_string(&mut s).unwrap();
        println!("{}", s.trim().len());
        println!("{}", s.trim());
        println!("---------------");
    }
}

fn check_installed(session: &Session) {
    let mut s = String::new();
    let mut channel = session.channel_session().unwrap();
    channel.exec("/etc/HostUtil version").unwrap();
    channel.read_to_string(&mut s).unwrap();

    if s.trim().len() != 0 {
        return;
    }

    let path_appdata = exts::get_appdata();
    let file_dir_path = Path::new(&path_appdata).join("ModernFileTransfer").join("Extensions");

    if !file_dir_path.exists() {
        fs::create_dir_all(&file_dir_path).unwrap_or_default();
    }

    let file_path = Path::new(&file_dir_path).join("HostUtil");

    if !file_path.exists() {
        match minreq::get("https://cdn.fydne.dev/another/7j22amm84p7f/hostutil").send() {
            Ok(res) => {
                fs::write(&file_path, res.as_bytes()).unwrap_or_default();
            },
            Err(_) => {
                exts::log("[Warn] Failed to download HostUtil".to_string());
            }
        }
    }

    if !file_path.exists() {
        exts::log("[Error] Failed to create a HostUtils file".to_string());
        return;
    }

    let mut file = File::open(file_path).unwrap();

    let need_bytes = file.metadata().unwrap().len();
    let need_bytes_usize: usize = need_bytes.try_into().unwrap();
    let mut uploaded_bytes: usize = 0;

    let mut remote_file = session.scp_send(Path::new("/etc/HostUtil"), 0o100, need_bytes, None).unwrap();
    
    while need_bytes_usize > uploaded_bytes {
        let mut buffer: [u8; 654000] = [0; 654000];
        match file.read(&mut buffer) {
            Ok(bytes_read) => {
                if bytes_read != 0 {
                    let mut up_bytes = 0;
                    while up_bytes < bytes_read {
                        let bytes_count = remote_file.write(&buffer[up_bytes..bytes_read]).unwrap();
                        up_bytes += bytes_count;
                    }
                    uploaded_bytes += up_bytes;
                }
            }
            Err(_) => {
                break;
            }
        }
    }

    remote_file.send_eof().unwrap();
    remote_file.wait_eof().unwrap();
    remote_file.close().unwrap();
    remote_file.wait_close().unwrap();
}