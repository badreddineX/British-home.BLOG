#!/usr/bin/env python3
"""Generate The Cosy Bedroom Reset Interactive PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfform
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas as pdfcanvas
import os

# Brand colours
CREAM = HexColor("#FCFAF7")
SAGE = HexColor("#8FAF8A")
SAGE_DARK = HexColor("#5E8259")
BEIGE = HexColor("#C4A882")
BEIGE_DARK = HexColor("#8B6F47")
DUSTY_BLUE = HexColor("#7B9EB0")
TERRACOTTA = HexColor("#C47A5A")
CHARCOAL = HexColor("#1C1917")
WHITE = HexColor("#FFFFFF")
LIGHT_SAGE = HexColor("#E8F0E6")
LIGHT_BLUE = HexColor("#E6EEF2")
LIGHT_TERRA = HexColor("#F5E6DE")
LIGHT_BEIGE = HexColor("#F2EBE0")

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "The_Cosy_Bedroom_Reset_Interactive.pdf")

W, H = letter
MARGIN = 0.75 * inch
CONTENT_W = W - 2 * MARGIN

# Field counter for unique names
_field_counter = [0]

def unique_name(prefix="field"):
    _field_counter[0] += 1
    return f"{prefix}_{_field_counter[0]}"


class InteractivePDFTemplate(pdfcanvas.Canvas):
    """Canvas that tracks pages for later drawing."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._page_count = 0

    def showPage(self):
        self._page_count += 1
        super().showPage()

    def save(self):
        super().save()


def draw_page_bg(canvas, doc):
    """Draw cream background and subtle header line on each page."""
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Footer
    canvas.setFillColor(BEIGE)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(W / 2, 0.4 * inch, "BritishHomeInterior.co.uk  |  The Cosy Bedroom Reset")
    canvas.restoreState()


def draw_cover_bg(canvas, doc):
    """Cover page background."""
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Top sage band
    canvas.setFillColor(SAGE)
    canvas.rect(0, H - 2.5 * inch, W, 2.5 * inch, fill=1, stroke=0)
    # Bottom beige band
    canvas.setFillColor(BEIGE)
    canvas.rect(0, 0, W, 1.2 * inch, fill=1, stroke=0)
    canvas.restoreState()


# ── Styles ──
def make_styles():
    s = {}
    s["title"] = ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=28,
                                 textColor=WHITE, alignment=TA_CENTER, leading=34)
    s["subtitle"] = ParagraphStyle("Subtitle", fontName="Helvetica", fontSize=14,
                                    textColor=CREAM, alignment=TA_CENTER, leading=18)
    s["h1"] = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=22,
                              textColor=SAGE_DARK, spaceAfter=10, leading=26)
    s["h2"] = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=16,
                              textColor=CHARCOAL, spaceAfter=6, spaceBefore=12, leading=20)
    s["h3"] = ParagraphStyle("H3", fontName="Helvetica-Bold", fontSize=13,
                              textColor=BEIGE_DARK, spaceAfter=4, spaceBefore=8, leading=16)
    s["body"] = ParagraphStyle("Body", fontName="Helvetica", fontSize=10,
                                textColor=CHARCOAL, spaceAfter=4, leading=14)
    s["body_bold"] = ParagraphStyle("BodyBold", fontName="Helvetica-Bold", fontSize=10,
                                     textColor=CHARCOAL, spaceAfter=4, leading=14)
    s["small"] = ParagraphStyle("Small", fontName="Helvetica", fontSize=9,
                                 textColor=BEIGE_DARK, leading=12)
    s["center"] = ParagraphStyle("Center", fontName="Helvetica", fontSize=10,
                                  textColor=CHARCOAL, alignment=TA_CENTER, leading=14)
    s["center_bold"] = ParagraphStyle("CenterBold", fontName="Helvetica-Bold", fontSize=12,
                                       textColor=CHARCOAL, alignment=TA_CENTER, leading=16)
    return s

STYLES = make_styles()


# ── Helper flowables ──
def coloured_box(text, bg_colour, text_colour=CHARCOAL, bold_title=None, icon_text=None):
    """Create a coloured callout box as a Table."""
    parts = []
    if icon_text:
        parts.append(Paragraph(f'<b>{icon_text}</b>', ParagraphStyle("icon", fontName="Helvetica-Bold",
                     fontSize=11, textColor=text_colour, leading=14)))
    if bold_title:
        parts.append(Paragraph(f'<b>{bold_title}</b>', ParagraphStyle("bt", fontName="Helvetica-Bold",
                     fontSize=11, textColor=text_colour, leading=14, spaceAfter=4)))
    parts.append(Paragraph(text, ParagraphStyle("box", fontName="Helvetica", fontSize=10,
                 textColor=text_colour, leading=13)))
    t = Table([[parts]], colWidths=[CONTENT_W - 20])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg_colour),
        ("BOX", (0, 0), (-1, -1), 1, bg_colour),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def designer_tip(text):
    return coloured_box(text, LIGHT_BLUE, CHARCOAL, bold_title="Designer Tip")


def do_this_now(text):
    return coloured_box(text, LIGHT_TERRA, CHARCOAL, bold_title="Do This Now")


