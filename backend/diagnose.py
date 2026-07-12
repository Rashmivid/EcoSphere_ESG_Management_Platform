import sys
modules = [
    "app.core.config", "app.core.database", "app.models.models",
    "app.routers.auth", "app.routers.org", "app.routers.environmental",
    "app.routers.social", "app.routers.governance", "app.routers.gamification",
    "app.routers.scoring", "app.routers.reports", "app.routers.notifications",
    "app.main",
]
for m in modules:
    try:
        __import__(m)
        print("OK:", m)
    except Exception as e:
        print("FAILED:", m, "->", repr(e))
        break
print("DIAGNOSE DONE")
