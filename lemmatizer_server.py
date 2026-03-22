#!/usr/bin/env python3
"""
Lemmatization server for Vocab Helper extension
Uses TextBlob + manual verb/noun mappings
Run: python3 lemmatizer_server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

# Common irregular verbs mapping
IRREGULAR_VERBS = {
    # Past tense
    'went': 'go', 'went': 'go',
    'came': 'come', 'came': 'come',
    'ate': 'eat', 'eaten': 'eat',
    'drank': 'drink', 'drunk': 'drink',
    'ran': 'run',
    'saw': 'see', 'seen': 'see',
    'took': 'take', 'taken': 'take',
    'made': 'make',
    'said': 'say',
    'did': 'do', 'done': 'do',
    'gave': 'give', 'given': 'give',
    'found': 'find',
    'thought': 'think',
    'brought': 'bring',
    'began': 'begin', 'begun': 'begin',
    'broke': 'break', 'broken': 'break',
    'chose': 'choose', 'chosen': 'choose',
    'drew': 'draw', 'drawn': 'draw',
    'fell': 'fall', 'fallen': 'fall',
    'flew': 'fly', 'flown': 'fly',
    'knew': 'know', 'known': 'know',
    'wrote': 'write', 'written': 'write',
    'spoke': 'speak', 'spoken': 'speak',
    'spent': 'spend',
    'taught': 'teach',
    'understood': 'understand',
    'wore': 'wear', 'worn': 'wear',
    'sold': 'sell',
    'told': 'tell',
    'sent': 'send',
    'left': 'leave',
    'heard': 'hear',
    'held': 'hold',
    'kept': 'keep',
    'met': 'meet',
    'paid': 'pay',
    'put': 'put',
    'read': 'read',
    'rode': 'ride', 'ridden': 'ride',
    'said': 'say',
    'saw': 'see',
    'sold': 'sell',
    'sent': 'send',
    'set': 'set',
    'showed': 'show',
    'stood': 'stand',
    'swam': 'swim', 'swum': 'swim',
    'taught': 'teach',
    'threw': 'throw', 'thrown': 'throw',
    'told': 'tell',
    'understood': 'understand',
    'wore': 'wear', 'worn': 'wear',
    # -ing forms
    'going': 'go',
    'coming': 'come',
    'eating': 'eat',
    'drinking': 'drink',
    'running': 'run',
    'seeing': 'see',
    'taking': 'take',
    'making': 'make',
    'saying': 'say',
    'doing': 'do',
    'giving': 'give',
    'finding': 'find',
    'thinking': 'think',
    'bringing': 'bring',
    'beginning': 'begin',
    'breaking': 'break',
    'choosing': 'choose',
    'drawing': 'draw',
    'falling': 'fall',
    'flying': 'fly',
    'knowing': 'know',
    'writing': 'write',
    'speaking': 'speak',
    'spending': 'spend',
    'teaching': 'teach',
    'understanding': 'understand',
    'wearing': 'wear',
    'selling': 'sell',
    'telling': 'tell',
    'sending': 'send',
    'leaving': 'leave',
    'hearing': 'hear',
    'holding': 'hold',
    'keeping': 'keep',
    'meeting': 'meet',
    'paying': 'pay',
    'putting': 'put',
    'reading': 'read',
    'riding': 'ride',
    'showing': 'show',
    'standing': 'stand',
    'swimming': 'swim',
    'throwing': 'throw',
}

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'lemmatizer'})

@app.route('/lemmatize', methods=['POST'])
def lemmatize():
    """Lemmatize a word"""
    try:
        data = request.get_json()
        word = data.get('word', '').strip().lower()

        if not word:
            return jsonify({'error': 'No word provided'}), 400

        # Check irregular verbs first
        if word in IRREGULAR_VERBS:
            result = IRREGULAR_VERBS[word]
        else:
            # Use TextBlob for other words
            blob = TextBlob(word)
            lemmas = [w.lemmatize() for w in blob.words]
            result = lemmas[0] if lemmas else word

        return jsonify({
            'original': word,
            'lemma': result,
            'success': True
        })

    except Exception as e:
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

            # Check irregular verbs first
            if word in IRREGULAR_VERBS:
                result = IRREGULAR_VERBS[word]
            else:
                blob = TextBlob(word)
                lemmas = [w.lemmatize() for w in blob.words]
                result = lemmas[0] if lemmas else word

            results.append({
                'original': word,
                'lemma': result
            })

        return jsonify({
            'results': results,
            'success': True
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Lemmatizer Server Running")
    print("=" * 50)
    print("API Endpoints:")
    print("  GET  http://localhost:5555/health")
    print("  POST http://localhost:5555/lemmatize")
    print("  POST http://localhost:5555/lemmatize_batch")
    print("\nExample usage:")
    print('  curl -X POST http://localhost:5555/lemmatize \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"word": "running"}\'')
    print("=" * 50)

    app.run(host='localhost', port=5555, debug=False)
