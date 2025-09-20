import app from "ags/gtk4/app"
import { createState } from "ags"
import style from "./style.scss"
import Bar from "./widget/bar/Bar"
import LogoutScreen from "./widget/LogoutScreen"
import Dock from "./widget/dock/Dock"
import { ScreenBroderBottom } from "./widget/ScreenBorder"

app.start({
    css: style,
    main() {
        const logoutScreenVisible = createState(false)
        const dockVisible = createState(false)



        app.get_monitors().map((monitor) => Bar(monitor, logoutScreenVisible))
        app.get_monitors().map((monitor) => Dock(monitor, dockVisible))
        app.get_monitors().map((monitor) => ScreenBroderBottom(monitor, dockVisible))
        const logout_screen = <LogoutScreen visible={logoutScreenVisible} />
    },
})
