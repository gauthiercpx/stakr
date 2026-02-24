# import uuid6
#
# from app.models.portfolio import Portfolio
#
#
# def test_portfolio_columns():
#     cols = Portfolio.__table__.c
#     assert "id" in cols
#     assert "user_id" in cols
#     assert "name" in cols
#
#
# def test_id_default_is_callable():
#     default = Portfolio.__table__.c.id.default
#     # default may be a DefaultClause; check .arg or itself
#     arg = getattr(default, "arg", default)
#     assert callable(arg)
#     try:
#         assert arg == uuid6.uuid7 or callable(arg)
#     except Exception:
#         assert callable(arg)
