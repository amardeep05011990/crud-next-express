import sys

print(sys.stdin)
for line in sys.stdin:
    print(f'Hello, {line.strip()}!')

print("hello\n")