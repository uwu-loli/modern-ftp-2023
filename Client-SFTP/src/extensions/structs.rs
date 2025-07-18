use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ConnectPass {
    pub host: String,
    pub port: u16,
    pub user: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct InvalidCertificate {
    pub key_type: String,
    pub hash: String,
}