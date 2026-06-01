import pytest

from app.core.errors import AppError
from app.services.imports import detect_and_parse, parse_csv_line, parse_fidelity, parse_journedge


def test_detect_journedge_parser():
    csv_text = """Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID
2026-05-30,AAPL,AAPL,stock,long,,,,1,100,110,0,0,10,win,,,,momentum,Note,
"""
    source, trades = detect_and_parse(csv_text)
    assert source == "Journedge"
    assert len(trades) == 1
    assert trades[0]["symbol"] == "AAPL"


def test_parse_csv_line_handles_quoted_commas():
    cols = parse_csv_line('2026-05-30,AAPL,AAPL,stock,long,,,,1,100,110,0,0,10,win,,,,"momentum|gap","Note, with comma",')
    assert cols[18] == "momentum|gap"
    assert cols[19] == "Note, with comma"


def test_detect_and_parse_rejects_empty_csv():
    with pytest.raises(AppError):
        detect_and_parse("")


def test_parse_fidelity_invalid_header_raises():
    with pytest.raises(AppError):
        parse_fidelity("bad,data\n1,2,3")


def test_parse_journedge_defaults_invalid_fields():
    trades = parse_journedge(
        """Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID
2026-05-30,TSLA,TSLA,invalid,bad,,,,1,100,90,0,0,-10,,09:30,10:00,1:2,trend|setup,Review note,
"""
    )
    assert trades[0]["type"] == "option"
    assert trades[0]["direction"] == "long"
    assert trades[0]["status"] == "loss"
    assert trades[0]["tags"] == ["trend", "setup"]
