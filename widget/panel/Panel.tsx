import { Astal, Gdk, Gtk } from "ags/gtk4";
import { State } from "gnim";

export default function Panel(monitor: Gdk.Monitor, visible: State<boolean>) {
  const { BOTTOM, TOP, RIGHT } = Astal.WindowAnchor;
  return <window
    visible={visible[0]}
    class="panel"
    gdkmonitor={monitor}

    anchor={BOTTOM | TOP | RIGHT}
  >
    <revealer
      reveal_child={visible[0]}
      transition_type={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transition_duration={10}
    >
      <box
        class="content"
      >

      </box>
    </revealer>
  </window>
}
