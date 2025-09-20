import { createBinding, createComputed, createState, For, State, With } from "ags"
import { Gtk } from "ags/gtk4"

import AstalNetwork from "gi://AstalNetwork";

import lang from "../lang"
import AstalBluetooth from "gi://AstalBluetooth";
import { exec } from "ags/process";
import AstalWp from "gi://AstalWp";


function ConnectionButton(
    { name, strength, connect_image, disconnect_image, onConnect, onDisconnect, connected = false, ...props }:
        {
            name: string, strength: number, connect_image: string, disconnect_image: string,
            onConnect: CallableFunction, onDisconnect: CallableFunction, connected: boolean
        }) {
    const [button_visible, set_button_visible] = createState<boolean>(false)
    const [connected_, set_connected] = createState<boolean>(connected)
    const [button_enable, set_button_enable] = createState<boolean>(true)
    return <box
        class="connection-button"
        orientation={Gtk.Orientation.VERTICAL}
        width_request={256}
        {...props}>
        <box $type="start">
            <Gtk.GestureClick onEnd={() => set_button_visible(prev => !prev)} />
            <box>
                <image icon_name={"nm-signal-" + String((strength - strength % 25) !== 0 ? (strength - strength % 25) : "00")} pixel_size={24} />
                <label label={name} />
            </box>

        </box>

        <box $type="end" visible={button_visible} orientation={Gtk.Orientation.HORIZONTAL}>
            <box $type="start" hexpand>
                <label label="Info" />
            </box>
            <box $type="end">

                <button sensitive={button_enable} onClicked={() => {
                    set_button_enable(false)
                    let result;
                    if (connected_.get()) {
                        result = onDisconnect()
                    } else {
                        result = onConnect()
                    }
                    set_button_enable(true)
                    if (result) {
                        console.log("Failed to connect to " + name + ":" + result)
                        exec(["notify-send", lang["failed-to-connect"].replace("{wifi}", name), result])
                        return
                    }
                    set_connected(prev => !prev)

                }}>
                    <With value={connected_}>
                        {connected_ => <label label={connected_ ? lang["disconnect"] : lang["connect"]} />}
                    </With>
                </button>

            </box>
        </box>
    </box>
}

function AudioComponent({ device }: { device: AstalWp.Endpoint }) {
    return <box class="audio-component" orientation={Gtk.Orientation.HORIZONTAL}>
        <image $type="start" iconName={device.volumeIcon} pixelSize={24} />
        <box $type="end" orientation={Gtk.Orientation.VERTICAL} hexpand>
            <label $type="start" label={device.description!} />
            <slider $type="center" min={0} max={100} value={createBinding(device, "volume")} />
        </box>

    </box>
}

