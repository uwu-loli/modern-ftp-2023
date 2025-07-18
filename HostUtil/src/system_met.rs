use sysinfo::{DiskExt, CpuExt, System, SystemExt};

pub fn get_cpu_data(sys: &System) -> u32 {
    let mut cpus: u32 = 0;
    let mut load: f32 = 0.0;

    for cpu in sys.cpus() {
        cpus += 1;
        load += cpu.cpu_usage();
    }

    return load as u32 / cpus;
}

pub fn get_mem_data(sys: &System) -> u64 {
    return 100 * sys.used_memory() / sys.total_memory();
}

pub fn get_disk_data(sys: &System) -> (u64, u64) {
    let mut size: u64 = 0;
    let mut total_size: u64 = 0;

    for disk in sys.disks() {
        size += disk.total_space() - disk.available_space();
        total_size += disk.total_space();
    }

    return (100 * size / total_size, size);
}