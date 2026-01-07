import os
import sys

# Add project directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

# Create production app
application = create_app('production')

if __name__ == "__main__":
    app.run()
