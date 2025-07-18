use std::env;
use std::str;
use std::process;

use sysinfo::{CpuRefreshKind, System, SystemExt};

mod system_met;

const VERSION: &str = env!("CARGO_PKG_VERSION");

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Command parameter not specified");
        process::exit(0); // aka return;
    }

    let binding = args[1].to_lowercase();
    let command = binding.as_str();

    match command {
        "version" => println!("{}", VERSION),

        //#region system stats
        "cpu" => {
            sysinfo::set_open_files_limit(1);
            let mut sys = System::new_all();
            sys.refresh_cpu_specifics(CpuRefreshKind::everything().with_cpu_usage());

            println!("{}", system_met::get_cpu_data(&sys));
        },
        "mem" => {
            let sys = System::new_all();
            println!("{}", system_met::get_mem_data(&sys));
        },
        "disk" => {
            sysinfo::set_open_files_limit(1);
            let mut sys = System::new();
            sys.refresh_disks_list();
            let disk = system_met::get_disk_data(&sys);
            

            println!("{} {}", disk.0, disk.1);
        },
        "load" => {
            sysinfo::set_open_files_limit(1);
            let mut sys = System::new_all();
            sys.refresh_disks_list();
            sys.refresh_cpu_specifics(CpuRefreshKind::everything().with_cpu_usage());
            let disk = system_met::get_disk_data(&sys);

            println!("cpu: {}", system_met::get_cpu_data(&sys));
            println!("mem: {}", system_met::get_mem_data(&sys));
            println!("disk: {} {}", disk.0, disk.1);
        }
        //#endregion

        _ => ()
    }
}