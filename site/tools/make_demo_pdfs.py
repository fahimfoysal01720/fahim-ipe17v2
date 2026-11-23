#!/usr/bin/env python3
"""Builds professional-looking demo PDFs at the paths the portfolio expects."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, KeepTogether)
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NAVY = colors.HexColor("#0b1220")
BLUE = colors.HexColor("#0a6cff")
ORANGE = colors.HexColor("#ff9f1c")
GREY = colors.HexColor("#5b6b82")
LIGHT = colors.HexColor("#eef2f8")
LINE = colors.HexColor("#dbe3ee")

DOCS = [
    dict(
        folder="pdfd", kicker="PROJECT DOCUMENTATION", cat="Design",
        title="Pedal Powered Washing Machine",
        subtitle="Design, marketing analysis and prototyping of a human-powered washer",
        abstract=("This report documents the complete design cycle of a pedal powered washing machine "
                  "intended for households with limited or unreliable electricity. Customer needs were "
                  "collected, translated into engineering characteristics with Quality Function Deployment, "
                  "and realised in a drum-and-gear concept modelled in SolidWorks. A cost model and a "
                  "prototype build complete the study."),
        sections=["Introduction and problem statement",
                  "Voice of the customer and QFD matrix",
                  "Concept generation and selection",
                  "Detailed design and SolidWorks modelling",
                  "Bill of materials and cost analysis",
                  "Prototype assembly and testing"],
        table=[("Drum capacity", "6 kg per cycle"), ("Drive", "Chain + 3-speed gearbox"),
               ("Frame", "MS square tube, powder coated"), ("Est. unit cost", "BDT 9,850")],
        tags=["SolidWorks", "QFD", "Cost analysis", "Prototyping"]),

    dict(
        folder="pdfp", kicker="PROJECT DOCUMENTATION", cat="Automation",
        title="Automatic Fan Control",
        subtitle="Arduino + DHT11 closed-loop fan switching for a classroom",
        abstract=("An automatic fan controller was built around an Arduino Uno and a DHT11 temperature and "
                  "humidity sensor. The firmware samples the environment, applies hysteresis around a "
                  "user-set threshold and drives the fan through a relay module. The report covers the bill "
                  "of materials, circuit diagram, program logic and measured test results."),
        sections=["Objective and scope", "System architecture", "Components and bill of materials",
                  "Circuit design and wiring", "Arduino program logic", "Testing and observations"],
        table=[("Controller", "Arduino Uno R3"), ("Sensor", "DHT11 (temp + RH)"),
               ("Switching", "5 V relay module, 10 A"), ("Threshold", "28 °C with 1 °C hysteresis")],
        tags=["Arduino", "DHT11", "Circuit design", "Embedded systems"]),

    dict(
        folder="pdfm", kicker="PROJECT DOCUMENTATION", cat="Research · IOEM 2024",
        title="Nirr: E-Accommodation (MIS)",
        subtitle="A management information system for student housing, with a working web demo",
        abstract=("Nirr is a management information system concept for bachelor and student accommodation in "
                  "Bangladesh. The study defines the information flows between tenants, landlords and the "
                  "platform, estimates the break-even point, and demonstrates the concept as a functional "
                  "website built with HTML, CSS and JavaScript. The work was published at IOEM 2024."),
        sections=["Background and market need", "MIS framework and information flows",
                  "System and website design", "Break-even and cost analysis",
                  "Findings and recommendation", "Limitations and future work"],
        table=[("Fixed cost", "BDT 3,20,000"), ("Variable cost / listing", "BDT 180"),
               ("Service charge", "BDT 550 / booking"), ("Break-even", "≈ 860 bookings")],
        tags=["MIS", "HTML / CSS / JS", "Break-even", "IOEM 2024"]),

    dict(
        folder="pdft", kicker="THESIS DOCUMENTATION", cat="Research",
        title="Multi-Objective Optimization of a Multi-Stage Supply Chain Distribution Network",
        subtitle="Nature-inspired algorithms with a green supply objective",
        abstract=("This undergraduate thesis formulates a multi-stage, multi-objective distribution network "
                  "problem that minimises total cost and CO2 emission simultaneously. Three nature-inspired "
                  "metaheuristics — Particle Swarm Optimization, a Genetic Algorithm and a hybrid GA-PSO — "
                  "are implemented, tuned and compared on benchmark instances of increasing size."),
        sections=["Introduction and literature review", "Problem formulation and assumptions",
                  "Mathematical model and constraints", "PSO implementation", "GA and hybrid GA-PSO implementation",
                  "Results, comparison and conclusion"],
        table=[("Objectives", "Cost, CO2 emission"), ("Decision variables", "Plant, DC, flow, mode"),
               ("Algorithms", "PSO · GA · GA-PSO"), ("Best performer", "Hybrid GA-PSO")],
        tags=["PSO", "GA", "GA-PSO", "Green supply chain"]),

    dict(
        folder="pdcn", kicker="SUPPORTING DOCUMENTATION", cat="Research",
        title="Distribution Network — Additional Documentation",
        subtitle="Model data, algorithm parameters and extended result tables",
        abstract=("Supporting material for the thesis: the full network structure, data collection sheets, "
                  "assumptions, metaheuristic parameters and the extended result tables used to compare "
                  "PSO, GA and the hybrid GA-PSO across all instances."),
        sections=["Network structure", "Data collection and assumptions", "Parameter tuning",
                  "Extended result tables", "Sensitivity analysis", "Appendices"],
        table=[("Instances", "12 benchmark networks"), ("Population", "40 particles / chromosomes"),
               ("Iterations", "500"), ("Runs per instance", "30 (mean reported)")],
        tags=["Network design", "Data analysis", "Appendices"]),

    dict(
        folder="pdfc", kicker="PROJECT DOCUMENTATION", cat="Research · ICMIME 2022",
        title="Impact of Covid-19 on FMCG Stocks",
        subtitle="A time-series case study of the Bangladesh stock market",
        abstract=("The study measures how the Covid-19 shock moved the FMCG sector of the Dhaka Stock "
                  "Exchange. Daily price series were analysed in MS Excel using Relative Strength Index and "
                  "the Augmented Dickey-Fuller test, with pre- and post-shock windows compared. The work was "
                  "published at ICMIME 2022."),
        sections=["Introduction", "Data and methodology", "RSI analysis",
                  "Stationarity testing (ADF)", "Results and discussion", "Conclusion"],
        table=[("Market", "Dhaka Stock Exchange"), ("Sector", "FMCG"), ("Tools", "MS Excel"),
               ("Tests", "RSI · ADF")],
        tags=["Time series", "RSI", "ADF test", "ICMIME 2022"]),
]

styles = {
    "kicker": ParagraphStyle("kicker", fontName="Helvetica-Bold", fontSize=9, textColor=BLUE, leading=12, spaceAfter=4),
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=27, textColor=NAVY, leading=32, spaceAfter=10),
    "subtitle": ParagraphStyle("subtitle", fontName="Helvetica", fontSize=12.5, textColor=GREY, leading=18),
    "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13.5, textColor=NAVY, leading=18, spaceBefore=14, spaceAfter=6),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10.2, textColor=colors.HexColor("#33415c"),
                           leading=16.4, alignment=TA_JUSTIFY, spaceAfter=8),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=8.6, textColor=GREY, leading=12),
    "num": ParagraphStyle("num", fontName="Helvetica-Bold", fontSize=10, textColor=BLUE, leading=16),
    "li": ParagraphStyle("li", fontName="Helvetica", fontSize=10.2, textColor=colors.HexColor("#33415c"), leading=16.4),
}


def cover(c, d, meta):
    w, h = A4
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, h - 62 * mm, w, 62 * mm, stroke=0, fill=1)
    c.setFillColor(BLUE); c.rect(0, h - 64 * mm, w, 2 * mm, stroke=0, fill=1)
    c.setFillColor(ORANGE); c.rect(0, h - 65.6 * mm, 46 * mm, 1.6 * mm, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#8fb8ff")); c.setFont("Helvetica-Bold", 9)
    c.drawString(22 * mm, h - 24 * mm, d["kicker"] + "  ·  " + d["cat"].upper())

    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 21)
    words, lines, cur = d["title"].split(), [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if c.stringWidth(trial, "Helvetica-Bold", 21) < 166 * mm:
            cur = trial
        else:
            lines.append(cur); cur = word
    lines.append(cur)
    y = h - 36 * mm
    for ln in lines[:3]:
        c.drawString(22 * mm, y, ln); y -= 9.5 * mm

    c.setFillColor(colors.HexColor("#a9bdd8")); c.setFont("Helvetica", 11)
    c.drawString(22 * mm, y - 2 * mm, d["subtitle"][:96])

    # meta block
    rows = [["Author", "Fahim Foysal"],
            ["Department", "Industrial & Production Engineering"],
            ["Institution", "RUET · M.Sc. at BUET"],
            ["Document", "Project report"],
            ["Category", d["cat"]]]
    c.setFillColor(GREY); c.setFont("Helvetica-Bold", 9)
    yy = h - 92 * mm
    for k, v in rows:
        c.setFillColor(GREY); c.setFont("Helvetica-Bold", 8.4)
        c.drawString(22 * mm, yy, k.upper())
        c.setFillColor(NAVY); c.setFont("Helvetica", 10.5)
        c.drawString(62 * mm, yy, v)
        yy -= 9 * mm

    # abstract card
    c.setFillColor(LIGHT); c.roundRect(22 * mm, 62 * mm, w - 44 * mm, 52 * mm, 4 * mm, stroke=0, fill=1)
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 8.6)
    c.drawString(30 * mm, 104 * mm, "ABSTRACT")
    t = c.beginText(30 * mm, 96 * mm)
    t.setFont("Helvetica", 9.4); t.setLeading(13.6); t.setFillColor(colors.HexColor("#33415c"))
    words, line = d["abstract"].split(), ""
    for word in words:
        trial = (line + " " + word).strip()
        if c.stringWidth(trial, "Helvetica", 9.4) < 144 * mm:
            line = trial
        else:
            t.textLine(line); line = word
    if line:
        t.textLine(line)
    c.drawText(t)

    c.setFillColor(GREY); c.setFont("Helvetica", 7.6)
    c.drawString(22 * mm, 26 * mm, "Demo PDF created to demonstrate the portfolio document reader.")
    c.drawString(22 * mm, 21 * mm, "Replace this file with the final report at the same path.")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8)
    c.drawRightString(w - 22 * mm, 26 * mm, "fahimruet.github.io")
    c.restoreState()


def later(c, doc_ref, title):
    c.saveState()
    w, h = A4
    c.setFillColor(LINE); c.setStrokeColor(LINE)
    c.setLineWidth(0.7); c.line(22 * mm, h - 20 * mm, w - 22 * mm, h - 20 * mm)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8.6)
    c.drawString(22 * mm, h - 16 * mm, title[:70])
    c.setFillColor(GREY); c.setFont("Helvetica", 8.2)
    c.drawRightString(w - 22 * mm, h - 16 * mm, "Fahim Foysal  ·  I.P.E.")
    c.line(22 * mm, 18 * mm, w - 22 * mm, 18 * mm)
    c.drawString(22 * mm, 12.5 * mm, "Demo document · portfolio preview")
    c.drawRightString(w - 22 * mm, 12.5 * mm, "Page %d" % c.getPageNumber())
    c.restoreState()


def build(d):
    folder = os.path.join(OUT, d["folder"])
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, "documentation.pdf")

    doc = BaseDocTemplate(path, pagesize=A4,
                          leftMargin=22 * mm, rightMargin=22 * mm,
                          topMargin=26 * mm, bottomMargin=24 * mm,
                          title=d["title"], author="Fahim Foysal",
                          subject=d["cat"], creator="Portfolio demo generator")
    frame = Frame(22 * mm, 24 * mm, A4[0] - 44 * mm, A4[1] - 50 * mm, id="n")

    def on_page(c, docu):
        if c.getPageNumber() == 1:
            cover(c, d, None)
        else:
            later(c, docu, d["title"])

    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])

    story = [Spacer(1, 132 * mm)]  # push past the cover artwork
    story.append(PageBreak())
    story.append(Paragraph("Contents", styles["h2"]))
    for i, s in enumerate(d["sections"], 1):
        story.append(Paragraph(f"{i:02d}. &nbsp;{s}", styles["li"]))
        story.append(Spacer(1, 3))

    story.append(Paragraph("1. Introduction", styles["h2"]))
    story.append(Paragraph(d["abstract"], styles["body"]))

    story.append(Paragraph("At a glance", styles["h2"]))
    data = [["Parameter", "Value"]] + [[k, v] for k, v in d["table"]]
    t = Table(data, colWidths=[62 * mm, 104 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (0, -1), NAVY),
        ("TEXTCOLOR", (1, 1), (1, -1), colors.HexColor("#33415c")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f9fd")]),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t)

    story.append(Paragraph("Scope of the work", styles["h2"]))
    story.append(Paragraph(
        "The work was carried out under the Department of Industrial & Production Engineering, "
        "Rajshahi University of Engineering & Technology. Methods follow standard industrial "
        "engineering practice: requirements gathering, quantitative analysis, design of the "
        "solution and validation against measurable criteria. All calculations are reproducible "
        "from the appendix tables.", styles["body"]))

    story.append(PageBreak())
    for i, s in enumerate(d["sections"][1:4], 2):
        story.append(Paragraph(f"{i}. {s}", styles["h2"]))
        story.append(Paragraph(
            f"This section documents <b>{s.lower()}</b> in detail, including the method used, the data "
            "that was collected, the assumptions that had to be made and the outcome. Figures and "
            "tables referred to here are reproduced in the appendix of the final report.", styles["body"]))
        story.append(Paragraph(
            "Findings were checked against published work in the same area and discussed with the "
            "project supervisor before being carried forward into the next stage.", styles["body"]))

    story.append(Paragraph("Keywords", styles["h2"]))
    story.append(Paragraph(" &nbsp;·&nbsp; ".join(d["tags"]), styles["small"]))

    doc.build(story)
    return path


if __name__ == "__main__":
    for d in DOCS:
        p = build(d)
        print("%-28s %6.1f KB" % (os.path.relpath(p, OUT), os.path.getsize(p) / 1024))
