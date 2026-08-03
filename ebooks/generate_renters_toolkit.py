#!/usr/bin/env python3
"""
Generate "The No-Damage Renter's Styling Toolkit" Interactive PDF
Brand: BritishHomeInterior.co.uk
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfform
from reportlab.lib import colors

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

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "The_NoDamage_Renters_Styling_Toolkit_Interactive.pdf")

W, H = letter  # 612 x 792
MARGIN = 54  # 0.75 inch


def draw_bg(c, color=CREAM):
    c.setFillColor(color)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_header_bar(c, y, color=SAGE_DARK, height=36):
    c.setFillColor(color)
    c.rect(MARGIN - 10, y, W - 2 * MARGIN + 20, height, fill=1, stroke=0)


def text_block(c, text, x, y, font="Helvetica", size=11, color=CHARCOAL, max_width=None, leading=None):
    c.setFillColor(color)
    c.setFont(font, size)
    if max_width:
        from reportlab.lib.utils import simpleSplit
        lines = simpleSplit(text, font, size, max_width)
        lead = leading or size + 4
        for line in lines:
            c.drawString(x, y, line)
            y -= lead
        return y
    else:
        c.drawString(x, y, text)
        return y - size - 4


def centred_text(c, text, y, font="Helvetica-Bold", size=14, color=CHARCOAL):
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawCentredString(W / 2, y, text)
    return y - size - 6


def draw_checkbox(c, x, y, key, size=12):
    c.acroForm.checkbox(
        name=key,
        x=x, y=y,
        size=size,
        buttonStyle="cross",
        borderColor=SAGE_DARK,
        fillColor=WHITE,
        textColor=CHARCOAL,
        forceBorder=True,
    )


def draw_textfield(c, x, y, w, h, key, multiline=False):
    c.acroForm.textfield(
        name=key,
        x=x, y=y,
        width=w, height=h,
        borderColor=BEIGE_DARK,
        fillColor=WHITE,
        textColor=CHARCOAL,
        fontSize=10,
        fieldFlags="multiline" if multiline else "",
        forceBorder=True,
    )


def action_block(c, text, x, y, width=None):
    """Terracotta 'Do This Now' block."""
    w = width or (W - 2 * MARGIN)
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(text, "Helvetica", 10, w - 24)
    h = max(40, len(lines) * 14 + 24)
    c.setFillColor(TERRACOTTA)
    c.roundRect(x, y - h + 12, w, h, 6, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 12, y, "DO THIS NOW")
    c.setFont("Helvetica", 10)
    ty = y - 16
    for line in lines:
        c.drawString(x + 12, ty, line)
        ty -= 14
    return y - h - 4


def tip_box(c, text, x, y, width=None, color=DUSTY_BLUE):
    """Tip callout box."""
    w = width or (W - 2 * MARGIN)
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(text, "Helvetica", 10, w - 24)
    h = max(36, len(lines) * 14 + 24)
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.roundRect(x, y - h + 12, w, h, 6, fill=0, stroke=1)
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 12, y, "TIP")
    c.setFont("Helvetica", 10)
    ty = y - 16
    for line in lines:
        c.drawString(x + 12, ty, line)
        ty -= 14
    return y - h - 4


def weight_box(c, items, x, y, width=None):
    """Weight limit reference box."""
    w = width or (W - 2 * MARGIN)
    h = len(items) * 16 + 30
    c.setFillColor(HexColor("#F5F0E8"))
    c.roundRect(x, y - h + 12, w, h, 6, fill=1, stroke=0)
    c.setFillColor(BEIGE_DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 12, y, "WEIGHT LIMITS")
    c.setFont("Helvetica", 10)
    ty = y - 18
    for item in items:
        c.setFillColor(CHARCOAL)
        c.drawString(x + 12, ty, item)
        ty -= 16
    return y - h - 4


def product_box(c, name, price, x, y, width=None):
    w = width or (W - 2 * MARGIN)
    c.setFillColor(HexColor("#F0F5EE"))
    c.roundRect(x, y - 18, w, 28, 4, fill=1, stroke=0)
    c.setFillColor(SAGE_DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 12, y - 6, name)
    c.setFillColor(BEIGE_DARK)
    c.setFont("Helvetica", 10)
    c.drawString(x + w - 80, y - 6, price)
    return y - 30


def chapter_title_page(c, num, title, difficulty, page_num):
    draw_bg(c)
    # Colour bar at top
    c.setFillColor(SAGE_DARK)
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(W / 2, H - 44, f"Chapter {num}")

    y = H - 100
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(W / 2, y, title)

    y -= 30
    diff_color = {"Easy": SAGE, "Medium": BEIGE_DARK, "Advanced": TERRACOTTA}
    dc = diff_color.get(difficulty, SAGE)
    c.setFillColor(dc)
    c.roundRect(W / 2 - 50, y - 6, 100, 22, 4, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W / 2, y, difficulty)

    # Footer
    c.setFillColor(BEIGE)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, 30, f"BritishHomeInterior.co.uk  |  Page {page_num}")
    return y - 20


def footer(c, page_num):
    c.setFillColor(BEIGE)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, 30, f"BritishHomeInterior.co.uk  |  Page {page_num}")


def checklist_items(c, items, x, y, prefix, start=0):
    """Draw checkboxes with labels. Returns new y."""
    for i, item in enumerate(items):
        if y < 80:
            return y  # safety
        draw_checkbox(c, x, y - 3, f"{prefix}_{start + i}", size=11)
        y = text_block(c, item, x + 18, y, max_width=W - 2 * MARGIN - 30)
        y -= 4
    return y


def decision_flow(c, steps, x, y, width=None):
    """Simple text-based decision flow."""
    w = width or (W - 2 * MARGIN)
    c.setFillColor(HexColor("#F5F8FA"))
    # Calculate height
    h = len(steps) * 18 + 20
    c.roundRect(x, y - h + 12, w, h, 6, fill=1, stroke=0)
    c.setFillColor(DUSTY_BLUE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 12, y, "CAN I USE THIS? Decision Flow")
    c.setFont("Helvetica", 9)
    ty = y - 18
    for step in steps:
        c.setFillColor(CHARCOAL)
        c.drawString(x + 12, ty, step)
        ty -= 16
    return y - h - 4


def fillin_prompt(c, label, x, y, field_key, field_w=200):
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(x, y, label)
    draw_textfield(c, x + len(label) * 5.5 + 10, y - 4, field_w, 16, field_key)
    return y - 26


# =============================================================================
# MAIN PDF GENERATION
# =============================================================================
def generate_pdf():
    c = canvas.Canvas(OUTPUT_FILE, pagesize=letter)
    c.setTitle("The No-Damage Renter's Styling Toolkit")
    c.setAuthor("BritishHomeInterior.co.uk")
    page = 1

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    draw_bg(c)
    c.setFillColor(SAGE_DARK)
    c.rect(0, H - 180, W, 180, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(W / 2, H - 70, "The No-Damage")
    c.drawCentredString(W / 2, H - 108, "Renter's Styling Toolkit")
    c.setFont("Helvetica", 14)
    c.drawCentredString(W / 2, H - 140, "12 Chapters of Damage-Free Styling Mastery")

    y = H - 220
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 13)
    c.drawCentredString(W / 2, y, "Style your rental without losing your deposit.")
    y -= 40
    c.setFillColor(BEIGE_DARK)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(W / 2, y, "GBP 7.00")
    y -= 50

    # Decorative boxes for chapter previews
    chapters_preview = [
        "Adhesive Strips", "Tension Rods", "Adhesive Hooks", "Hanging Art",
        "Floating Shelves", "Curtains", "Bathroom Mounting", "Suction Cups",
        "Leaning", "When to Drill", "Products Worth Buying", "Move-Out Recovery"
    ]
    c.setFont("Helvetica", 9)
    cols = 3
    bw = (W - 2 * MARGIN - 20) / cols
    for i, ch in enumerate(chapters_preview):
        col = i % cols
        row = i // cols
        bx = MARGIN + col * (bw + 10)
        by = y - row * 28
        c.setFillColor(SAGE if i % 2 == 0 else BEIGE)
        c.roundRect(bx, by - 8, bw, 22, 3, fill=1, stroke=0)
        c.setFillColor(CHARCOAL)
        c.drawString(bx + 8, by - 2, f"Ch{i+1}: {ch}")

    y -= 140
    c.setFillColor(SAGE_DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(W / 2, y, "BritishHomeInterior.co.uk")
    c.setFont("Helvetica", 10)
    c.setFillColor(BEIGE_DARK)
    c.drawCentredString(W / 2, y - 18, "Interactive Edition - Fill in, check off, plan your space")

    footer(c, page)
    c.showPage()
    page += 1

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    draw_bg(c)
    c.setFillColor(SAGE_DARK)
    c.rect(0, H - 50, W, 50, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(W / 2, H - 36, "Contents")

    toc = [
        ("Renter Styling Quiz", "3"),
        ("Ch 1: Adhesive Strips", "5"), ("Ch 2: Tension Rods", "8"),
        ("Ch 3: Adhesive Hooks", "11"), ("Ch 4: Hanging Art", "14"),
        ("Ch 5: Floating Shelves", "17"), ("Ch 6: Curtains", "20"),
        ("Ch 7: Bathroom Mounting", "23"), ("Ch 8: Suction Cups", "26"),
        ("Ch 9: Leaning", "29"), ("Ch 10: When to Drill", "32"),
        ("Ch 11: Products Worth Buying", "35"), ("Ch 12: Move-Out Recovery", "38"),
        ("Room-by-Room Planner", "41"), ("Shopping List", "45"),
        ("Move-Out Checklist", "47"), ("Completion Page", "49"),
    ]
    y = H - 90
    for title, pg in toc:
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN + 10, y, title)
        c.setFont("Helvetica", 10)
        c.setFillColor(BEIGE_DARK)
        dots = "." * 60
        c.drawString(MARGIN + 250, y, dots[:40])
        c.drawRightString(W - MARGIN, y, pg)
        y -= 20

    footer(c, page)
    c.showPage()
    page += 1

    # =========================================================================
    # QUIZ: What's Your Renter Styling Level?
    # =========================================================================
    draw_bg(c)
    c.setFillColor(DUSTY_BLUE)
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(W / 2, H - 40, "What's Your Renter Styling Level?")

    y = H - 90
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 11)
    y = text_block(c, "Answer the five questions below to discover your renter styling type.", MARGIN, y, max_width=W - 2 * MARGIN)
    y -= 10

    quiz_questions = [
        ("Q1: When you see a bare wall in your rental, you think...",
         ["a) \"I must not touch it or I'll lose my deposit.\"",
          "b) \"I bet I could use adhesive strips to hang something there.\"",
          "c) \"I'm getting my drill out - I'll fill the holes when I leave.\""]),
        ("Q2: Your bathroom storage strategy is...",
         ["a) Everything stays in a basket on the floor.",
          "b) Over-door hooks and suction cup caddies throughout.",
          "c) I've installed shelves and a towel rail myself."]),
        ("Q3: Your approach to curtains is...",
         ["a) I use whatever came with the flat.",
          "b) I've found tension rods or adhesive hooks that work.",
          "c) I've measured, bought poles, and put them up properly."]),
        ("Q4: When friends visit your rental, they say...",
         ["a) \"It's very... clean.\" (Translation: bare.)",
          "b) \"I can't believe this is a rental - how did you do it?\"",
          "c) \"Wait, you don't own this place?\""]),
        ("Q5: Your relationship with your landlord is...",
         ["a) I've never contacted them about anything decorative.",
          "b) I know exactly what's allowed and work within those limits.",
          "c) I've asked permission for specific projects in writing."]),
    ]

    for qi, (question, options) in enumerate(quiz_questions):
        if y < 120:
            footer(c, page)
            c.showPage()
            page += 1
            draw_bg(c)
            y = H - 60
        c.setFillColor(SAGE_DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y, question)
        y -= 20
        for oi, opt in enumerate(options):
            draw_checkbox(c, MARGIN + 10, y - 3, f"quiz_q{qi+1}_{chr(97+oi)}", size=11)
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 10)
            c.drawString(MARGIN + 28, y, opt)
            y -= 18
        y -= 10

    # Results key
    y -= 10
    c.setFillColor(SAGE_DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, y, "Your Result:")
    y -= 20

    results = [
        ("Mostly A's - The Cautious Renter", "You're afraid to touch the walls. This book will give you the confidence to transform your space without any damage."),
        ("Mostly B's - The Creative Renter", "You already know some tricks. This book will expand your toolkit and help you master every technique."),
        ("Mostly C's - The Almost-Owner", "You treat your rental as your own. This book will help you refine your approach and ensure a full deposit return."),
    ]
    for title, desc in results:
        c.setFillColor(BEIGE_DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(MARGIN + 10, y, title)
        y -= 16
        y = text_block(c, desc, MARGIN + 10, y, size=9, max_width=W - 2 * MARGIN - 20)
        y -= 8

    y -= 6
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, y, "My result:")
    draw_textfield(c, MARGIN + 60, y - 4, 300, 16, "quiz_result")

    footer(c, page)
    c.showPage()
    page += 1

    # =========================================================================
    # CHAPTERS
    # =========================================================================

    chapters = [
        {
            "num": 1, "title": "Adhesive Strips", "difficulty": "Easy",
            "flow": [
                "1. Is the surface smooth and clean? --> YES: Proceed  |  NO: Skip this method",
                "2. Is it painted drywall or wood? --> YES: Proceed  |  NO: Test a small area first",
                "3. Is the room above 10 degrees C? --> YES: Proceed  |  NO: Wait for warmer weather",
                "4. Is it textured or vinyl wallpaper? --> YES: Do NOT use  |  NO: Go ahead!",
            ],
            "steps": [
                "Clean the surface with rubbing alcohol (never Windex or household cleaners)",
                "Wait 10 minutes for surface to dry completely",
                "Check the weight rating and halve it for safety margin",
                "Press interlocking strips firmly for 30 seconds",
                "Wait 1 hour before hanging anything",
                "To remove: pull slowly at a 90-degree angle from the wall",
            ],
            "action": "Pick one wall in your flat. Clean a section with rubbing alcohol and apply your first set of Command strips today. Start with something lightweight.",
            "tip": "Always halve the manufacturer's weight rating. If strips say 3kg, treat them as 1.5kg maximum. This gives you a safety margin and prevents nasty surprises.",
            "weights": ["Small strips: up to 1kg (halved: 0.5kg)", "Medium strips: up to 2.5kg (halved: 1.25kg)", "Large strips: up to 3.5kg (halved: 1.75kg)"],
            "product": ("Command Strips Variety Pack", "GBP 12-15"),
            "fillin": ("Surfaces in my flat suitable for adhesive strips:", "ch1_surfaces"),
            "checklist": [
                "I have rubbing alcohol for surface prep",
                "I know the weight ratings for my strips",
                "I have tested a small area first",
                "I know to halve the weight rating",
                "I know to remove at 90 degrees slowly",
            ],
        },
        {
            "num": 2, "title": "Tension Rods", "difficulty": "Easy",
            "flow": [
                "1. Do you have two parallel walls or surfaces? --> YES: Proceed  |  NO: Not suitable",
                "2. Is the gap between 30cm and 250cm? --> YES: Proceed  |  NO: Check for specialist sizes",
                "3. Will the rod hold heavy items? --> YES: Get ratchet-lock (GBP 15-25)  |  NO: Basic rod is fine",
                "4. Are the surfaces smooth? --> YES: Proceed  |  NO: Add non-slip liner pads",
            ],
            "steps": [
                "Measure the opening precisely (width between walls)",
                "Buy a rod with a wider range than your opening",
                "For heavy loads, choose ratchet-lock mechanism (GBP 15-25)",
                "Cut non-slip shelf liner into small pads for each end",
                "Place liner pads where rod ends will touch the wall",
                "Extend rod until snug - firm but not bowing",
            ],
            "action": "Measure one window or doorway in your flat right now. Write down the measurement and order a tension rod that fits. Use the non-slip liner trick for extra grip.",
            "tip": "The non-slip liner trick: cut a small square of rubberised shelf liner and place it where each end of the tension rod meets the wall. This prevents slipping and protects the wall surface.",
            "weights": ["Basic spring rod: up to 2kg", "Ratchet-lock rod: up to 8kg", "Heavy-duty rod: up to 15kg"],
            "product": ("Ratchet-Lock Tension Rod", "GBP 15-25"),
            "fillin": ("Openings in my flat for tension rods (width in cm):", "ch2_openings"),
            "extras_title": "Uses Beyond Curtains",
            "extras": ["Room dividers with fabric panels", "Hanging plant displays", "Under-shelf storage in kitchen cabinets", "Wardrobe organisation with extra hanging space"],
            "checklist": [
                "I have measured my openings accurately",
                "I have chosen the right rod type for the weight",
                "I have non-slip liner for the ends",
                "I have considered creative uses beyond curtains",
            ],
        },
        {
            "num": 3, "title": "Adhesive Hooks", "difficulty": "Easy",
            "flow": [
                "1. Is the surface smooth and non-porous? --> YES: Proceed  |  NO: Not suitable",
                "2. Will it be used in a wet area? --> YES: Get waterproof version  |  NO: Standard is fine",
                "3. What weight do you need to hold? --> Light (1-2kg) / Medium (2-3kg) / Heavy (paired 5-7kg)",
                "4. Is the hook back flat? --> YES: Best adhesion  |  NO: Choose flat-back instead",
            ],
            "steps": [
                "Choose flat-back hooks over curved-back for better adhesion",
                "Clean surface with rubbing alcohol and dry fully",
                "For bathrooms, use waterproof-rated versions only",
                "Press firmly for 30 seconds when applying",
                "Wait at least 1 hour before hanging anything",
                "Check weight rating matches your intended use",
            ],
            "action": "Identify three spots in your flat where hooks would be useful - entrance for keys, bathroom for towels, bedroom for bags. Install one hook today.",
            "tip": "Flat-back hooks grip far better than curved-back ones. The entire adhesive pad makes contact with the wall, distributing weight evenly. Always choose flat-back.",
            "weights": ["Small hooks: 1-2kg (keys, light items)", "Medium hooks: 2-3kg (towels, bags)", "Paired hooks: 5-7kg (artwork, mirrors)"],
            "product": ("Command Adhesive Hooks (mixed sizes)", "GBP 8-12"),
            "fillin": ("Spots in my flat where I need hooks:", "ch3_spots"),
            "checklist": [
                "I have identified hook locations throughout my flat",
                "I have chosen flat-back over curved-back hooks",
                "I have waterproof versions for the bathroom",
                "I know the weight limits for each size",
            ],
        },
        {
            "num": 4, "title": "Hanging Art", "difficulty": "Medium",
            "flow": [
                "1. Is the frame under 3kg? --> YES: Use Command strips  |  NO: Wire + adhesive hooks",
                "2. Are you creating a gallery wall? --> YES: Use paper template method  |  NO: Single piece at eye level",
                "3. Is it a heavy mirror or canvas? --> YES: Consider leaning (Ch 9) or drilling (Ch 10)",
                "4. Do you want a salon hang or grid? --> Grid: measure carefully  |  Salon: start with largest piece",
            ],
            "steps": [
                "Eye level = 150cm from floor to centre of artwork",
                "Use the paper template method: cut paper to frame size, tape to wall first",
                "Start with the largest piece and work outward",
                "Use odd numbers of pieces - they look more natural",
                "Command strips for frames under 3kg",
                "Wire plus adhesive hooks for heavier pieces",
                "Leave 5-8cm between frames in a gallery wall",
            ],
            "action": "Choose your favourite piece of art. Measure it. Cut a paper template the same size. Tape it to the wall at eye level (150cm centre) and live with it for a day before committing.",
            "tip": "The paper template method saves countless holes and repositioning. Cut newspaper or wrapping paper to the exact size of each frame, tape them to the wall with masking tape, and rearrange until perfect.",
            "weights": ["Command strips: frames up to 3kg", "Wire + 2 adhesive hooks: frames up to 5kg", "Heavy-duty hooks: up to 7kg (use two)"],
            "product": ("Picture Hanging Command Strips", "GBP 6-10"),
            "fillin": ("Art pieces I want to hang (size and weight):", "ch4_art"),
            "checklist": [
                "I know eye level is 150cm to centre",
                "I have paper templates for my frames",
                "I am using odd numbers in groupings",
                "I have the right hanging method for each weight",
                "I have tested placement with paper first",
            ],
        },
        {
            "num": 5, "title": "Floating Shelves", "difficulty": "Medium",
            "flow": [
                "1. What will you store? Weight under 5kg total? --> YES: Adhesive-mount options available",
                "2. Is the wall smooth painted drywall? --> YES: Adhesive brackets work  |  NO: Consider freestanding",
                "3. Do you need multiple shelves? --> YES: Consider a ladder shelf (no damage)  |  NO: Single adhesive shelf",
                "4. Are you displaying heavy books? --> YES: Drilling may be better (Ch 10)  |  NO: Adhesive is fine",
            ],
            "steps": [
                "Check adhesive-mount shelf weight limits (most hold up to 5kg)",
                "Use adhesive strips on bracket shelves for mid-weight items",
                "Style shelves in odd numbers of objects",
                "Use the Books + Plant + Object formula for each shelf",
                "Don't overload - leave some breathing space",
                "Check adhesive bond monthly for the first three months",
            ],
            "action": "Clear one surface in your flat that's cluttered. Order an adhesive-mount shelf and plan what you'll display using the Books + Plant + Object formula.",
            "tip": "The styling formula that always works: one stack of 2-3 books (horizontal), one small plant, and one decorative object (candle, photo frame, small sculpture). Odd numbers create visual interest.",
            "weights": ["Small adhesive shelf: up to 2kg", "Medium adhesive shelf: up to 5kg", "Bracket + adhesive strips: up to 4kg"],
            "product": ("Adhesive-Mount Floating Shelf", "GBP 15-20"),
            "fillin": ("Walls where I could add floating shelves:", "ch5_walls"),
            "checklist": [
                "I know the weight limits of my shelves",
                "I am styling with odd numbers",
                "I am using the Books + Plant + Object formula",
                "I am not overloading any shelf",
            ],
        },
        {
            "num": 6, "title": "Curtains", "difficulty": "Medium",
            "flow": [
                "1. Does the window have a recess? --> YES: Tension rod fits inside  |  NO: Use adhesive hooks + wire",
                "2. Are curtains lightweight (voile/sheer)? --> YES: Command hooks work  |  NO: Need tension rod or hooks + wire",
                "3. Do you want to hang high and wide? --> YES: Adhesive hooks placed above and outside frame",
                "4. Is there a metal window frame? --> YES: Magnetic curtain rod is an option  |  NO: Other methods",
            ],
            "steps": [
                "Choose your no-drill method: tension rod, adhesive hooks + wire, or magnetic rod",
                "Hang curtains high (10-15cm above window frame) to make windows look taller",
                "Hang curtains wide (15-20cm beyond frame on each side) to make windows look wider",
                "Command hooks can hold lightweight curtains directly",
                "For heavier curtains, use wire threaded between two adhesive hooks",
                "Iron or steam curtains before hanging for a polished look",
            ],
            "action": "Measure one window in your flat: height from where you want the rod to the floor, and width including the extra 15-20cm on each side. Order your chosen hardware.",
            "tip": "Hanging curtains high and wide is the single biggest visual trick in any rental. It makes windows look larger, ceilings look taller, and rooms feel grander - all without a single hole in the wall.",
            "weights": ["Command hooks: lightweight voile/sheers only", "Tension rod: most curtain weights", "Adhesive hooks + wire: medium-weight curtains"],
            "product": ("Spring Tension Curtain Rod", "GBP 10-18"),
            "fillin": ("Windows I want to add curtains to (measurements):", "ch6_windows"),
            "checklist": [
                "I have measured my windows (height and width)",
                "I know which no-drill method suits each window",
                "I am hanging high and wide for maximum effect",
                "I have chosen the right weight method for my curtains",
            ],
        },
        {
            "num": 7, "title": "Bathroom Mounting", "difficulty": "Medium",
            "flow": [
                "1. What surface? Tile or glass? --> YES: Suction cups work  |  NO: Adhesive with waterproof rating",
                "2. Is it a shower caddy? --> YES: Tension pole caddy (floor to ceiling)  |  NO: Check other options",
                "3. Do you need towel storage? --> YES: Over-door hooks or adhesive towel bar  |  NO: Skip to accessories",
                "4. Is it a toilet roll holder? --> YES: Adhesive-mount or freestanding  |  NO: Consider suction or adhesive",
            ],
            "steps": [
                "Use suction cups with lever lock (not basic push-on) for tile and glass",
                "Install over-door hooks on bathroom and shower doors",
                "Get a tension pole shower caddy (floor to ceiling, no drilling)",
                "Use adhesive-mount toilet roll holders (rated for bathrooms)",
                "Add adhesive towel bars (ensure waterproof rating)",
                "Keep spare suction cups - replace every 6-12 months",
            ],
            "action": "Assess your bathroom right now. List what you need: shower storage, towel hooks, toilet roll holder, mirror. Choose one item and install it this week.",
            "tip": "Tension pole shower caddies are the unsung hero of rental bathrooms. They wedge between the floor and ceiling (or bath rim and ceiling) and provide multiple shelves without touching a single wall.",
            "weights": ["Suction cups (lever lock): up to 3kg", "Over-door hooks: up to 5kg per hook", "Adhesive towel bar: up to 4kg"],
            "product": ("Tension Pole Shower Caddy", "GBP 20-30"),
            "fillin": ("Bathroom storage I need:", "ch7_bathroom"),
            "checklist": [
                "I have assessed all bathroom mounting needs",
                "I have lever-lock suction cups (not basic)",
                "I have considered a tension pole caddy",
                "I have waterproof-rated adhesive products",
            ],
        },
        {
            "num": 8, "title": "Suction Cups", "difficulty": "Easy",
            "flow": [
                "1. Is the surface glass or smooth tile? --> YES: Suction cups will work  |  NO: Do not use suction cups",
                "2. Is the surface clean and non-porous? --> YES: Proceed  |  NO: Clean with rubbing alcohol first",
                "3. Is it a quality suction cup with lever? --> YES: Good  |  NO: Replace with quality version",
                "4. Is it over 12 months old? --> YES: Time to replace  |  NO: Check monthly",
            ],
            "steps": [
                "Clean the surface with rubbing alcohol first - always",
                "Wet the rim of the suction cup slightly before pressing on",
                "Push firmly and engage the lever lock if present",
                "Test with a gentle tug before loading weight",
                "Avoid pound shop suction cups - quality matters enormously",
                "Replace every 6-12 months as rubber degrades",
            ],
            "action": "Check every suction cup in your home right now. Replace any that are more than a year old or from budget brands. Clean the surfaces and reattach properly.",
            "tip": "A tiny amount of water (or even a thin layer of petroleum jelly) on the rim of a suction cup dramatically improves the seal. The key is creating an airtight bond with no microscopic gaps.",
            "weights": ["Small suction cup: up to 1kg", "Medium with lever: up to 2kg", "Large with lever: up to 3kg"],
            "product": ("Quality Lever-Lock Suction Hooks (pack of 4)", "GBP 8-10"),
            "fillin": ("Surfaces in my flat suitable for suction cups:", "ch8_surfaces"),
            "checklist": [
                "All suction cups are quality brands with lever locks",
                "All surfaces are cleaned with rubbing alcohol",
                "I wet the rim before applying",
                "I know to replace every 6-12 months",
                "I only use them on glass and smooth tile",
            ],
        },
        {
            "num": 9, "title": "Leaning", "difficulty": "Easy",
            "flow": [
                "1. Is the item large and heavy? --> YES: Leaning is ideal  |  NO: Consider hanging instead",
                "2. Do you have floor or shelf space? --> YES: Proceed  |  NO: Wall-mounted methods needed",
                "3. Is it a mirror? --> YES: Lean against wall on floor  |  NO: Art on mantel/shelf",
                "4. Is it stable? --> YES: Great  |  NO: Add anti-slip pads underneath",
            ],
            "steps": [
                "Lean large mirrors against the wall on the floor",
                "Place art on mantels, shelves, and windowsills",
                "Use ladder shelves for vertical display space",
                "Add tall plants as 'living art' - no damage, maximum impact",
                "Layer items: lean a large piece behind smaller ones",
                "Use anti-slip pads under heavy leaning items",
            ],
            "action": "Find one large item - a mirror, a print, or a tall plant - and lean or place it in a prominent position. Step back and see the instant impact.",
            "tip": "Leaning is the ultimate no-damage technique. A large mirror leaned against a wall makes a room feel twice as big. Layer a smaller print in front for a curated, designer look that costs nothing to undo.",
            "weights": [],
            "product": ("Ladder Shelf (freestanding)", "GBP 25-40"),
            "fillin": ("Items I can lean or place without mounting:", "ch9_items"),
            "checklist": [
                "I have identified items to lean rather than hang",
                "Heavy items have anti-slip pads",
                "I am using vertical space with ladder shelves",
                "I have considered tall plants as living art",
            ],
        },
        {
            "num": 10, "title": "When to Drill", "difficulty": "Advanced",
            "flow": [
                "1. Have you checked your lease? --> YES: Proceed  |  NO: Read lease first!",
                "2. Does the lease allow small holes? --> YES: You may drill  |  NO: Ask landlord in writing",
                "3. Can you fill and paint afterwards? --> YES: Drilling is viable  |  NO: Stick to no-drill methods",
                "4. Do you have leftover paint for touch-ups? --> YES: Perfect  |  NO: Ask landlord for paint details",
            ],
            "steps": [
                "Read your lease thoroughly - many allow small picture hooks",
                "Ask your landlord in writing (email) for permission - keep the reply",
                "Small holes from picture hooks are usually easy to fill",
                "Use Polyfilla or lightweight spackle to fill holes",
                "Sand smooth when dry and touch up with matching paint",
                "Document the wall before and after for your records",
                "Polyfilla plus paint equals an invisible repair",
            ],
            "action": "Read your lease right now. Look for clauses about 'alterations', 'fixtures', 'holes', or 'damage'. If unclear, draft a polite email to your landlord asking what's allowed.",
            "tip": "Sometimes drilling is genuinely the better option. Two small holes filled with Polyfilla and painted over are invisible. A heavy mirror that falls from failed adhesive strips causes real damage.",
            "weights": [],
            "product": ("Polyfilla Lightweight Filler", "GBP 4-6"),
            "fillin": ("My lease says about wall fixings:", "ch10_lease"),
            "checklist": [
                "I have read my lease regarding alterations",
                "I have landlord permission in writing (if needed)",
                "I have Polyfilla and matching paint for repairs",
                "I know how to fill and sand small holes",
                "I have documented walls before drilling",
            ],
        },
        {
            "num": 11, "title": "Products Worth Buying", "difficulty": "Easy",
            "flow": [
                "1. Are you starting from scratch? --> YES: Buy the essentials kit below",
                "2. Do you have basics already? --> YES: Top up specific items  |  NO: Get the full list",
                "3. Is your budget tight? --> YES: Start with Command strips + hooks  |  NO: Get everything",
                "4. Total budget approximately GBP 90-110 for everything",
            ],
            "steps": [
                "Command Strips variety pack - GBP 15 (your most-used product)",
                "Velvet hangers (50 pack) - GBP 20 (transform your wardrobe)",
                "Tension rods x2 - GBP 20-30 (curtains and more)",
                "Over-door hooks (set of 2) - GBP 8 (instant bathroom storage)",
                "Non-slip shelf liner - GBP 5 (the tension rod trick)",
                "Suction hooks (quality, pack of 4) - GBP 8 (bathroom essentials)",
                "Adhesive floating shelves x2 - GBP 15-20 (display space)",
            ],
            "action": "Review this list and tick off what you already own. Order the items you're missing. Your total investment for a fully styled rental is approximately GBP 90-110.",
            "tip": "This entire toolkit costs less than what most renters lose from their deposit for wall damage. Invest GBP 90-110 now and protect a deposit worth hundreds or thousands of pounds.",
            "weights": [],
            "product": ("Complete Renter's Toolkit (all items)", "approx GBP 90-110 total"),
            "fillin": ("My budget for renter styling products:", "ch11_budget"),
            "checklist": [
                "Command strips variety pack (GBP 15)",
                "Velvet hangers 50-pack (GBP 20)",
                "Tension rods x2 (GBP 20-30)",
                "Over-door hooks (GBP 8)",
                "Non-slip shelf liner (GBP 5)",
                "Suction hooks pack (GBP 8)",
                "Adhesive shelves x2 (GBP 15-20)",
            ],
        },
        {
            "num": 12, "title": "Move-Out Recovery", "difficulty": "Advanced",
            "flow": [
                "1. Have you given notice? --> YES: Start recovery plan 2 weeks before  |  NO: Plan ahead anyway",
                "2. Did you drill any holes? --> YES: Fill with Polyfilla, sand, paint  |  NO: Focus on adhesive removal",
                "3. Did you keep leftover paint? --> YES: Touch up walls  |  NO: Ask landlord for paint colour",
                "4. Have you documented everything? --> YES: Good  |  NO: Photograph every wall now",
            ],
            "steps": [
                "Fill any holes with Polyfilla or lightweight spackle",
                "Sand filled holes smooth when fully dry",
                "Paint over repairs with matching paint (keep leftovers!)",
                "Remove all adhesive strips slowly at 90-degree angles",
                "Use a magic eraser for scuff marks and residue",
                "Remove all hooks, strips, and temporary fixtures",
                "Clean all surfaces where adhesive was applied",
                "Document everything with dated photographs",
            ],
            "action": "Create your move-out timeline now. Two weeks before your move date, begin removing all temporary fixtures. One week before, do all filling, sanding, and painting. Document everything with photos.",
            "tip": "The magic eraser is your best friend at move-out. It removes scuff marks, adhesive residue, and light marks from walls without damaging paint. Buy a pack and go room by room.",
            "weights": [],
            "product": ("Magic Eraser Sponges (pack of 10)", "GBP 5-8"),
            "fillin": ("My move-out date:", "ch12_moveout_date"),
            "checklist": [
                "All holes filled with Polyfilla and sanded smooth",
                "All filled areas painted to match",
                "All adhesive strips removed slowly at 90 degrees",
                "All hooks and fixtures removed",
                "All scuff marks cleaned with magic eraser",
                "All surfaces cleaned where adhesive was used",
                "Every wall photographed with date stamp",
                "Deposit return checklist completed",
            ],
        },
    ]

    # Generate each chapter
    for ch in chapters:
        # Chapter title page
        draw_bg(c)
        chapter_title_page(c, ch["num"], ch["title"], ch["difficulty"], page)
        footer(c, page)
        c.showPage()
        page += 1

        # Chapter content page 1
        draw_bg(c)
        y = H - 50
        c.setFillColor(SAGE_DARK)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(MARGIN, y, f"Chapter {ch['num']}: {ch['title']}")
        y -= 24

        # Decision flow
        y = decision_flow(c, ch["flow"], MARGIN, y)
        y -= 8

        # Steps
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y, "Step-by-Step Actions:")
        y -= 18
        y = checklist_items(c, ch["steps"], MARGIN, y, f"ch{ch['num']}_step")
        y -= 8

        # Fill-in prompt
        if ch.get("fillin"):
            label, key = ch["fillin"]
            y = fillin_prompt(c, label, MARGIN, y, key, field_w=250)
            y -= 4

        # Action block
        if y < 120:
            footer(c, page)
            c.showPage()
            page += 1
            draw_bg(c)
            y = H - 50

        y = action_block(c, ch["action"], MARGIN, y)
        y -= 8

        # Tip box
        if y < 100:
            footer(c, page)
            c.showPage()
            page += 1
            draw_bg(c)
            y = H - 50

        y = tip_box(c, ch["tip"], MARGIN, y)

        footer(c, page)
        c.showPage()
        page += 1

        # Chapter content page 2
        draw_bg(c)
        y = H - 50

        # Weight limits (if any)
        if ch["weights"]:
            y = weight_box(c, ch["weights"], MARGIN, y)
            y -= 8

        # Product recommendation
        y = product_box(c, ch["product"][0], ch["product"][1], MARGIN, y)
        y -= 8

        # Extras (if any)
        if ch.get("extras"):
            c.setFillColor(SAGE_DARK)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(MARGIN, y, ch.get("extras_title", "Additional Ideas:"))
            y -= 18
            for ext in ch["extras"]:
                c.setFillColor(CHARCOAL)
                c.setFont("Helvetica", 10)
                c.drawString(MARGIN + 12, y, f"- {ext}")
                y -= 16
            y -= 8

        # End-of-chapter checklist
        c.setFillColor(SAGE_DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y, f"Chapter {ch['num']} Checklist:")
        y -= 18
        y = checklist_items(c, ch["checklist"], MARGIN, y, f"ch{ch['num']}_done")

        footer(c, page)
        c.showPage()
        page += 1

    # =========================================================================
    # ROOM-BY-ROOM PLANNER
    # =========================================================================
    rooms = ["Bedroom", "Living Room", "Kitchen", "Bathroom"]
    for room in rooms:
        draw_bg(c)
        c.setFillColor(DUSTY_BLUE)
        c.rect(0, H - 50, W, 50, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(W / 2, H - 36, f"Room Planner: {room}")

        y = H - 80
        room_key = room.lower().replace(" ", "_")
        fields = [
            ("What I want to hang or mount:", f"{room_key}_hang", 3),
            ("Methods I will use:", f"{room_key}_methods", 2),
            ("Products I need to buy:", f"{room_key}_products", 2),
            ("Estimated budget (GBP):", f"{room_key}_budget", 1),
            ("Notes and measurements:", f"{room_key}_notes", 3),
        ]

        for label, key, lines in fields:
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(MARGIN, y, label)
            y -= 16
            h = lines * 20
            draw_textfield(c, MARGIN, y - h + 10, W - 2 * MARGIN, h, key, multiline=(lines > 1))
            y -= h + 12

        # Room checklist
        c.setFillColor(SAGE_DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y, f"{room} Completion Checklist:")
        y -= 18
        room_checks = [
            f"All items planned for {room.lower()}",
            "Products purchased",
            "Methods tested on small area",
            "Everything installed",
            "Before photos taken",
        ]
        y = checklist_items(c, room_checks, MARGIN, y, f"{room_key}_check")

        footer(c, page)
        c.showPage()
        page += 1

    # =========================================================================
    # SHOPPING LIST
    # =========================================================================
    draw_bg(c)
    c.setFillColor(TERRACOTTA)
    c.rect(0, H - 50, W, 50, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(W / 2, H - 36, "Complete Shopping List")

    y = H - 75
    shopping_items = [
        ("Command Strips Variety Pack", "GBP 15"),
        ("Command Adhesive Hooks (mixed)", "GBP 8-12"),
        ("Picture Hanging Strips", "GBP 6-10"),
        ("Velvet Hangers (50 pack)", "GBP 20"),
        ("Tension Rods x2", "GBP 20-30"),
        ("Over-Door Hooks (set of 2)", "GBP 8"),
        ("Non-Slip Shelf Liner", "GBP 5"),
        ("Suction Hooks with Lever (pack of 4)", "GBP 8-10"),
        ("Adhesive Floating Shelves x2", "GBP 15-20"),
        ("Tension Pole Shower Caddy", "GBP 20-30"),
        ("Adhesive Towel Bar", "GBP 8-12"),
        ("Adhesive Toilet Roll Holder", "GBP 6-10"),
        ("Ladder Shelf (freestanding)", "GBP 25-40"),
        ("Polyfilla Lightweight Filler", "GBP 4-6"),
        ("Magic Eraser Sponges (pack of 10)", "GBP 5-8"),
        ("Rubbing Alcohol (surface prep)", "GBP 3-5"),
        ("Masking Tape (for templates)", "GBP 2-3"),
    ]

    for i, (item, price) in enumerate(shopping_items):
        if y < 60:
            footer(c, page)
            c.showPage()
            page += 1
            draw_bg(c)
            y = H - 50
        draw_checkbox(c, MARGIN, y - 3, f"shop_{i}", size=11)
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(MARGIN + 18, y, item)
        c.setFillColor(BEIGE_DARK)
        c.setFont("Helvetica", 10)
        c.drawRightString(W - MARGIN - 60, y, price)
        # Small "purchased" checkbox
        draw_checkbox(c, W - MARGIN - 14, y - 3, f"shop_bought_{i}", size=11)
        y -= 22

    y -= 10
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN, y, "Estimated Total: GBP 90-110 (essentials only)")
    y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, y, "My actual total spent:")
    draw_textfield(c, MARGIN + 130, y - 4, 120, 16, "total_spent")

    footer(c, page)
    c.showPage()
    page += 1

    # =========================================================================
    # MOVE-OUT RECOVERY CHECKLIST
    # =========================================================================
    draw_bg(c)
    c.setFillColor(SAGE_DARK)
    c.rect(0, H - 50, W, 50, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(W / 2, H - 36, "Move-Out Recovery Checklist")

    y = H - 70
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica", 10)
    y = text_block(c, "Complete this checklist two weeks before your move-out date to ensure you get your full deposit back.", MARGIN, y, max_width=W - 2 * MARGIN)
    y -= 10

    moveout_sections = [
        ("Walls and Surfaces", [
            "Remove all adhesive strips (pull slowly at 90 degrees)",
            "Remove all adhesive hooks",
            "Fill all holes with Polyfilla",
            "Sand all filled areas smooth when dry",
            "Touch up paint on all repaired areas",
            "Use magic eraser on all scuff marks",
            "Clean adhesive residue from all surfaces",
        ]),
        ("Bathroom", [
            "Remove all suction cups and clean surfaces",
            "Remove tension pole shower caddy",
            "Remove over-door hooks",
            "Remove adhesive towel bars and toilet roll holders",
            "Clean all tile surfaces",
        ]),
        ("Windows and Curtains", [
            "Remove all tension rods",
            "Remove any adhesive hooks used for curtains",
            "Clean window frames where hardware touched",
            "Remove any magnetic curtain rods",
        ]),
        ("Documentation", [
            "Photograph every wall in every room",
            "Photograph all repaired areas close-up",
            "Date stamp all photographs",
            "Save landlord permission emails",
            "Keep receipts for repair materials",
            "Review lease for any specific requirements",
        ]),
        ("Final Checks", [
            "Walk through every room checking for missed items",
            "Compare with move-in photographs/inventory",
            "Ensure all surfaces are clean and undamaged",
            "Request deposit return in writing",
        ]),
    ]

    for section_title, items in moveout_sections:
        if y < 80:
            footer(c, page)
            c.showPage()
            page += 1
            draw_bg(c)
            y = H - 50
        c.setFillColor(SAGE_DARK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(MARGIN, y, section_title)
        y -= 18
        for i, item in enumerate(items):
            if y < 60:
                footer(c, page)
                c.showPage()
                page += 1
                draw_bg(c)
                y = H - 50
            draw_checkbox(c, MARGIN + 10, y - 3, f"moveout_{section_title[:4]}_{i}", size=11)
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 10)
            c.drawString(MARGIN + 28, y, item)
            y -= 18
        y -= 10

    # Move-out date field
    y -= 5
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN, y, "My move-out date:")
    draw_textfield(c, MARGIN + 120, y - 4, 150, 16, "moveout_date_final")
    y -= 22
    c.drawString(MARGIN, y, "Deposit amount (GBP):")
    draw_textfield(c, MARGIN + 140, y - 4, 120, 16, "deposit_amount")

    footer(c, page)
    c.showPage()
    page += 1

    # =========================================================================
    # COMPLETION PAGE
    # =========================================================================
    draw_bg(c)
    c.setFillColor(SAGE_DARK)
    c.rect(0, H - 100, W, 100, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(W / 2, H - 55, "Your Rental Is Styled!")
    c.setFont("Helvetica", 14)
    c.drawCentredString(W / 2, H - 80, "Congratulations on transforming your space without damage.")

    y = H - 140
    c.setFillColor(CHARCOAL)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(W / 2, y, "Your Results")
    y -= 30

    completion_fields = [
        ("Rooms completed:", "comp_rooms", 80),
        ("Chapters finished:", "comp_chapters", 80),
        ("Total spent (GBP):", "comp_total", 100),
        ("Favourite technique:", "comp_fav", 200),
        ("Before rating (1-10):", "comp_before", 60),
        ("After rating (1-10):", "comp_after", 60),
    ]

    for label, key, fw in completion_fields:
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 12)
        c.drawString(MARGIN + 40, y, label)
        draw_textfield(c, MARGIN + 200, y - 4, fw, 18, key)
        y -= 30

    y -= 20
    c.setFillColor(SAGE_DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(W / 2, y, "Rooms Completed:")
    y -= 24
    for room in rooms:
        draw_checkbox(c, W / 2 - 80, y - 3, f"comp_room_{room.lower().replace(' ', '_')}", size=12)
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 11)
        c.drawString(W / 2 - 62, y, room)
        y -= 22

    y -= 20
    y = action_block(c, "Share your transformation! Take before and after photos and tag @BritishHomeInterior on social media. You've earned it.", MARGIN, y)

    y -= 20
    c.setFillColor(BEIGE_DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(W / 2, y, "Thank you for choosing BritishHomeInterior.co.uk")
    y -= 18
    c.setFont("Helvetica", 10)
    c.setFillColor(CHARCOAL)
    c.drawCentredString(W / 2, y, "Visit us for more renter-friendly styling guides and inspiration.")

    footer(c, page)
    c.showPage()
    page += 1

    # Save
    c.save()
    print(f"PDF generated successfully: {OUTPUT_FILE}")
    print(f"Total pages: {page - 1}")


if __name__ == "__main__":
    generate_pdf()