def section_line():
    return HRFlowable(width="100%", thickness=1, color=BEIGE, spaceAfter=8, spaceBefore=8)


def checkbox_line(text, canvas_obj=None):
    """Paragraph with a checkbox-style bullet."""
    return Paragraph(f'<font face="ZapfDingbats" size="10">o</font>  {text}', STYLES["body"])


def fill_in_line(label, width_inches=3):
    """A fill-in-the-blank prompt."""
    blank = "_" * int(width_inches * 8)
    return Paragraph(f'{label}: {blank}', STYLES["body"])


def rating_scale(label):
    """1-5 rating scale as text."""
    circles = "  ".join([f'<font face="ZapfDingbats" size="10">o</font> {i}' for i in range(1, 6)])
    return Paragraph(f'<b>{label}:</b>  {circles}', STYLES["body"])


def budget_row(item, price_range):
    return [
        Paragraph(f'<font face="ZapfDingbats" size="10">o</font>  {item}', STYLES["body"]),
        Paragraph(price_range, STYLES["body"]),
        Paragraph("______", STYLES["body"]),
    ]


# ── Chapter content ──

CHAPTERS = [
    {
        "num": 1, "title": "Bedding: The Foundation of Cosiness",
        "time": "1-2 hours", "budget": "GBP 50-80",
        "intro": "Your bedding is the single most impactful change you can make. A well-made bed transforms the entire feel of your bedroom instantly.",
        "assessment": "How does your current bedding look and feel?",
        "steps": [
            ("Strip everything off your bed and start fresh", "5 min"),
            ("Add your base layer: fitted sheet + flat sheet (GBP 15-25)", "5 min"),
            ("Add your middle layer: a good quality duvet (GBP 25-40)", "5 min"),
            ("Add your top layer: a folded throw blanket at the foot (GBP 10-15)", "5 min"),
            ("Arrange 4-6 pillows on a double bed in descending size", "10 min"),
            ("Master the hotel fold: fold the top sheet back over the duvet edge", "5 min"),
        ],
        "do_now": "Right now, pull your duvet tight and fold the top 15cm back to create a crisp hotel fold. Instant upgrade.",
        "tip": "Always buy bedding one size up from your bed - a king duvet on a double bed gives that luxurious, overstuffed look hotels use.",
        "fill_ins": [("My bed size", 2), ("Colour scheme for bedding", 3)],
        "budget_items": [("Fitted sheet + flat sheet set", "GBP 15-25"), ("Duvet (10.5 tog)", "GBP 25-40"), ("Throw blanket", "GBP 10-15"), ("Pillows (pair)", "GBP 8-12")],
        "before_after": ("Flat, mismatched bedding with one sad pillow", "Three-layer hotel-style bed with 4-6 plump pillows and a folded throw"),
    },
    {
        "num": 2, "title": "Lighting: Setting the Mood",
        "time": "30-60 minutes", "budget": "GBP 30-55",
        "intro": "Lighting is the secret weapon of interior design. The golden rule: never use your ceiling light in the bedroom. Layer warm, low lighting instead.",
        "assessment": "How does your bedroom lighting currently make you feel?",
        "steps": [
            ("Turn off your ceiling light right now - you will never use it again", "1 min"),
            ("Place a bedside lamp with a warm 2700K bulb (GBP 10-20)", "10 min"),
            ("Add a floor lamp in a dark corner (GBP 15-25)", "10 min"),
            ("String fairy lights along a shelf or headboard (GBP 5-10)", "15 min"),
            ("Test your new lighting at different times of day", "10 min"),
        ],
        "do_now": "Switch off your ceiling light right now. Use only your phone torch or a candle for 10 minutes and notice how the room feels completely different.",
        "tip": "The colour temperature matters more than the fixture. Always choose 2700K (warm white) bulbs - never daylight bulbs in the bedroom. Check the box before buying.",
        "fill_ins": [("Current number of light sources", 2), ("Bulb colour temperature to buy", 2)],
        "budget_items": [("Bedside lamp", "GBP 10-20"), ("Floor lamp", "GBP 15-25"), ("Fairy lights (3m)", "GBP 5-10"), ("2700K bulbs (pack)", "GBP 3-5")],
        "before_after": ("Harsh overhead ceiling light as only source", "Three layered warm light sources creating a soft, inviting glow"),
    },
    {
        "num": 3, "title": "Curtains: Framing Your Space",
        "time": "1-2 hours", "budget": "GBP 20-30",
        "intro": "Hanging curtains properly is the most underrated trick in interior design. The secret: hang them close to the ceiling, not the window frame.",
        "assessment": "How do your current curtains or window coverings look?",
        "steps": [
            ("Measure from ceiling height (not window frame) to floor", "5 min"),
            ("Choose blackout curtains in a neutral tone (GBP 20-30)", "shop"),
            ("Install curtain rod as close to ceiling as possible", "30 min"),
            ("For renters: use a no-drill tension rod inside the frame", "15 min"),
            ("Let curtains puddle slightly (2-3cm) on the floor for luxury", "5 min"),
            ("Ensure curtains extend 15-20cm beyond window frame on each side", "5 min"),
        ],
        "do_now": "Measure the distance from your ceiling to the floor. Write it down. This is the curtain length you need.",
        "tip": "Hanging curtains near the ceiling makes your room look dramatically taller. Even a 2-metre ceiling looks grand with properly hung curtains. This one trick changes everything.",
        "fill_ins": [("Ceiling-to-floor measurement", 2), ("Window width", 2), ("Curtain colour choice", 2)],
        "budget_items": [("Blackout curtains (pair)", "GBP 20-30"), ("Curtain rod or tension rod", "GBP 5-10"), ("Brackets/hooks", "GBP 3-5")],
        "before_after": ("Short curtains hung at window frame, letting light bleed in", "Floor-length curtains hung near ceiling, creating height and blocking light"),
    },
    {
        "num": 4, "title": "Furniture Layout: Finding the Flow",
        "time": "1-2 hours", "budget": "GBP 0",
        "intro": "Rearranging furniture costs nothing but transforms everything. The goal: create clear pathways and a sense of calm symmetry.",
        "assessment": "How functional and balanced does your current layout feel?",
        "steps": [
            ("Clear the floor completely - move everything to the centre", "15 min"),
            ("Position bed centred on the wall opposite the door (or longest wall)", "20 min"),
            ("Ensure 60cm clearance on both sides of the bed", "5 min"),
            ("Place nightstand at mattress-top height on your dominant side", "5 min"),
            ("Create visual symmetry: matching lamps, balanced items", "15 min"),
            ("Stand in the doorway and assess the view - adjust as needed", "10 min"),
        ],
        "do_now": "Stand in your doorway right now. What is the first thing you see? The bed should be the focal point, not clutter or a blank wall.",
        "tip": "Your nightstand should be exactly the same height as your mattress top. Too high or too low and everything feels off. Measure before you buy or stack books underneath to adjust.",
        "fill_ins": [("Best wall for bed placement", 3), ("Clearance measurement (left)", 2), ("Clearance measurement (right)", 2)],
        "budget_items": [],
        "before_after": ("Bed shoved in corner, no clear pathway, mismatched heights", "Centred bed with balanced sides, clear 60cm walkways, aligned heights"),
    },
    {
        "num": 5, "title": "Wall Decor: Adding Personality",
        "time": "1-2 hours", "budget": "GBP 10-25",
        "intro": "Wall decor gives your bedroom personality without clutter. The rule: one statement piece beats ten small random items every time.",
        "assessment": "How do your walls currently look?",
        "steps": [
            ("Remove everything from your walls - start with a blank canvas", "10 min"),
            ("Choose one approach: gallery wall above bed OR one large statement piece", "decide"),
            ("For gallery wall: use odd numbers of frames with 5-7cm spacing", "30 min"),
            ("Lean large art against the wall on a shelf for easy, no-damage display", "10 min"),
            ("Use command strips for renter-friendly hanging", "15 min"),
            ("Step back and check alignment from bed-level perspective", "5 min"),
        ],
        "do_now": "Take one piece of art or a framed photo and lean it against the wall on your nightstand or a shelf. See how it instantly adds warmth.",
        "tip": "The centre of your art should be at eye level when standing (approximately 150cm from the floor). Above the bed, the bottom of the frame should be 15-20cm above your headboard.",
        "fill_ins": [("Wall decor style (gallery/statement)", 3), ("Number of frames needed", 2)],
        "budget_items": [("Frames (set of 3-5)", "GBP 5-15"), ("Art prints", "GBP 3-8"), ("Command strips", "GBP 3-5")],
        "before_after": ("Bare walls or random items with no cohesion", "Curated gallery wall or striking statement piece at perfect height"),
    },
    {
        "num": 6, "title": "The Rug: Grounding the Room",
        "time": "30 minutes", "budget": "GBP 15-30",
        "intro": "A rug beside your bed means warm feet every morning and adds a layer of texture that makes the room feel finished and intentional.",
        "assessment": "What do your feet land on when you get out of bed?",
        "steps": [
            ("Measure the space beside your bed (minimum 60x90cm)", "5 min"),
            ("Choose a rug that complements your bedding colours (GBP 15-30)", "shop"),
            ("Place the rug so 2/3 sits under the bed", "5 min"),
            ("Consider layering a smaller textured rug on top for depth", "5 min"),
            ("Ensure the rug extends beyond where your feet land", "5 min"),
        ],
        "do_now": "Place a towel or spare blanket beside your bed right now. Step on it tomorrow morning and notice the difference warm feet make to your mood.",
        "tip": "A rug that is too small looks worse than no rug at all. Always go bigger than you think you need. The rug should extend at least 60cm out from the bed on the sides you use.",
        "fill_ins": [("Space available beside bed", 3), ("Rug colour/texture preference", 3)],
        "budget_items": [("Bedside rug (60x90cm+)", "GBP 15-30")],
        "before_after": ("Cold bare floor greeting you every morning", "Soft, textured rug warming your feet and grounding the room"),
    },
    {
        "num": 7, "title": "Storage: Clearing the Clutter",
        "time": "2-3 hours", "budget": "GBP 10-20",
        "intro": "A cluttered bedroom is a stressed mind. The goal: everything has a home, and surfaces are almost empty. Your nightstand should have a maximum of 3 items.",
        "assessment": "How cluttered does your bedroom currently feel?",
        "steps": [
            ("Empty every surface in your bedroom completely", "15 min"),
            ("Sort items: keep in bedroom / move elsewhere / bin", "30 min"),
            ("Add under-bed storage boxes for seasonal items (GBP 5-10)", "10 min"),
            ("Install one floating shelf for display items (GBP 5-10)", "20 min"),
            ("Use an over-door organiser for accessories", "10 min"),
            ("Return only 3 items maximum to your nightstand", "5 min"),
        ],
        "do_now": "Clear your nightstand completely right now. Put back only three things: a lamp, one book, and one personal item. Notice how calm it feels.",
        "tip": "The three-item nightstand rule is non-negotiable. A lamp, something you are reading, and one personal item (a candle, photo, or small plant). Everything else finds a different home.",
        "fill_ins": [("Items to remove from bedroom", 3), ("My 3 nightstand items", 3)],
        "budget_items": [("Under-bed storage boxes (set)", "GBP 5-10"), ("Floating shelf", "GBP 5-10"), ("Over-door organiser", "GBP 3-5")],
        "before_after": ("Surfaces covered in clutter, no clear storage system", "Clean surfaces, hidden storage, calm and organised space"),
    },
    {
        "num": 8, "title": "Colour Palette: Creating Harmony",
        "time": "30 minutes planning", "budget": "GBP 0-10",
        "intro": "A cohesive colour palette is what separates a designed room from a random collection of things. Three colours maximum. Use the 60-30-10 rule.",
        "assessment": "How cohesive is your current colour scheme?",
        "steps": [
            ("Look at what you already own - identify the dominant colour", "10 min"),
            ("Choose your 3 colours: 60% dominant, 30% secondary, 10% accent", "10 min"),
            ("Your dominant colour (60%) should be your walls and large textiles", "note"),
            ("Your secondary colour (30%) is bedding, curtains, rug", "note"),
            ("Your accent colour (10%) is cushions, art, small decor", "note"),
            ("Get fabric samples or paint swatches before committing to purchases", "5 min"),
        ],
        "do_now": "Walk around your bedroom and photograph it. Look at the photo - what colours dominate? Write down the three most prominent colours you see.",
        "tip": "When in doubt, choose warm neutrals (cream, oatmeal, soft grey) as your 60% and 30%, then add one bold accent at 10%. You cannot go wrong with this formula.",
        "fill_ins": [("My primary colour (60%)", 3), ("My secondary colour (30%)", 3), ("My accent colour (10%)", 3)],
        "budget_items": [("Paint samples", "GBP 0-5"), ("Fabric swatches", "GBP 0-5")],
        "before_after": ("Mismatched colours with no clear palette or intention", "Harmonious three-colour scheme following the 60-30-10 rule"),
    },
    {
        "num": 9, "title": "Plants: Bringing Life Indoors",
        "time": "30 minutes", "budget": "GBP 10-20",
        "intro": "Plants add life, colour, and a sense of calm. The key: one large plant makes more impact than five tiny ones. And faux plants are absolutely fine - no shame.",
        "assessment": "How much natural or green life is in your bedroom?",
        "steps": [
            ("Identify the light levels in your bedroom (most bedrooms are low light)", "5 min"),
            ("Choose one statement plant: snake plant, pothos, or ZZ plant (GBP 8-15)", "shop"),
            ("Place it in the emptiest corner or on a high shelf", "5 min"),
            ("Add one trailing plant (pothos) on a high shelf if space allows", "5 min"),
            ("If maintenance is not for you, choose high-quality faux plants", "shop"),
        ],
        "do_now": "Identify the darkest corner of your bedroom. That is where your new plant will go - snake plants and ZZ plants thrive in low light.",
        "tip": "The snake plant (Sansevieria) is virtually indestructible, purifies air, and releases oxygen at night - making it the perfect bedroom plant. Water it once a fortnight and forget about it.",
        "fill_ins": [("Light level in bedroom", 2), ("Plant type chosen", 3), ("Placement location", 3)],
        "budget_items": [("Statement plant", "GBP 8-15"), ("Plant pot/cover", "GBP 3-5"), ("Trailing plant (optional)", "GBP 3-5")],
        "before_after": ("No greenery, room feels flat and lifeless", "One lush statement plant bringing life and freshness to the space"),
    },
    {
        "num": 10, "title": "Scent: The Invisible Layer",
        "time": "15 minutes", "budget": "GBP 15-25",
        "intro": "Scent is the invisible layer that makes your bedroom feel like a retreat. Layer scents the way you layer lighting - a base note and an accent.",
        "assessment": "What does your bedroom currently smell like?",
        "steps": [
            ("Choose a base scent: soy candle in vanilla, sandalwood, or cotton (GBP 5-10)", "shop"),
            ("Choose an accent scent: linen spray in lavender or eucalyptus (GBP 3-5)", "shop"),
            ("Consider an essential oil diffuser for continuous subtle scent (GBP 10-15)", "shop"),
            ("Place candle on nightstand - spray linen on pillows before bed", "5 min"),
            ("Layer scents: base candle + accent spray for a signature bedroom scent", "5 min"),
        ],
        "do_now": "Open your bedroom window for 10 minutes right now. Fresh air is the foundation of every good scent strategy. You cannot layer scent on top of stale air.",
        "tip": "Lavender is scientifically proven to aid sleep. Spray your pillows with lavender linen spray 15 minutes before bed. Your sleep quality will noticeably improve within a week.",
        "fill_ins": [("Base scent choice", 3), ("Accent scent choice", 3)],
        "budget_items": [("Soy candle", "GBP 5-10"), ("Linen spray", "GBP 3-5"), ("Essential oil diffuser", "GBP 10-15")],
        "before_after": ("No intentional scent, or stale air", "Layered signature scent creating a calming sleep sanctuary"),
    },
    {
        "num": 11, "title": "The GBP 170 Shopping List",
        "time": "Planning session", "budget": "GBP 170 total",
        "intro": "Here is your complete shopping list for the entire bedroom transformation. Every item, every price range, every recommended shop. Tick items off as you buy them.",
        "assessment": "How prepared are you to start shopping?",
        "steps": [
            ("Review the full list below and prioritise by impact", "15 min"),
            ("Check what you already own - cross those off", "10 min"),
            ("Shop Primark Home and IKEA first for best value", "trip"),
            ("Check Dunelm for curtains and bedding", "trip"),
            ("Amazon for fairy lights, command strips, and storage", "online"),
            ("Track actual spend in the right column", "ongoing"),
        ],
        "do_now": "Open your phone and check the Primark Home, IKEA, and Dunelm websites right now. Bookmark the homewares sections.",
        "tip": "Buy bedding and curtains in person if possible - colours on screens are unreliable. Take a fabric swatch from home to match against. IKEA's DVALA range is unbeatable value for crisp white sheets.",
        "fill_ins": [("Total budget available", 2), ("Priority items to buy first", 3)],
        "budget_items": [
            ("Bedding set (sheet + duvet cover)", "GBP 25-40"),
            ("Throw blanket", "GBP 10-15"),
            ("Pillows (2 pairs)", "GBP 15-20"),
            ("Bedside lamp", "GBP 10-20"),
            ("Floor lamp", "GBP 15-25"),
            ("Fairy lights", "GBP 5-10"),
            ("Blackout curtains", "GBP 20-30"),
            ("Curtain rod/tension rod", "GBP 5-10"),
            ("Rug", "GBP 15-30"),
            ("Frames for wall art", "GBP 5-15"),
            ("Under-bed storage", "GBP 5-10"),
            ("Plant + pot", "GBP 10-15"),
            ("Candle", "GBP 5-10"),
            ("Linen spray", "GBP 3-5"),
        ],
        "before_after": ("Overwhelmed, not knowing where to start or what to buy", "Clear, prioritised shopping list with every item budgeted"),
    },
    {
        "num": 12, "title": "The Weekend Timeline",
        "time": "One full weekend", "budget": "GBP 170 total",
        "intro": "Everything in this book can be done in one weekend. Here is your hour-by-hour plan for a complete bedroom transformation from Saturday morning to Sunday afternoon.",
        "assessment": "How ready are you for your transformation weekend?",
        "steps": [
            ("SATURDAY MORNING: Bedding + curtains (strip bed, install curtains, make bed)", "3 hours"),
            ("SATURDAY AFTERNOON: Layout + lighting (rearrange furniture, set up lamps)", "3 hours"),
            ("SUNDAY MORNING: Walls + rug (hang art, place rug, add plant)", "2 hours"),
            ("SUNDAY AFTERNOON: Styling + scent (declutter, style surfaces, add candle)", "2 hours"),
            ("Take your after photos from the same angles as your before photos", "10 min"),
            ("Light your candle, close the curtains, turn on your lamps, and enjoy", "evening"),
        ],
        "do_now": "Pick your transformation weekend right now. Put it in your calendar. Buy your shopping list items before that weekend arrives.",
        "tip": "Take before photos from four angles: doorway view, bed view, window view, and a detail shot of your nightstand. You will not believe the transformation when you compare.",
        "fill_ins": [("My transformation weekend date", 3), ("Shopping trip planned for", 3)],
        "budget_items": [],
        "before_after": ("Vague intention to 'do something' with no plan", "Concrete weekend plan with every hour accounted for"),
    },
]


