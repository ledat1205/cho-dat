#!/usr/bin/env python3
"""
Preprocess vocabulary file to expand "/" separated entries
Converts: "as long as / so long as" → ["as long as", "so long as"]
"""

import json
import sys

def preprocess_vocab(input_file, output_file):
    """Load vocab, expand "/" entries, save to new file"""

    print(f"Loading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        vocab = json.load(f)

    print(f"Original entries: {len(vocab)}")

    # Expand entries with "/" separators
    expanded = []
    slash_count = 0

    for entry in vocab:
        vocab_text = entry.get('vocab', '')

        # Check if entry has "/" separator
        if ' / ' in vocab_text:
            # Split by " / "
            variations = vocab_text.split(' / ')
            slash_count += len(variations) - 1

            # Create separate entry for each variation
            for variation in variations:
                new_entry = entry.copy()
                new_entry['vocab'] = variation.strip()
                expanded.append(new_entry)
        else:
            # Keep entry as is
            expanded.append(entry)

    print(f"Expanded entries: {len(expanded)} (+{slash_count} from '/' splits)")
    print(f"New entries added: {slash_count}")

    # Sort by vocab alphabetically
    expanded.sort(key=lambda x: x.get('vocab', '').lower())

    # Save to output file
    print(f"Saving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(expanded, f, ensure_ascii=False, indent=2)

    print(f"✓ Done! Saved {len(expanded)} entries")

    # Show some examples
    print("\nExamples of expanded entries:")
    examples = [e for e in expanded if ' ' in e.get('vocab', '')][:5]
    for ex in examples:
        print(f"  - {ex['vocab']}")


if __name__ == '__main__':
    input_file = 'full_vocabs.json'
    output_file = 'full_vocabs_expanded.json'

    try:
        preprocess_vocab(input_file, output_file)
    except FileNotFoundError:
        print(f"Error: {input_file} not found")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: {input_file} is not valid JSON")
        sys.exit(1)
