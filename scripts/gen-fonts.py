"""Cut static Google Sans Flex instances for the app (React Native can't drive variable axes).

Text family at optical size 16 (400/500/600/700) and Display family at optical size 48
(600/700), both with the ROND axis at 18 so terminals echo the round-capped mark, subset to
Latin + punctuation + currency so each file stays small.

Usage: python scripts/gen-fonts.py [path/to/GoogleSansFlex-full.ttf]
Source: https://github.com/googlefonts/googlesans-flex (SIL Open Font License 1.1).
"""

import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:\Projects\YOBUMA\design\fonts\GoogleSansFlex-full.ttf"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "fonts")

INSTANCES = [
    ("GoogleSansFlex-Text400", 16, 400),
    ("GoogleSansFlex-Text500", 16, 500),
    ("GoogleSansFlex-Text600", 16, 600),
    ("GoogleSansFlex-Text700", 16, 700),
    ("GoogleSansFlex-Display600", 48, 600),
    ("GoogleSansFlex-Display700", 48, 700),
]

# Basic Latin, Latin-1, Latin Extended-A, general punctuation, currency (J$ / ₵ / €), arrows, − × ✓
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x180))
    + list(range(0x2000, 0x2070))
    + list(range(0x20A0, 0x20C1))
    + [0x2190, 0x2192, 0x2212, 0x00D7, 0x2713, 0x2026, 0x2122]
)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name, opsz, wght in INSTANCES:
        font = TTFont(SRC)
        inst = instancer.instantiateVariableFont(
            font,
            {"opsz": opsz, "wdth": 100, "wght": wght, "GRAD": 0, "ROND": 18, "slnt": 0},
            updateFontNames=False,
        )
        opts = subset.Options()
        opts.layout_features = ["*"]  # keep tnum, kern, liga, etc.
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=UNICODES)
        sub.subset(inst)
        # A unique family per instance so iOS registers each file separately.
        for rec in inst["name"].names:
            if rec.nameID in (1, 4, 16):
                rec.string = name.replace("-", " ")
            elif rec.nameID == 6:
                rec.string = name
        path = os.path.join(OUT, f"{name}.ttf")
        inst.save(path)
        print(f"{name}.ttf  {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
