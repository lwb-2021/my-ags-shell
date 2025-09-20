import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk"
import Gdk from "gi://Gdk"
import { exec } from "ags/process";
import { State } from "ags";

const { TOP, RIGHT, LEFT, BOTTOM } = Astal.WindowAnchor

export default function LogoutScreen({ visible, ...props }: { visible: State<boolean> }) {
    const [visible_, setter] = visible;

    function onKey(
        _e: Gtk.EventControllerKey,
        keyval: number,
        _: number,
        mod: number,
    ) {
        if (keyval === Gdk.KEY_Escape) {
            setter(false)
            return
        }
    }

    return <window
        class="logout-screen"
        visible={visible_}

        anchor={TOP | RIGHT | LEFT | BOTTOM}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}

    >
        <Gtk.EventControllerKey onKeyPressed={onKey} />
        <centerbox orientation={Gtk.Orientation.HORIZONTAL}>
            <centerbox $type="center" orientation={Gtk.Orientation.VERTICAL}>
                <centerbox $type="center" orientation={Gtk.Orientation.VERTICAL}>
                    <box $type="start">
                        <button onClicked={() => exec("hyprctl dispatch exit")}><image icon_name="xfsm-logout" pixel_size={48}/></button>
                        <button onClicked={() => exec("")}><image icon_name="xfsm-switch-user" pixel_size={48}/></button>
                        <button onClicked={() => exec("hyprlock")}><image icon_name="xfsm-lock" pixel_size={48}/></button>
                        <button onClicked={() => exec("")}><image icon_name="xfsm-upgrade" pixel_size={48}/></button>
                    </box>
                    <box $type="end">
                        <button onClicked={() => exec("systemctl poweroff")}><image icon_name="xfsm-shutdown" pixel_size={48}/></button>
                        <button onClicked={() => exec("systemctl reboot")}><image icon_name="xfsm-reboot" pixel_size={48}/></button>
                        <button onClicked={() => exec("systemctl suspend")}><image icon_name="xfsm-suspend" pixel_size={48}/></button>
                        <button onClicked={() => exec("systemctl hibernate")}><image icon_name="xfsm-hibernate" pixel_size={48}/></button>
                    </box>
                </centerbox>
            </centerbox>
        </centerbox>
    </window>
}