import sys
import json

for line in sys.stdin:
    data = json.loads(line)
    result = {"message": f"Hello, {data['name']}"}
    print(json.dumps(result))
    sys.stdout.flush()
# print(sys.stdin)
# for line in sys.stdin:
#     print(line)