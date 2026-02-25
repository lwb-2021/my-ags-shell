import app from "ags/gtk4/app"
import { createState } from "ags"
import style from "./style.scss"
import Bar from "./widget/bar/Bar"
import LogoutScreen from "./widget/LogoutScreen"
import Dock from "./widget/dock/Dock"
import { ScreenBroderBottom } from "./widget/ScreenBorder"
import Panel from "./widget/panel/Panel"

app.start({
  css: style,
  main() {
    const logoutScreenVisible = createState(false)
    const dockVisible = createState(false)
    const panelVisible = createState(false)



    app.get_monitors().map((monitor) => Bar(monitor, logoutScreenVisible, panelVisible))
    app.get_monitors().map((monitor) => Panel(monitor, panelVisible))
    // app.get_monitors().map((monitor) => Dock(monitor, dockVisible))
    app.get_monitors().map((monitor) => ScreenBroderBottom(monitor, dockVisible))
    app.get_monitors().map((monitor) => <LogoutScreen monitor={monitor} visible={logoutScreenVisible} />)
  },
})