function Network() {
    const network = AstalNetwork.get_default()
    const wifi = createBinding(network, "wifi")

    const get_access = (wifi: AstalNetwork.AccessPoint) => {
        const wpa_flags = exec("bash -c \"nmcli device wifi list bssid " + wifi.bssid + " |awk '$9!=\"SECURITY\" {print $9}'\"")

        if (wpa_flags.includes("WPA")) {
            if (!wifi.ssid) {
                let [ssid, password] = exec(["zenity", "--forms", "--add-entry=SSID", "--add-password=" + lang["password"]]).split("|")
                return [ssid, "name", wifi.bssid, "bssid", wifi.bssid, "hidden", "yes"]
            }
            const password = exec(["zenity", "--password", "--title", lang["input-wifi-password"]])
            console.log(password)
            return [wifi.ssid, "password", password]
        }


        return []
    }

    network.wifi.scan()

    return <box vexpand class="content-box">

        <box orientation={Gtk.Orientation.VERTICAL}>
            <With value={createComputed([wifi], wifi => wifi.active_access_point)}>
                {(ap: AstalNetwork.AccessPoint) => ap ? (
                    <box css={"margin: 0; margin-top: 10px;"} orientation={Gtk.Orientation.VERTICAL}>
                        <ConnectionButton
                            name={ap.ssid ? ap.ssid : (ap.bssid ? lang["hidden-network"] : "")}
                            strength={ap.strength}
                            connect_image="network-connect" disconnect_image="network-disconnect"
                            onConnect={() => {
                                try {
                                    exec(["nmcli", "connection", "up", ap.ssid ? ap.ssid : ap.bssid])
                                } catch (e) {
                                    try {
                                        exec(
                                            ["nmcli", "device", "wifi", "connect",
                                                ap.ssid ? ap.ssid : ap.bssid]
                                                .concat(get_access(ap))
                                        )
                                        return 0
                                    } catch (e: any) {
                                        return e.message
                                    }
                                }


                            }}
                            onDisconnect={() => {
                                return exec(["nmcli", "connection", "down", ap.ssid ? ap.ssid : ap.bssid])
                            }}
                            connected={true}
                        />

                    </box>
                ) : <label label={lang["no-active-network"]} />
                }
            </With>
            <Gtk.Separator margin_top={4} margin_bottom={4} />
            <For each={createComputed([wifi], wifi => {
                let new_aps = new Map<String, AstalNetwork.AccessPoint>();
                wifi.access_points.forEach(ap => {
                    if ((ap.ssid && !new_aps.has(ap.ssid)) || !new_aps.has(ap.bssid)) {
                        new_aps.set(ap.ssid ? ap.ssid : ap.bssid, ap);
                    }
                })
                return Array.from(new_aps.values()).sort((a, b) => b.strength - a.strength).filter(
                    ap => !wifi.active_access_point || ap !== wifi.active_access_point && ap.ssid !== wifi.active_access_point.ssid
                )
            })}>
                {(wifi: AstalNetwork.AccessPoint) => {
                    return <ConnectionButton
                        name={wifi.ssid ? wifi.ssid : (wifi.bssid ? lang["hidden-network"] : "")}
                        strength={wifi.strength}
                        connect_image="network-connect" disconnect_image="network-disconnect"
                        onConnect={() => {
                            try {
                                exec(["nmcli", "connection", "up", wifi.ssid ? wifi.ssid : wifi.bssid])
                            } catch (e) {
                                try {
                                    exec(["nmcli", "device", "wifi", "connect"].concat(get_access(wifi)))
                                    return 0
                                } catch (e: any) {
                                    return e.message
                                }
                            }


                        }}
                        onDisconnect={() => {
                            return exec(["nmcli", "connection", "down", wifi.ssid ? wifi.ssid : wifi.bssid])
                        }}
                        connected={false}
                    />
                }}
            </For>
        </box>

    </box>
}

function Bluetooth() {
    const bluetooth = AstalBluetooth.get_default()
    bluetooth.adapter.start_discovery()
    const adapter = createBinding(bluetooth, "adapter")
    return <box vexpand class="content-box" onDestroy={bluetooth.adapter.stop_discovery}>
        <box orientation={Gtk.Orientation.VERTICAL}>

        </box>
    </box>
}

function Audio() {
    const wp = AstalWp.get_default()
    const audio = createBinding(wp, "audio")
    return <box vexpand class="content-box">
        <box orientation={Gtk.Orientation.VERTICAL}>
            <For each={audio.as(audio => audio.speakers)}>{(speaker: AstalWp.Endpoint) => (
                <AudioComponent device={speaker} />
            )}</For>
        </box>
    </box>
}


export default function ({ mode, ...props }: { mode: State<number> }) {
    const [mode_, set_mode] = mode;
    const mode_names = [lang["network"], lang["bluetooth"], "Audio"];
    const mode_images = ["network-connect", "blueman-active", "audio-card"];
    const mode_widgets = [Network, Bluetooth, Audio]

    const [menu_active, set_menu_active] = createState<boolean>(false)

    return <centerbox class="control-popup-main" orientation={Gtk.Orientation.VERTICAL}>
        <box $type="start" class="title-box">
            <menubutton
                vexpand
                $type="start"
                onActivate={() => set_menu_active(true)}
                onHide={() => set_menu_active(false)}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                    <label $type="start" label={createComputed([mode_], mode_ => mode_names[mode_])} />
                    <label label="" hexpand />
                    <image $type="end" icon_name="arrow-down" />
                </box>
                <popover>
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        {
                            mode_names.map((val, index) => <button onClicked={() => set_mode(index)}>{val}</button>)
                        }

                    </box>
                </popover>
            </menubutton>
            <box vexpand $type="end">
                <With value={mode_}>
                    {mode_ => (
                        <image icon_name={mode_images[mode_]} />
                    )}
                </With>

                <switch />
            </box>
        </box>
        <With value={mode_}>
            {mode_ => (
                <scrolledwindow max_content_height={324} height_request={324} width_request={304} $type="center">
                    {mode_widgets[mode_]()}
                </scrolledwindow>
            )}
        </With>
        <box></box>
    </centerbox>
}