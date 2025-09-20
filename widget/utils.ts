import { Gdk, Gtk } from "ags/gtk4";

const theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
export function search_icon(name: string | null): string | undefined {
    if (!name) return undefined
    // if (name.includes(".png")) return undefined

    if (name.includes("localsend")) return "localsend"

    if (theme.has_icon(name)) return name
    if (theme.has_icon(name.toLowerCase())) return name.toLowerCase()
    if (theme.has_icon(name.replace(".", "").toLowerCase())) return name.replace(".", "").toLowerCase()

    console.log("Icon not found: " + name)
    return undefined
}   