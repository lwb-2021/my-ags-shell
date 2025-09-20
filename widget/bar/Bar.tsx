import app from "ags/gtk4/app"
import GLib from "gi://GLib"
import { createState, createBinding, For, createComputed, With, Accessor, Setter, State } from "ags"

import { Astal, Gdk, Gtk } from "ags/gtk4"

import AstalBattery from "gi://AstalBattery"
import Mpris from "gi://AstalMpris"
import AstalTray from "gi://AstalTray"
import AstalNetwork from "gi://AstalNetwork"
import AstalBluetooth from "gi://AstalBluetooth"
import AstalHyprland from "gi://AstalHyprland"
import AstalWp from "gi://AstalWp"
import { createPoll } from "ags/time"
import lang from "../lang"
import ControlPopup from "./ControlPopup"
import { search_icon } from "../utils"

function Logo() {
  return <image pixel_size={24} class="logo" icon_name={GLib.get_os_info("LOGO") || "missing-symbolic"} />
}

function Workspaces() {
  const hyprland = AstalHyprland.get_default()
  // const workspaces = createBinding(hyprland, "workspaces")
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace")
  return <box class="workspaces">
    {
      [...new Array(10).keys()].map((workspace) => (
        <label
          label={(workspace + 1).toString()}
          class="workspace"
          css={focusedWorkspace.as(focusedWorkspace =>
          ("color: " +
            ((focusedWorkspace.id === workspace + 1) ? "purple" : "gray") +
            ";")
          )}
        />
      ))
    }
  </box>
}

function Media() {
  const mpris = Mpris.get_default()
  const players = createBinding(mpris, "players")
  const [index, set_index] = createState(0);
  const player = createComputed([players, index], (players, index) => players[index])
  return <menubutton>
    <label label={player.as(player => player.title + (player.artist ? " - " + player.artist : ""))} />
    <popover class="media-controller">
      <centerbox orientation={Gtk.Orientation.VERTICAL}>
        <box $type="start" orientation={Gtk.Orientation.VERTICAL}>
          <label $type="start" class="title" label={player.as(player => player.title ?
            (player.title.length > 20 ? player.title.slice(0, 20) + "..." : player.title) : lang["no-media"])} />
          <label $type="end" class="artist" label={player.as(player => player.artist ? player.artist : lang["unknown"])} />
        </box>
        <box orientation={Gtk.Orientation.HORIZONTAL} $type="center">
          <button $type="start" sensitive={index.as(index => index > 0)} onClicked={() => set_index(prev => prev - 1)}>
            <image icon_name="draw-arrow-back" />
          </button>

          <box hexpand $type="center" css={
            player.as(player =>
              `background-image: url(${player.cover_art});`
            )
          } />
          <button $type="end" sensitive={index.as(index => index < mpris.players.length - 1)} onClicked={() => set_index(prev => prev + 1)}>
            <image icon_name="draw-arrow-forward" />
          </button>
        </box>
        <box $type="end" orientation={Gtk.Orientation.HORIZONTAL} class="controller">
          <label hexpand $type="start" />
          <box $type="center" orientation={Gtk.Orientation.HORIZONTAL}>
            <button $type="start"></button>
            <button $type="center"
              onClicked={() => mpris.get_players()[index.get()].play_pause()}
              label={player.as(player => player.can_pause ? "" : "")}
            ></button>
            <button $type="end"></button>
          </box>

          <label hexpand $type="end" />
        </box>
      </centerbox>

    </popover>
  </menubutton>
}

function Tray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items")

  const init = (menu: Gtk.PopoverMenu, item: AstalTray.TrayItem) => {
    menu.menu_model = item.menu_model
    menu.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
      menu.insert_action_group("dbusmenu", item.actionGroup)
    })
  }

  return (
    <box class="tray">
      <For each={items}>
        {(item) => {
          const [popover_enabled, set_popover_enabled] = createState(false);
          return <box class="tray-item">
            <Gtk.EventControllerLegacy onEvent={(event) => {
              let e = event.get_current_event();
              if (e instanceof Gdk.ButtonEvent) {
                if (e.get_button() === 1 && e.get_event_type() === 3) {
                  // 左键
                  item.activate(e.get_axis(Gdk.AxisUse.X)[1], e.get_axis(Gdk.AxisUse.Y)[1]);
                } else if (e.get_button() === 3 && e.get_event_type() === 3) {
                  set_popover_enabled(prev => !prev);
                }
              }
            }} />
            <image
              pixel_size={24}
              icon_name={search_icon(item.iconName) ? createComputed([createBinding(item, "iconName")], (name) => search_icon(name)!) : undefined}
              gicon={search_icon(item.iconName) ? undefined : createBinding(item, "gicon")}
            />
            <Gtk.PopoverMenu
              visible={popover_enabled}
              $={(self) => init(self, item)}
            />
          </box>
        }}
      </For>
    </box>
  )
}

