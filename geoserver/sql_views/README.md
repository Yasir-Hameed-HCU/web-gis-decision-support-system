# GeoServer SQL views

One `.sql` file per published layer, holding the query behind its GeoServer
**SQL View**, so the publication is reproducible rather than configured by hand
and forgotten.

| File | Layer |
|---|---|
| `accessibility_*.sql` | travel-time surface, one per service group |
| `fragility_*.sql` | fragility index surface, one per service group |
| `vulnerability_*.sql` | district vulnerability surface, one per service group |
| `scenario_diff.sql` | per-cell difference between a scenario and the baseline |

## Recreating a layer

In the GeoServer web interface, add a new layer to the PostGIS store, choose
**Configure new SQL view**, paste the file's contents, declare the geometry
column as the file's comment states, set the SRS to EPSG:25832, then compute the
bounding boxes from the data.

Styling is applied with the Styled Layer Descriptor files alongside, so a layer
renders identically wherever it is published.

The store should connect as the least-privilege role created by
`db/init/01_create_readonly_role.sql`, not as a superuser.
