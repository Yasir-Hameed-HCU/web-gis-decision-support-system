"""Strip psql \\restrict / \\unrestrict meta-command lines from the gzipped dump
so it restores on psql < 17.6 (those wrapper commands were added Nov 2025 and the
PostGIS 17-3.5 image ships psql 17.5). Safe for restoring our own trusted data.
"""
import gzip, os

BS = chr(92)  # backslash
R1 = BS + "restrict"
R2 = BS + "unrestrict"

src = os.path.join(os.path.dirname(__file__), "init", "02_data.sql.gz")
tmp = src + ".tmp"

removed = 0
with gzip.open(src, "rt", encoding="utf-8", newline="") as fin, \
     gzip.open(tmp, "wt", encoding="utf-8", newline="") as fout:
    for line in fin:
        if line.startswith(R1) or line.startswith(R2):
            removed += 1
            continue
        fout.write(line)
os.replace(tmp, src)

with gzip.open(src, "rt", encoding="utf-8") as f:
    remaining = sum(1 for l in f if l.startswith(R1) or l.startswith(R2))
print("removed:", removed, "| remaining:", remaining, "| bytes:", os.path.getsize(src))