function Network() {
  const network = AstalNetwork.get_default()
  const wifi = createBinding(network, "wifi")
  const wired = createBinding(network, "wired")
  return <box
    class="network"
    visible={wifi.as(Boolean) || wired.as(Boolean)}
  >
    <image pixel_size={24} visible={wifi.as(Boolean)} icon_name={wifi.get() ? wifi.as(wifi => ("nm-signal-" + String((wifi.strength - wifi.strength % 25) !== 0 ? (wifi.strength - wifi.strength % 25) : "00"))) : undefined} />
    <image pixel_size={24} visible={wired.as(Boolean)} icon_name={wired.get() ? wired.as(wired => wired.iconName) : undefined} />
  </box>

}

function Bluetooth() {
  const bluetooth = AstalBluetooth.get_default()
  const active = createBinding(bluetooth, "is_connected")
  return <image pixel_size={24} class="bluetooth" icon_name={active.as(active => (active ? "bluetooth-active" : "bluetooth"))} />
}

function Audio() {
  const wp = AstalWp.get_default()!
  const audio = createBinding(wp, "audio")
  return <image pixel_size={24} class="audio" icon_name={audio.as(audio => {
    if (audio.default_speaker.volume == 0) {
      return "audio-volume-off"
    } else if (0 < audio.default_speaker.volume && audio.default_speaker.volume < 30) {
      return "audio-volume-low"
    } else if (30 <= audio.default_speaker.volume && audio.default_speaker.volume < 60) {
      return "audio-volume-medium"
    } else if (60 <= audio.default_speaker.volume) {
      return "audio-volume-high"
    } else {
      return "audio-volume-zero-panel"
    }
  })} />

}


function Battery() {
  const bat = AstalBattery.get_default()
  return <box class="battery"
    visible={createBinding(bat, "isPresent")}>
    <image icon_name={createBinding(bat, "batteryIconName")} />
    <label label={createBinding(bat, "percentage").as(p =>
      `${Math.floor(p * 100)} %`
    )} />
  </box>
}

function Time({ format = "%H:%M" }) {
  const time = createPoll("", 1000, () =>
    GLib.DateTime.new_now_local().format(format)!)
  return <label
    class="time"
    label={time}
  />
}

function Indicators() {
  let popover_visible = createState(false)
  let mode = createState(0)
  return <menubutton class="indicators">
    <box>
      <Network />
      <Bluetooth />
      <Audio />
      <Battery />
    </box>
    <popover>
      <ControlPopup mode={mode} />
    </popover>

  </menubutton>
}

function PowerMenu({ screen_visible }: { screen_visible: State<boolean> }) {
  const [variable, setter] = screen_visible
  return <button class="power-menu"
    onClicked={() => { setter(prev => !prev) }}
  >
    <image pixel_size={24} icon_name="system-shutdown" />
  </button>
}

export default function Bar(monitor: Gdk.Monitor, screen_visible: State<boolean>) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
  const hyprland = AstalHyprland.get_default()
  return <window
    visible
    class="bar"
    gdkmonitor={monitor}

    layer={Astal.Layer.TOP}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    anchor={TOP | LEFT | RIGHT}
    application={app}
    css={createComputed([createBinding(hyprland, "focused_workspace")], workspace => ((!workspace || workspace.clients.length !== 1) ? "border-radius: 16px;margin: 2px 2px 0;" : "border-radius: 0;margin: 0;"))}
  >
    <centerbox>
      <box $type="start">
        <Logo />
        {/* <Workspaces /> */}
      </box>
      <box $type="center" >
        <Media />
      </box>
      <box $type="end">
        <Tray />
        <Indicators />
        <Time />
        <PowerMenu screen_visible={screen_visible} />
      </box>

    </centerbox>
  </window>
}
