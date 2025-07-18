use std::io;
use winres::WindowsResource;
use time::OffsetDateTime;

fn main() -> io::Result<()> {
    if cfg!(target_os = "windows") {
        WindowsResource::new()
            .set_icon("../Bins/build.ico")
            .set("ProductName", "Client-SFTP [ModernFT]")
            .set("FileDescription", "SFTP Client for Modern File Transfer")
            .set("LegalCopyright", format!("Copyright © fydne {}", OffsetDateTime::now_utc().year()).as_str())
            .compile()
            .unwrap();
    }
    Ok(())
}