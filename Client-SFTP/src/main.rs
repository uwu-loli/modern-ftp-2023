#[path = "extensions/events_core.rs"]
mod events_core;

#[path = "extensions/exts.rs"]
mod exts;

#[path = "extensions/structs.rs"]
mod structs;

mod client;
use client::*;

mod commands;

use events_core::*;

use std::thread;
use std::time::Duration;

use crate::structs::ConnectPass;

fn main() {
    custom_reader::inject_method(connect_met);

    //*
    thread::spawn(|| {
        thread::sleep(Duration::from_millis(500));
        println!("Ready");
    });
    custom_reader::init();
    //*

    /*
    thread::spawn(|| custom_reader::init());


    thread::sleep(Duration::from_millis(10000));
    println!("Ready");
    */

    fn connect_met(data: &JsonTalk) {
        if data.event.as_str() == "connect" {
            let args_parse: Result<ConnectPass, serde_json::Error> = serde_json::from_value(data.args.clone());
            if args_parse.is_ok() {
                let connect_args: ConnectPass = args_parse.unwrap();
                let client = Client::init(connect_args.host, connect_args.port, connect_args.user, connect_args.password);
                commands::startup(client);
            }
            custom_reader::uninject_method(connect_met);
        }
    }
}