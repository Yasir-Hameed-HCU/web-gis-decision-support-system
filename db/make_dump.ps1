# Generate db\init\02_data.sql.gz from a live healthcare_accessibility DB.
# Dumps only the runtime tables/views (excludes routing tables). PostGIS only.
param(
  [string]$PgBin = "C:\Program Files\PostgreSQL\17\bin",
  [string]$DbHost = "127.0.0.1",
  [string]$Port = "5432",
  [string]$Db   = "healthcare_accessibility",
  [string]$User = "postgres"
)
$out = Join-Path $PSScriptRoot "init\02_data.sql.gz"
$args = @(
  "-U",$User,"-h",$DbHost,"-p",$Port,"-d",$Db,
  "--no-owner","--no-privileges","--extension=postgis",
  "--exclude-table=road_network","--exclude-table=road_network_vertices_pgr",
  "--exclude-table=network_components","--exclude-table=topology",
  "--exclude-table=layer","--exclude-table=spatial_ref_sys"
)
# pg_dump -> plain .sql -> strip \restrict wrappers -> .NET gzip.
# The \restrict / \unrestrict psql meta-commands (emitted by pg_dump >= 17.6 /
# Nov-2025 security release) are dropped so the dump also restores on the PostGIS
# 17-3.5 image (psql 17.5), which doesn't understand them.
$sql = Join-Path $PSScriptRoot "init\02_data.sql"
& "$PgBin\pg_dump.exe" @args | Where-Object { $_ -notmatch '^\\(un)?restrict ' } |
  Out-File -Encoding utf8 $sql
$in = [System.IO.File]::OpenRead($sql); $o = [System.IO.File]::Create($out)
$gz = New-Object System.IO.Compression.GZipStream($o,[System.IO.Compression.CompressionMode]::Compress)
$in.CopyTo($gz); $gz.Close(); $o.Close(); $in.Close(); Remove-Item $sql
Write-Host "wrote $out ($([math]::Round((Get-Item $out).Length/1MB,1)) MB)"
