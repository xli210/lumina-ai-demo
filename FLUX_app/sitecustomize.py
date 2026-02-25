import os, sys

_base = os.path.dirname(sys.executable)
_dlls = os.path.join(_base, "DLLs")
if os.path.isdir(_dlls) and hasattr(os, "add_dll_directory"):
    os.add_dll_directory(_dlls)
