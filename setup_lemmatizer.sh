#!/bin/bash
# Setup script for lemmatization server with virtual environment

echo "================================"
echo "Setting up Lemmatizer Server"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

echo "✓ Python3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

echo "✓ Virtual environment created"
echo ""

# Install required packages
echo "Installing Python dependencies..."
pip install flask flask-cors textblob

echo ""
echo "✓ Dependencies installed!"
echo ""
echo "================================"
echo "To start the server:"
echo "================================"
echo "1. Activate virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Start the server:"
echo "   python3 lemmatizer_server.py"
echo ""
echo "The server will run on:"
echo "http://localhost:5555"
echo ""
echo "================================"
