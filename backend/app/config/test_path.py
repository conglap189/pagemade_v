#!/usr/bin/env python3
"""Test path from app/config."""
import os

backend_config_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'config'))
print(f'Calculated path: {backend_config_dir}')
print(f'Exists: {os.path.exists(backend_config_dir)}')

from dotenv import load_dotenv
result = load_dotenv(os.path.join(backend_config_dir, '.env.local'))
print(f'Load result: {result}')
print(f'DATABASE_URL: {os.environ.get("DATABASE_URL")}')