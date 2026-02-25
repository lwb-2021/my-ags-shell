import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalHyprland from "gi://AstalHyprland";
import { Accessor, createBinding, For, State } from "gnim";

import { search_icon } from "../utils";
import { Process } from "ags/process";

function Pinned({ app, cmd = app }: { app: string, cmd?: string }) {
    return <button class="pinned" onClicked={() => {
        Process.execAsync(cmd)
    }}>
        <image icon_name={search_icon(app)!} pixelSize={40} />
    </button>
}

function Tasks() {
    const hyprland = AstalHyprland.get_default();
    const clients = createBinding(hyprland, "clients");
    return <box class="tasks" $type="center">
        <For each={clients}>
            {(client) => (
                <button
                    class="client"
                    onClicked={() => { client.focus() }}
                >
                    <image icon_name={(() => {
                        let icon = search_icon(client.initialClass)
                        if (icon) return icon
                        else return "application-x-executable"
                    })()} pixel_size={40} />
                </button>
            )}
        </For>
    </box>
}


function AppLauncher() {
    return <box $type="start" class="app-launcher">
        <Pinned app="thunar" />
        <Pinned app="firefox" />
        <Pinned app="element-desktop" />
        <Pinned app="anki" />

        <Pinned app="wechat" />
        <Pinned app="qq" />
    </box>
}


export default function Dock(monitor: Gdk.Monitor, [dock_visible, set_dock_visible]: State<boolean>) {
    const { BOTTOM } = Astal.WindowAnchor;
    const hyprland = AstalHyprland.get_default()
    const clients = createBinding(hyprland, "clients")
    return <window
        visible={dock_visible}
        class="dock"
        gdkmonitor={monitor}
        layer={Astal.Layer.TOP}
        exclusivity={Astal.Exclusivity.IGNORE}


        anchor={BOTTOM}
        application={app}
    >
        <Gtk.EventControllerMotion onLeave={() => set_dock_visible(false)} />
        <box orientation={Gtk.Orientation.VERTICAL}>
            <box vexpand $type="start" />
            <revealer
                $type="center"
                reveal_child={dock_visible}
                transition_type={Gtk.RevealerTransitionType.SLIDE_UP}
                transition_duration={100}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} class="dock-inner" >
                    <box $type="start" hexpand />
                    <box
                        $type="center"
                        orientation={Gtk.Orientation.HORIZONTAL}

                        css={dock_visible.as(dock_visible => dock_visible ? "background-color: ;" : "background-color: transparent;")} >
                        <AppLauncher />
                        <Gtk.Separator
                            marginStart={0} marginEnd={4}
                            marginTop={8} marginBottom={8}
                            widthRequest={4}
                            visible={clients.as(clients => clients.length > 0)}
                        />
                        <Tasks />
                        <box $type="end" hexpand></box>
                    </box>
                    <box $type="end" hexpand />
                </box>
            </revealer>

        </box>

    </window >
}