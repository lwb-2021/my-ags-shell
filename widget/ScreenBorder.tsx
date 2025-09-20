import { Gtk, Astal, Gdk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { State } from "gnim";

export function ScreenBroderBottom(gdkmonitor: Gdk.Monitor, [dockVisible, setDockVisible]: State<boolean>) {
    return <window
        visible
        class="screen-border-bottom"
        anchor={Astal.WindowAnchor.BOTTOM}
        gdkmonitor={gdkmonitor}
        application={app}
        exclusivity={Astal.Exclusivity.IGNORE}

        height_request={4}
        width_request={320}
    >
        <Gtk.EventControllerMotion
            onEnter={() => setDockVisible(true)}
        />
        <revealer
            reveal_child={dockVisible.as((dockVisible) => !dockVisible)}
            transition_type={Gtk.RevealerTransitionType.CROSSFADE}>
            <box class="screen-border-bottom-content" />
        </revealer>
    </window>

}