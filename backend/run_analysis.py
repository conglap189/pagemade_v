#!/usr/bin/env python3
"""
Run the Basic Blocks filtering analysis
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, '/home/helios/ver1.1/backend')

# Import and run the analysis
from test_basic_blocks_filtering import main

if __name__ == "__main__":
    main()