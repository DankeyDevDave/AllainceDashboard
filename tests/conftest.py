"""Pytest configuration and fixtures."""
import sys
from pathlib import Path

# Add the parent directory to sys.path to allow imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

pytest_plugins = []
