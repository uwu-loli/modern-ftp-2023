use std::{net::TcpStream, fs, path::Path};
use ssh2::{Session, Sftp, HashType, HostKeyType};
use sha2::{Sha256, Sha512, Digest};
use serde_json::json;

use crate::exts;

pub struct Client {
    pub session: Session,
    pub sftp: Sftp,
}

impl Client {
    pub fn init(host: String, port: u16, user: String, password: String) -> Client {
        exts::log(format!("[Info] Connecting to host > {host}:{port}"));

        let tcp: TcpStream;
        match TcpStream::connect(format!("{}:{}", host, port)) {
            Ok(stream) => {
                tcp = stream;
                exts::log(format!("[Info] Created connection"));
            }
            Err(err) => {
                exts::log(format!("[Warn] Unable connect to host: {err}"));
                panic!("Unable create tcp connection");
            }
        }

        let mut sess = Session::new().unwrap();
        sess.set_tcp_stream(tcp);
        sess.handshake().unwrap();

        exts::log(sess.banner().unwrap_or("").to_string());

        { // check certificate
            let path_appdata = exts::get_appdata();
            let dir_path = Path::new(&path_appdata).join("ModernFileTransfer").join("Certificates");

            if !dir_path.exists() {
                fs::create_dir_all(&dir_path).unwrap_or_default();
            }

            let mut file_hasher = Sha256::new();
            file_hasher.update(format!("{user}@{host}:{port}"));
            let file_hash_name: String = format!("{:x}", file_hasher.finalize());
            let file_path = Path::new(&dir_path).join(file_hash_name);
            
            let mut key_hash = String::new();
            match sess.host_key_hash(HashType::Sha1) {
                None => {
                    if file_path.exists() {
                        exts::call_event("invalid.crt".to_string(), 
                        json!(crate::structs::InvalidCertificate{
                            key_type: "Unknow".to_string(), 
                            hash: "null".to_string()
                        }));
                        exts::log("[Warn] Cerificate not found".to_string());
                        panic!("Certificate not found");
                    }
                }
                Some(hash) => {
                    for byte in hash {
                        key_hash.push_str(&format!("{byte} "));
                    }
                }
            };
            
            let host_key: String;
            match sess.host_key() {
                None => {
                    host_key = "Unknow".to_string();
                }
                Some(key) => {
                    host_key = match key.1 {
                        HostKeyType::Rsa => "Rsa".to_string(),
                        HostKeyType::Dss => "Dss".to_string(),
                        HostKeyType::Ecdsa256 => "Ecdsa256".to_string(),
                        HostKeyType::Ecdsa384 => "Ecdsa384".to_string(),
                        HostKeyType::Ecdsa521 => "Ecdsa521".to_string(),
                        HostKeyType::Ed255219 => "Ed255219".to_string(),
                        HostKeyType::Unknown => "Unknow".to_string()
                    };
                }
            };

            let mut hasher = Sha512::new();
            hasher.update(format!("{host_key}+{key_hash}"));
            let pre_content = format!("{:x}", hasher.finalize());
            let content = pre_content.as_bytes();
            
            if file_path.exists() {
                match fs::read(&file_path) {
                    Ok(file_content) => {
                        if content != file_content {
                            exts::call_event("invalid.crt".to_string(), 
                            json!(crate::structs::InvalidCertificate{
                                key_type: host_key, 
                                hash: key_hash
                            }));
                            exts::log("[Warn] Cerificate missing".to_string());
                            panic!("Certificate not found");
                        }
                    }
                    Err(_) => {
                        exts::log("[Error] Unable to read the crt file".to_string());
                        panic!("Unable to read crt file");
                    }
                }
            } else {
                fs::write(file_path, content).unwrap_or(());
            }

            exts::log(format!("[Info] Received public key from host. Type: {host_key}"));
        }

        

        match sess.userauth_password(&user, &password) {
            Ok(()) => {
                exts::log(format!("[Info] Successfully authorized as {user}"));
            }
            Err(err) => {
                exts::log(format!("[Error] Unable authorized to host as {user}: {err}"));
                panic!("Unable authorized to host");
            }
        }
        drop(password);

        let sftp = sess.sftp().unwrap();

        exts::call_event("info-connected".to_string(), json!(true));

        let client = Client{
            session: sess,
            sftp
        };

        return client;
    }
/*
    pub fn init(host: String, port: u16, user: String) -> Client{

    } */
}