#!/usr/bin/env python3
"""
Lemmatization server using NLTK WordNet
Provides accurate lemmatization for English words
Run: python3 lemmatizer_server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from nltk.corpus import wordnet

app = Flask(__name__)
CORS(app)

# Initialize NLTK data
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("Downloading NLTK data...")
    nltk.download('punkt_tab', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
    nltk.download('averaged_perceptron_tagger_eng', quiet=True)

lemmatizer = WordNetLemmatizer()

print("✓ NLTK WordNetLemmatizer initialized")

def get_wordnet_pos(treebank_tag):
    """Convert TreeBank POS tags to WordNet POS tags"""
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    return wordnet.NOUN

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'lemmatizer',
        'engine': 'nltk-wordnet'
    })

@app.route('/lemmatize', methods=['POST'])
def lemmatize():
    """Lemmatize a word using NLTK WordNet"""
    try:
        data = request.get_json()
        word = data.get('word', '').strip().lower()

        if not word:
            return jsonify({'error': 'No word provided'}), 400

        # Tokenize and tag
        tokens = word_tokenize(word)
        tagged = pos_tag(tokens)

        if tagged:
            token, pos_tag_str = tagged[0]
            wordnet_pos = get_wordnet_pos(pos_tag_str)
            lemma = lemmatizer.lemmatize(token, pos=wordnet_pos).lower()
        else:
            lemma = word
            pos_tag_str = 'UNKNOWN'

        return jsonify({
            'original': word,
            'lemma': lemma,
            'pos': pos_tag_str,
            'success': True
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        word = data.get('word', '') if 'data' in locals() else ''
        return jsonify({
            'error': str(e),
            'original': word,
            'lemma': word,
            'success': False
        }), 500

@app.route('/lemmatize_batch', methods=['POST'])
def lemmatize_batch():
    """Lemmatize multiple words at once"""
    try:
        data = request.get_json()
        words = data.get('words', [])

        if not isinstance(words, list):
            return jsonify({'error': 'words must be a list'}), 400

        results = []
        for word in words:
            word = word.strip().lower()
            if not word:
                continue

            # Tokenize and tag
            tokens = word_tokenize(word)
            tagged = pos_tag(tokens)

            if tagged:
                token, pos_tag_str = tagged[0]
                wordnet_pos = get_wordnet_pos(pos_tag_str)
                lemma = lemmatizer.lemmatize(token, pos=wordnet_pos).lower()
            else:
                lemma = word
                pos_tag_str = 'UNKNOWN'

            results.append({
                'original': word,
                'lemma': lemma,
                'pos': pos_tag_str
            })

        return jsonify({
            'results': results,
            'success': True
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze word - returns POS tags and lemma"""
    try:
        data = request.get_json()
        word = data.get('word', '').strip()

        if not word:
            return jsonify({'error': 'No word provided'}), 400

        # Tokenize and tag
        tokens = word_tokenize(word)
        tagged = pos_tag(tokens)

        analysis = {
            'word': word,
            'tokens': []
        }

        for token, pos_tag_str in tagged:
            wordnet_pos = get_wordnet_pos(pos_tag_str)
            lemma = lemmatizer.lemmatize(token, pos=wordnet_pos).lower()
            analysis['tokens'].append({
                'text': token,
                'pos': pos_tag_str,
                'lemma': lemma
            })

        analysis['success'] = True
        return jsonify(analysis)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Lemmatizer Server - NLTK WordNet")
    print("=" * 60)
    print("API Endpoints:")
    print("  GET  http://localhost:5555/health")
    print("  POST http://localhost:5555/lemmatize")
    print("  POST http://localhost:5555/lemmatize_batch")
    print("  POST http://localhost:5555/analyze")
    print("")
    print("Example usage:")
    print('  curl -X POST http://localhost:5555/lemmatize \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"word": "running"}\'')
    print("")
    print("Expected response:")
    print('  {"original":"running","lemma":"run","pos":"VBG","success":true}')
    print("=" * 60)
    print("✓ Server ready! Starting on http://localhost:5555")
    print("=" * 60)

    app.run(host='localhost', port=5555, debug=False)
