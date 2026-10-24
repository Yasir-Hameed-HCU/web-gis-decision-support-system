# Layer styles

One Styled Layer Descriptor per published layer. Keeping them here rather than
only inside the GeoServer data directory means a layer renders the same wherever
it is published, and a change to a class break or a colour shows up in a diff.

| File | Applies to |
|---|---|
| `accessibility_ylordr.sld` | travel-time surfaces, yellow to dark red |
| `fragility_class.sld` | fragility surfaces, stable / fragile / critical |
| `vulnerability_class.sld` | district vulnerability surfaces |
| `scenario_diff_rdbu.sld` | per-cell scenario difference |
| `hospitals_point.sld` | hospital points |
| `districts_outline.sld` | district boundaries |
| `cell_green.sld`, `cell_red.sld` | single-cell highlight used by the client |

## Applying one

In the GeoServer web interface, go to **Styles**, then **Add a new style**,
choose the `healthcare_mv` workspace, upload the file, then set it as the
default style on the matching layer. The SQL behind each layer is in
`../sql_views/`.
