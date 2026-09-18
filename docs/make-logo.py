"""Draw the visual-git mark: a branch leaving a lane and merging back.

Strokes are drawn by stamping a disc along the path rather than with
draw.line(joint="curve"), which leaves sawtooth artefacts on thick curves.
Everything is drawn at 4x and downsampled, which is what gives the edges their
antialiasing.
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

SCALE = 4
SIZE = 512 * SCALE
BG = (22, 26, 33, 255)        # --surface
LANE = (79, 157, 253, 255)    # --accent
BRANCH = (242, 153, 74, 255)  # the second graph lane

LANE_X, BRANCH_X = 190 * SCALE, 330 * SCALE
TOP_Y, MID_Y, BOTTOM_Y = 116 * SCALE, 256 * SCALE, 396 * SCALE
STROKE = 23 * SCALE
NODE = 31 * SCALE


def bezier(p0, p1, p2, p3, steps=400):
    for step in range(steps + 1):
        t = step / steps
        u = 1 - t
        yield (
            u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1],
        )


def dot(draw, center, radius, fill):
    x, y = center
    draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=fill)


def stroke(draw, points, width, fill):
    radius = width / 2
    for point in points:
        dot(draw, point, radius, fill)


def render(with_plate=True):
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if with_plate:
        draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=112 * SCALE, fill=BG)

    # Control points sit most of the way down each span, so the curve leaves and
    # arrives vertically instead of kinking.
    bow = (MID_Y - TOP_Y) * 0.78
    stroke(
        draw,
        bezier((LANE_X, TOP_Y), (LANE_X, TOP_Y + bow), (BRANCH_X, MID_Y - bow), (BRANCH_X, MID_Y)),
        STROKE,
        BRANCH,
    )
    stroke(
        draw,
        bezier(
            (BRANCH_X, MID_Y), (BRANCH_X, MID_Y + bow), (LANE_X, BOTTOM_Y - bow), (LANE_X, BOTTOM_Y)
        ),
        STROKE,
        BRANCH,
    )

    # The main lane goes on top, so the junctions read as the branch meeting it.
    stroke(draw, [(LANE_X, y) for y in range(TOP_Y, BOTTOM_Y + 1, 4)], STROKE, LANE)

    dot(draw, (BRANCH_X, MID_Y), NODE, BRANCH)
    for y in (TOP_Y, MID_Y, BOTTOM_Y):
        dot(draw, (LANE_X, y), NODE, LANE)

    return image.resize((512, 512), Image.LANCZOS)


render(with_plate=True).save(str(ROOT / "docs" / "logo.png"))

Image.open(str(ROOT / "docs" / "logo.png")).save(
    str(ROOT / "visual-git.ico"),
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print("logo.png and visual-git.ico written")
