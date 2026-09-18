from utils import parse_json_safe

result = parse_json_safe('Here is the result: {"question": "test"} extra text')
print(result)