def build_pdf():
    story = []

    # ── COVER PAGE ──
    story.append(Spacer(1, 2.0 * inch))
    story.append(Paragraph("The Cosy Bedroom Reset", STYLES["title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Transform Your Bedroom in One Weekend on a GBP 170 Budget",
                            STYLES["subtitle"]))
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("An Interactive Workbook", ParagraphStyle("cov1",
                 fontName="Helvetica", fontSize=14, textColor=SAGE_DARK, alignment=TA_CENTER)))
    story.append(Spacer(1, 10))
    story.append(Paragraph("BritishHomeInterior.co.uk", ParagraphStyle("cov2",
                 fontName="Helvetica-Bold", fontSize=12, textColor=SAGE_DARK, alignment=TA_CENTER)))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("GBP 7", ParagraphStyle("price",
                 fontName="Helvetica-Bold", fontSize=16, textColor=BEIGE_DARK, alignment=TA_CENTER)))
    story.append(PageBreak())

    # ── TABLE OF CONTENTS ──
    story.append(Paragraph("Contents", STYLES["h1"]))
    story.append(Spacer(1, 10))
    toc_items = [
        "What's Your Bedroom Vibe? (Style Quiz)",
    ] + [f"Chapter {c['num']}: {c['title']}" for c in CHAPTERS] + [
        "Budget Tracker",
        "Weekend Planner",
        "Your Cosy Bedroom Is Complete!",
    ]
    for item in toc_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {item}", STYLES["body"]))
    story.append(PageBreak())

    # ── STYLE QUIZ ──
    story.append(Paragraph("What's Your Bedroom Vibe?", STYLES["h1"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Answer these 5 questions to discover your bedroom style. "
                            "Tick the option that resonates most with you.", STYLES["body"]))
    story.append(Spacer(1, 10))

    quiz_questions = [
        ("1. When you walk into your ideal bedroom, you feel...",
         ["A) Calm and clear - minimal items, maximum peace",
          "B) Wrapped up and warm - layers, textures, soft everything",
          "C) Polished and pampered - crisp lines, luxury touches"]),
        ("2. Your ideal colour palette is...",
         ["A) White, grey, and one accent colour",
          "B) Warm neutrals, earthy tones, deep greens",
          "C) Crisp whites, navy, and metallics"]),
        ("3. On the bed, you want...",
         ["A) Two pillows, one throw, nothing more",
          "B) All the pillows, all the blankets, maximum cosiness",
          "C) Hotel-style tucked sheets with decorative cushions"]),
        ("4. The lighting you prefer is...",
         ["A) One clean lamp, maybe a candle",
          "B) Fairy lights, multiple candles, warm glow everywhere",
          "C) Matching bedside lamps, a dimmer switch"]),
        ("5. Your approach to bedroom accessories is...",
         ["A) Less is more - every item earns its place",
          "B) More is more - books, plants, photos, memories",
          "C) Curated and coordinated - everything matches"]),
    ]

    for q_text, options in quiz_questions:
        story.append(Paragraph(f"<b>{q_text}</b>", STYLES["body_bold"]))
        for opt in options:
            story.append(checkbox_line(opt))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 10))
    results_data = [
        ("Mostly A's: The Minimalist Sanctuary",
         "You crave calm and order. Focus on decluttering, clean lines, and quality over quantity. Chapters 4, 7, and 8 are your priorities."),
        ("Mostly B's: The Cosy Cocoon",
         "You want warmth and texture in every layer. Focus on bedding, lighting, and soft furnishings. Chapters 1, 2, and 6 are your starting points."),
        ("Mostly C's: The Hotel Luxe",
         "You love that boutique hotel feeling. Focus on crisp bedding, matching accessories, and polished details. Chapters 1, 3, and 5 will guide you."),
    ]
    for title, desc in results_data:
        story.append(coloured_box(desc, LIGHT_SAGE, CHARCOAL, bold_title=title))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # ── CHAPTERS ──
    for ch in CHAPTERS:
        # Chapter title
        story.append(Paragraph(f"Chapter {ch['num']}", STYLES["small"]))
        story.append(Paragraph(ch["title"], STYLES["h1"]))
        story.append(Spacer(1, 4))

        # Time and budget badges
        meta = f"Time: {ch['time']}  |  Budget: {ch['budget']}"
        story.append(coloured_box(meta, LIGHT_SAGE, SAGE_DARK))
        story.append(Spacer(1, 8))

        # Intro
        story.append(Paragraph(ch["intro"], STYLES["body"]))
        story.append(Spacer(1, 8))

        # Self-assessment
        story.append(Paragraph("Self-Assessment", STYLES["h2"]))
        story.append(rating_scale(ch["assessment"]))
        story.append(Spacer(1, 8))

        # Before / After
        if ch.get("before_after"):
            story.append(Paragraph("Before vs. After", STYLES["h2"]))
            ba = ch["before_after"]
            ba_data = [
                [Paragraph("<b>BEFORE</b>", STYLES["center_bold"]),
                 Paragraph("<b>AFTER</b>", STYLES["center_bold"])],
                [Paragraph(ba[0], STYLES["center"]),
                 Paragraph(ba[1], STYLES["center"])],
            ]
            ba_table = Table(ba_data, colWidths=[CONTENT_W / 2 - 5, CONTENT_W / 2 - 5])
            ba_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), HexColor("#F5E6DE")),
                ("BACKGROUND", (1, 0), (1, -1), LIGHT_SAGE),
                ("BOX", (0, 0), (-1, -1), 0.5, BEIGE),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BEIGE),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(ba_table)
            story.append(Spacer(1, 8))

        # Steps
        story.append(Paragraph("Step-by-Step Actions", STYLES["h2"]))
        for step_text, time_est in ch["steps"]:
            story.append(checkbox_line(f"{step_text}  <i>({time_est})</i>"))
        story.append(Spacer(1, 8))

        # Do This Now
        story.append(do_this_now(ch["do_now"]))
        story.append(Spacer(1, 8))

        # Fill-ins
        if ch.get("fill_ins"):
            story.append(Paragraph("Your Notes", STYLES["h3"]))
            for label, width in ch["fill_ins"]:
                story.append(fill_in_line(label, width))
            story.append(Spacer(1, 8))

        # Designer Tip
        story.append(designer_tip(ch["tip"]))
        story.append(Spacer(1, 8))

        # Budget tracker for this chapter
        if ch.get("budget_items"):
            story.append(Paragraph("Chapter Budget Tracker", STYLES["h3"]))
            header = [
                Paragraph("<b>Item</b>", STYLES["body_bold"]),
                Paragraph("<b>Estimate</b>", STYLES["body_bold"]),
                Paragraph("<b>Actual</b>", STYLES["body_bold"]),
            ]
            rows = [header] + [budget_row(item, price) for item, price in ch["budget_items"]]
            bt = Table(rows, colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.25, CONTENT_W * 0.25])
            bt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BEIGE),
                ("GRID", (0, 0), (-1, -1), 0.5, BEIGE),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(bt)
            story.append(Spacer(1, 8))

        # End-of-chapter checklist
        story.append(section_line())
        story.append(Paragraph("Chapter Checklist", STYLES["h3"]))
        story.append(checkbox_line(f"I have completed all steps in Chapter {ch['num']}"))
        story.append(checkbox_line("I have tracked my spending"))
        story.append(checkbox_line("I have taken progress photos"))
        story.append(checkbox_line("I am happy with the result"))
        story.append(Spacer(1, 6))
        story.append(rating_scale("Rate your result"))

        story.append(PageBreak())

    # ── MASTER BUDGET TRACKER ──
    story.append(Paragraph("Master Budget Tracker", STYLES["h1"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("The Complete GBP 170 Shopping List", STYLES["h2"]))
    story.append(Paragraph("Tick items as you purchase them and record the actual price to stay on budget.", STYLES["body"]))
    story.append(Spacer(1, 10))

    all_items = [
        ("BEDDING", [
            ("Fitted sheet + flat sheet set", "GBP 15-25", "Primark Home / IKEA"),
            ("Duvet (10.5 tog)", "GBP 25-40", "Dunelm / IKEA"),
            ("Throw blanket", "GBP 10-15", "Primark Home / H&M Home"),
            ("Pillows (2 pairs)", "GBP 15-20", "IKEA / Dunelm"),
        ]),
        ("LIGHTING", [
            ("Bedside lamp + 2700K bulb", "GBP 10-20", "IKEA / Amazon"),
            ("Floor lamp", "GBP 15-25", "IKEA"),
            ("Fairy lights (3m)", "GBP 5-10", "Amazon / Primark"),
        ]),
        ("CURTAINS", [
            ("Blackout curtains (pair)", "GBP 20-30", "Dunelm / IKEA"),
            ("Curtain rod or tension rod", "GBP 5-10", "Amazon / B&Q"),
        ]),
        ("DECOR", [
            ("Picture frames (set)", "GBP 5-15", "IKEA / Primark Home"),
            ("Art prints", "GBP 3-8", "Etsy / free printables"),
            ("Command strips", "GBP 3-5", "Amazon"),
        ]),
        ("TEXTILES", [
            ("Bedside rug", "GBP 15-30", "IKEA / Dunelm"),
        ]),
        ("STORAGE", [
            ("Under-bed storage boxes", "GBP 5-10", "IKEA / Amazon"),
            ("Floating shelf", "GBP 5-10", "IKEA"),
        ]),
        ("PLANTS & SCENT", [
            ("Statement plant + pot", "GBP 10-15", "B&Q / local garden centre"),
            ("Soy candle", "GBP 5-10", "Primark Home / TK Maxx"),
            ("Linen spray", "GBP 3-5", "Amazon / Primark"),
        ]),
    ]

    for category, items in all_items:
        story.append(Paragraph(f"<b>{category}</b>", ParagraphStyle("cat",
                     fontName="Helvetica-Bold", fontSize=11, textColor=SAGE_DARK, spaceBefore=8, spaceAfter=4)))
        header = [
            Paragraph("<b>Item</b>", STYLES["body_bold"]),
            Paragraph("<b>Budget</b>", STYLES["body_bold"]),
            Paragraph("<b>Where</b>", STYLES["body_bold"]),
            Paragraph("<b>Actual</b>", STYLES["body_bold"]),
        ]
        rows = [header]
        for item, price, where in items:
            rows.append([
                Paragraph(f'<font face="ZapfDingbats" size="10">o</font> {item}', STYLES["body"]),
                Paragraph(price, STYLES["body"]),
                Paragraph(where, STYLES["small"]),
                Paragraph("________", STYLES["body"]),
            ])
        t = Table(rows, colWidths=[CONTENT_W * 0.35, CONTENT_W * 0.18, CONTENT_W * 0.27, CONTENT_W * 0.20])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BEIGE),
            ("GRID", (0, 0), (-1, -1), 0.5, BEIGE),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(t)

    story.append(Spacer(1, 15))
    story.append(section_line())
    story.append(Paragraph("<b>TOTAL BUDGET: GBP 170</b>", STYLES["center_bold"]))
    story.append(fill_in_line("Total actually spent", 3))
    story.append(fill_in_line("Amount saved", 3))

    story.append(PageBreak())

    # ── WEEKEND PLANNER ──
    story.append(Paragraph("Weekend Planner", STYLES["h1"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Your Complete Transformation Timeline", STYLES["h2"]))
    story.append(Spacer(1, 10))

    weekend_plan = [
        ("SATURDAY MORNING (9am - 12pm)", LIGHT_SAGE, [
            "Take before photos from 4 angles (doorway, bed, window, nightstand)",
            "Strip bed completely and wash all bedding",
            "Install curtain rod close to ceiling",
            "Hang blackout curtains",
            "Make bed with three-layer system (base, duvet, throw)",
            "Arrange pillows (4-6 on double bed)",
            "Master the hotel fold",
        ]),
        ("SATURDAY AFTERNOON (1pm - 4pm)", LIGHT_BLUE, [
            "Clear all furniture to centre of room",
            "Position bed centred on best wall",
            "Check 60cm clearance on both sides",
            "Place nightstand at mattress height",
            "Set up bedside lamp with 2700K bulb",
            "Position floor lamp in darkest corner",
            "String fairy lights along shelf or headboard",
            "Turn off ceiling light - permanently",
        ]),
        ("SUNDAY MORNING (9am - 11am)", LIGHT_TERRA, [
            "Plan gallery wall or statement piece placement",
            "Hang art using command strips (centre at 150cm height)",
            "Place rug beside bed (2/3 under bed)",
            "Position statement plant in empty corner",
            "Add trailing plant on high shelf if using",
        ]),
        ("SUNDAY AFTERNOON (12pm - 2pm)", LIGHT_BEIGE, [
            "Clear every surface completely",
            "Return maximum 3 items to nightstand",
            "Set up under-bed storage",
            "Place candle on nightstand",
            "Spray linen spray on pillows",
            "Do final walk-through from doorway",
            "Take after photos from same 4 angles",
            "Light candle, close curtains, turn on lamps - enjoy!",
        ]),
    ]

    for session_title, bg, tasks in weekend_plan:
        story.append(coloured_box("", bg, CHARCOAL, bold_title=session_title))
        for task in tasks:
            story.append(checkbox_line(task))
        story.append(Spacer(1, 6))
        story.append(fill_in_line("Notes"))
        story.append(Spacer(1, 10))

    story.append(PageBreak())

    # ── COMPLETION PAGE ──
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph("Your Cosy Bedroom Is Complete!", STYLES["h1"]))
    story.append(Spacer(1, 15))

    story.append(coloured_box(
        "Congratulations! You have transformed your bedroom into a cosy, intentional sanctuary. "
        "Every layer, every light, every detail was chosen with purpose. "
        "This is not just a room - it is your retreat from the world.",
        LIGHT_SAGE, SAGE_DARK))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Final Assessment", STYLES["h2"]))
    story.append(rating_scale("Rate your bedroom BEFORE the reset"))
    story.append(Spacer(1, 6))
    story.append(rating_scale("Rate your bedroom AFTER the reset"))
    story.append(Spacer(1, 10))

    story.append(fill_in_line("Total amount spent", 3))
    story.append(fill_in_line("Amount under/over budget", 3))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Reflection", STYLES["h2"]))
    story.append(fill_in_line("The single biggest change was", 4))
    story.append(fill_in_line("The easiest win was", 4))
    story.append(fill_in_line("I wish I had known", 4))
    story.append(fill_in_line("My favourite detail is", 4))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Photo Prompt", STYLES["h3"]))
    story.append(Paragraph(
        "Take a final photo of your completed bedroom from the doorway. "
        "Share it with us on Instagram @BritishHomeInterior or email it to "
        "hello@britishhomeinterior.co.uk - we would love to see your transformation!",
        STYLES["body"]))
    story.append(Spacer(1, 15))

    story.append(section_line())
    story.append(Spacer(1, 10))
    story.append(Paragraph("Thank you for choosing The Cosy Bedroom Reset", STYLES["center_bold"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("BritishHomeInterior.co.uk", ParagraphStyle("final",
                 fontName="Helvetica", fontSize=11, textColor=SAGE_DARK, alignment=TA_CENTER)))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Visit us for more home transformation guides, tips, and inspiration.",
                            STYLES["center"]))

    # ── BUILD ──
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title="The Cosy Bedroom Reset - Interactive Workbook",
        author="BritishHomeInterior.co.uk",
    )

    # Use cover background for first page, then regular
    def on_first_page(canvas, doc):
        draw_cover_bg(canvas, doc)

    def on_later_pages(canvas, doc):
        draw_page_bg(canvas, doc)

    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)
    print(f"PDF generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    build_pdf()
